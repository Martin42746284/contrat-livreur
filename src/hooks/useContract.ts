import { useState, useCallback, useEffect, useRef } from 'react';
import { ContractData, initialContractData, PartyInfo, DistributorInfo, Role } from '@/types/contract';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useContract(contractId: string | null) {
  const [contract, setContract] = useState<ContractData>({ ...initialContractData });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dbId, setDbId] = useState<string | null>(contractId);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load contract from DB
  useEffect(() => {
    if (!contractId) return;
    setLoading(true);
    supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error('Contrat introuvable');
          setLoading(false);
          return;
        }
        setContract(data.data as unknown as ContractData);
        setDbId(data.id);
        setLoading(false);
      });
  }, [contractId]);

  // Realtime subscription
  useEffect(() => {
    if (!dbId) return;
    const channel = supabase
      .channel(`contract-${dbId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'contracts',
        filter: `id=eq.${dbId}`,
      }, (payload) => {
        const newData = (payload.new as any).data as ContractData;
        setContract(newData);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [dbId]);

  // Save to DB
  const saveToDb = useCallback(async (data: ContractData, id: string) => {
    setSaving(true);
    await supabase.from('contracts').update({ data: data as any }).eq('id', id);
    setSaving(false);
  }, []);

  const triggerSave = useCallback(() => {
    if (dbId) {
      saveToDb(contract, dbId);
    }
  }, [dbId, contract, saveToDb]);

  const updateContract = useCallback(async (partial: Partial<ContractData>, shouldSave = false) => {
    if (shouldSave && dbId) {
      setSaving(true);
      const { data: latest, error } = await supabase
        .from('contracts')
        .select('data')
        .eq('id', dbId)
        .single();

      if (!error && latest) {
        const currentData = (latest.data as unknown as ContractData);
        const next = { ...currentData, ...partial };
        await supabase.from('contracts').update({ data: next as any }).eq('id', dbId);
        setContract(next);
      } else {
        // Fallback to local merge if fetch fails
        setContract(prev => {
          const next = { ...prev, ...partial };
          saveToDb(next, dbId);
          return next;
        });
      }
      setSaving(false);
    } else {
      setContract(prev => {
        if (prev.status === 'valide') return prev;
        return { ...prev, ...partial };
      });
    }
  }, [dbId, saveToDb]);

  const updateParty = useCallback((party: 'fournisseuse' | 'distributrice', partial: Partial<PartyInfo> | Partial<DistributorInfo>) => {
    setContract(prev => {
      if (prev.status === 'valide') return prev;
      return {
        ...prev,
        [party]: { ...prev[party], ...partial },
      };
    });
  }, []);

  const verifyCIN = useCallback(async (party: 'fournisseuse' | 'distributrice', side: 'recto' | 'verso', imageBase64: string) => {
    setContract(prev => ({
      ...prev,
      [party]: {
        ...prev[party],
        cinPhotos: {
          ...prev[party].cinPhotos,
          [`${side}Status`]: 'verifying',
          [`${side}Error`]: null,
        },
      },
    }));

    try {
      const { data, error } = await supabase.functions.invoke('verify-cin', {
        body: { imageBase64 },
      });

      if (error) throw error;
      const isValid = data?.valid === true;

      setContract(prev => {
        const next = {
          ...prev,
          [party]: {
            ...prev[party],
            cinPhotos: {
              ...prev[party].cinPhotos,
              [`${side}Status`]: isValid ? 'valid' : 'invalid',
              [`${side}Error`]: isValid ? null : (data?.reason || 'La photo fournie n\'est pas une CIN valide'),
            },
          },
        };
        if (dbId) saveToDb(next, dbId);
        return next;
      });

      if (isValid) toast.success(`CIN ${side} vérifiée avec succès`);
      else toast.error(`CIN ${side} non valide`, { description: data?.reason });
    } catch (err) {
      console.error('CIN verification error:', err);
      setContract(prev => {
        const next = {
          ...prev,
          [party]: {
            ...prev[party],
            cinPhotos: {
              ...prev[party].cinPhotos,
              [`${side}Status`]: 'invalid',
              [`${side}Error`]: 'Erreur lors de la vérification. Veuillez réessayer.',
            },
          },
        };
        if (dbId) saveToDb(next, dbId);
        return next;
      });
      toast.error('Erreur de vérification CIN');
    }
  }, [dbId, saveToDb]);

  const createContract = useCallback(async (role: Role): Promise<string | null> => {
    const data = { ...initialContractData };
    const { data: row, error } = await supabase
      .from('contracts')
      .insert({ data: data as any })
      .select('id')
      .single();
    if (error || !row) {
      toast.error('Erreur lors de la création du contrat');
      return null;
    }
    setDbId(row.id);
    setContract(data);
    return row.id;
  }, []);

  const validateContract = useCallback(() => {
    setContract(prev => {
      const next = {
        ...prev,
        status: 'valide' as const,
        dateValidation: new Date().toISOString(),
      };
      if (dbId) saveToDb(next, dbId);
      return next;
    });
    toast.success('Contrat validé avec succès !', {
      description: 'Le contrat est maintenant définitif et peut être téléchargé.',
    });
  }, [dbId, saveToDb]);

  return {
    contract,
    loading,
    saving,
    dbId,
    triggerSave,
    updateContract,
    updateParty,
    verifyCIN,
    createContract,
    validateContract,
  };
}
