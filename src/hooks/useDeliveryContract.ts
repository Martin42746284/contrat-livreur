import { useState, useCallback, useEffect, useRef } from 'react';
import { DeliveryContractData, DeliveryPartieType, DeliveryRole, CINVerificationStatus } from '@/types/deliveryContract';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDeliveryContract(contractId: string | null) {
  const [contract, setContract] = useState<DeliveryContractData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load
  useEffect(() => {
    if (!contractId) return;
    setLoading(true);
    supabase
      .from('delivery_contracts')
      .select('*')
      .eq('id', contractId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error('Contrat livreur introuvable');
          setLoading(false);
          return;
        }
        setContract(data as unknown as DeliveryContractData);
        setLoading(false);
      });
  }, [contractId]);

  // Realtime
  useEffect(() => {
    if (!contractId) return;
    const channel = supabase
      .channel(`delivery-${contractId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'delivery_contracts',
        filter: `id=eq.${contractId}`,
      }, (payload) => {
        setContract(payload.new as unknown as DeliveryContractData);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [contractId]);

  // Save
  const saveToDb = useCallback(async (data: Partial<DeliveryContractData>, id: string) => {
    setSaving(true);
    const { id: _id, contract_number: _cn, created_at: _ca, ...rest } = data as any;
    await supabase.from('delivery_contracts').update(rest).eq('id', id);
    setSaving(false);
  }, []);

  const triggerSave = useCallback(() => {
    if (contract) {
      saveToDb(contract, contract.id);
    }
  }, [contract, saveToDb]);

  const updateField = useCallback(async (partial: Partial<DeliveryContractData>, shouldSave = false) => {
    setContract(prev => {
      if (!prev || prev.status === 'valide' || prev.status === 'resilie') return prev;
      return { ...prev, ...partial };
    });

    if (shouldSave && contractId) {
      setSaving(true);
      await supabase.from('delivery_contracts').update(partial).eq('id', contractId);
      setSaving(false);
    }
  }, [contractId]);

  const addAuditLog = useCallback(async (contractId: string, action: string, details?: string) => {
    await supabase.from('delivery_audit_log').insert({
      contract_id: contractId,
      action,
      details,
    });
  }, []);

  const verifyCIN = useCallback(async (
    who: 'partie' | 'livreur',
    side: 'recto' | 'verso',
    imageBase64: string
  ) => {
    const statusKey = `${who}_cin_${side}_status` as keyof DeliveryContractData;
    const photoKey = `${who}_cin_${side}` as keyof DeliveryContractData;

    setContract(prev => prev ? { ...prev, [statusKey]: 'verifying' as CINVerificationStatus } : prev);

    try {
      const { data, error } = await supabase.functions.invoke('verify-cin', {
        body: { imageBase64 },
      });
      if (error) throw error;
      const isValid = data?.valid === true;

      setContract(prev => {
        if (!prev) return prev;
        const next = {
          ...prev,
          [statusKey]: (isValid ? 'valid' : 'invalid') as CINVerificationStatus,
        };
        saveToDb(next, prev.id);
        return next;
      });

      if (isValid) toast.success(`CIN ${side} vérifiée`);
      else toast.error(`CIN ${side} non valide`, { description: data?.reason });
    } catch {
      setContract(prev => prev ? { ...prev, [statusKey]: 'invalid' as CINVerificationStatus } : prev);
      toast.error('Erreur de vérification CIN');
    }
  }, [saveToDb]);

  const createContract = useCallback(async (typePartie: DeliveryPartieType): Promise<string | null> => {
    const { data: row, error } = await supabase
      .from('delivery_contracts')
      .insert({ type_partie: typePartie })
      .select('*')
      .single();

    if (error || !row) {
      toast.error('Erreur lors de la création');
      return null;
    }
    const c = row as unknown as DeliveryContractData;
    setContract(c);

    await addAuditLog(c.id, 'creation', `Contrat livreur créé par ${typePartie}`);
    return c.id;
  }, [addAuditLog]);

  const checkBlacklist = useCallback(async (cin: string): Promise<boolean> => {
    const { data } = await supabase
      .from('delivery_blacklist')
      .select('*')
      .eq('livreur_cin', cin)
      .eq('admin_cleared', false);
    return (data && data.length > 0) || false;
  }, []);

  const validateContract = useCallback(async () => {
    if (!contract) return;

    // Check blacklist
    const isBlacklisted = await checkBlacklist(contract.livreur_cin);
    if (isBlacklisted) {
      toast.error('Ce livreur est sur liste noire', {
        description: 'Validation admin requise pour créer un contrat avec ce livreur.',
      });
      return;
    }

    const now = new Date().toISOString();
    const update = { status: 'valide' as const, validated_at: now };

    await supabase.from('delivery_contracts').update(update).eq('id', contract.id);
    setContract(prev => prev ? { ...prev, ...update } : prev);
    await addAuditLog(contract.id, 'validation', 'Contrat validé par les deux parties');
    toast.success('Contrat livreur validé !');
  }, [contract, checkBlacklist, addAuditLog]);

  const terminateContract = useCallback(async (motif: string, isFauteGrave: boolean) => {
    if (!contract) return;
    const now = new Date().toISOString();
    const update = {
      status: 'resilie' as const,
      motif_resiliation: motif,
      terminated_at: now,
    };

    await supabase.from('delivery_contracts').update(update).eq('id', contract.id);
    setContract(prev => prev ? { ...prev, ...update } : prev);

    await addAuditLog(contract.id, 'resiliation', `Motif: ${motif}${isFauteGrave ? ' (faute grave)' : ''}`);

    if (isFauteGrave) {
      await supabase.from('delivery_blacklist').insert({
        livreur_cin: contract.livreur_cin,
        livreur_nom: contract.livreur_nom_complet,
        contract_id: contract.id,
        reason: motif,
      });
      await addAuditLog(contract.id, 'blacklist', `Livreur ${contract.livreur_nom_complet} ajouté à la liste noire`);
    }

    toast.success('Contrat résilié');
  }, [contract, addAuditLog]);

  return {
    contract,
    loading,
    saving,
    triggerSave,
    updateField,
    verifyCIN,
    createContract,
    validateContract,
    terminateContract,
    checkBlacklist,
  };
}
