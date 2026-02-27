import React, { useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DeliveryRole, DeliveryPartieType, CINVerificationStatus } from '@/types/deliveryContract';
import DeliveryPartyForm from '@/components/delivery/DeliveryPartyForm';
import DeliveryArticlesSection from '@/components/delivery/DeliveryArticlesSection';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateDeliveryContractPDF } from '@/utils/generateDeliveryPDF';
import {
  Download, CheckCircle2, Shield, ArrowLeft, ShieldCheck, Share2, Copy, Loader2,
  Truck, Package, AlertTriangle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryContract } from '@/hooks/useDeliveryContract';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DeliveryContractPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roleFromUrl = searchParams.get('role') as DeliveryRole | null;
  const typePartieFromUrl = searchParams.get('type') as DeliveryPartieType | null;
  const [role, setRole] = useState<DeliveryRole | null>(roleFromUrl);
  const [creating, setCreating] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [terminateMotif, setTerminateMotif] = useState('');
  const [terminateFauteGrave, setTerminateFauteGrave] = useState(false);

  const {
    contract, loading, saving, triggerSave, updateField, verifyCIN,
    createContract, validateContract, terminateContract
  } = useDeliveryContract(id || null);

  const handleSelectRole = async (selectedRole: DeliveryRole, typePartie?: DeliveryPartieType) => {
    if (id) {
      setRole(selectedRole);
      navigate(`/delivery/${id}?role=${selectedRole}`, { replace: true });
      return;
    }
    if (!typePartie) return;
    setCreating(true);
    const newId = await createContract(typePartie);
    setCreating(false);
    if (newId) {
      setRole(selectedRole);
      navigate(`/delivery/${newId}?role=${selectedRole}`, { replace: true });
    }
  };

  const isCINValid = (status: CINVerificationStatus) => status === 'valid';

  const allCINValid = contract
    ? isCINValid(contract.partie_cin_recto_status) &&
      isCINValid(contract.partie_cin_verso_status) &&
      isCINValid(contract.livreur_cin_recto_status) &&
      isCINValid(contract.livreur_cin_verso_status)
    : false;

  const allFieldsComplete = contract
    ? contract.partie_nom_complet && contract.partie_cin &&
      contract.livreur_nom_complet && contract.livreur_cin &&
      contract.lieu && contract.date_contrat
    : false;

  const canValidate = contract
    ? contract.validation_partie && contract.validation_livreur &&
      contract.status === 'en_attente'
    : false;

  const handleValidateWithCheck = async () => {
    if (!canValidate) return;
    if (!allFieldsComplete || !allCINValid) {
      toast.error('Veuillez remplir tous les champs et vérifier les CIN des deux parties avant de valider.');
      return;
    }
    await validateContract();
  };

  const isReadOnly = contract?.status === 'valide' || contract?.status === 'resilie';
  const isCrossCheckChecked = role === 'partie' ? contract?.validation_partie : contract?.validation_livreur;

  const isMyInfoComplete = role === 'partie'
    ? !!(contract?.partie_nom_complet && contract?.partie_cin && isCINValid(contract?.partie_cin_recto_status) && isCINValid(contract?.partie_cin_verso_status))
    : !!(contract?.livreur_nom_complet && contract?.livreur_cin && isCINValid(contract?.livreur_cin_recto_status) && isCINValid(contract?.livreur_cin_verso_status));

  const isBaseInfoComplete = !!(contract?.lieu && contract?.date_contrat);

  const handleShareLink = () => {
    if (!contract) return;
    const otherRole = role === 'partie' ? 'livreur' : 'partie';
    const link = `${window.location.origin}/delivery/${contract.id}?role=${otherRole}`;
    navigator.clipboard.writeText(link);
    toast.success('Lien copié !', {
      description: `Envoyez ce lien au ${otherRole === 'partie' ? (contract.type_partie === 'fournisseur' ? 'Fournisseur' : 'Distributeur') : 'Livreur'}.`,
    });
  };

  const handleTerminate = async () => {
    if (!terminateMotif.trim()) {
      toast.error('Veuillez préciser le motif');
      return;
    }
    await terminateContract(terminateMotif, terminateFauteGrave);
    setTerminateDialogOpen(false);
  };

  const statusDisplay = contract?.status || 'en_attente';

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  // Role selection
  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-8 text-center animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-6">
              <Truck size={16} className="text-accent" />
              <span className="text-sm font-medium text-foreground">Contrat Livreur sécurisé</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Contrat de Livraison
            </h1>
            <p className="text-muted-foreground">
              Sélectionnez votre rôle pour {id ? 'accéder au' : 'créer un nouveau'} contrat livreur.
            </p>
          </div>

          {id ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectRole('partie')}
                className="group p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-contract-lg transition-all duration-300 text-left space-y-3"
              >
                <div className="w-12 h-12 rounded-lg gradient-navy flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
                  <Package size={24} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">Partie principale</h3>
                <p className="text-sm text-muted-foreground">Fournisseur ou Distributeur</p>
              </button>
              <button
                onClick={() => handleSelectRole('livreur')}
                className="group p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-contract-lg transition-all duration-300 text-left space-y-3"
              >
                <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center text-accent-foreground group-hover:scale-105 transition-transform">
                  <Truck size={24} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">Livreur</h3>
                <p className="text-sm text-muted-foreground">Responsable de l'acheminement</p>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Vous êtes :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSelectRole('partie', 'fournisseur')}
                  disabled={creating}
                  className="group p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-contract-lg transition-all duration-300 text-left space-y-3 disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-lg gradient-navy flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
                    <Package size={24} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Fournisseur</h3>
                  <p className="text-sm text-muted-foreground">Créer un contrat avec un livreur</p>
                </button>
                <button
                  onClick={() => handleSelectRole('partie', 'distributeur')}
                  disabled={creating}
                  className="group p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-contract-lg transition-all duration-300 text-left space-y-3 disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center text-accent-foreground group-hover:scale-105 transition-transform">
                    <Package size={24} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Distributeur</h3>
                  <p className="text-sm text-muted-foreground">Créer un contrat avec un livreur</p>
                </button>
              </div>
            </div>
          )}

          {creating && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" size={16} />
              Création du contrat...
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground">
            <ArrowLeft size={14} className="mr-1" /> Retour
          </Button>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Contrat introuvable</p>
      </div>
    );
  }

  const partieLabel = contract.type_partie === 'fournisseur' ? 'Fournisseur' : 'Distributeur';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground leading-tight">Contrat Livreur</h1>
              <p className="text-xs text-muted-foreground">
                N° {contract.contract_number} · {role === 'partie' ? partieLabel : 'Livreur'}
                {saving && <span className="ml-2 text-accent">• Sauvegarde...</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contract.id && (
              <Button variant="outline" size="sm" onClick={handleShareLink} className="text-xs" disabled={!isCrossCheckChecked}>
                <Share2 size="14" className="mr-1" /> Partager
              </Button>
            )}
            <StatusBadge status={contract.status} />
          </div>
        </div>
      </header>

      {/* Résiliation banner */}
      {contract.status === 'resilie' && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-1">
            <p className="text-sm font-semibold text-destructive flex items-center gap-2">
              <XCircle size={16} /> Contrat résilié
            </p>
            <p className="text-xs text-muted-foreground">Motif : {contract.motif_resiliation}</p>
            {contract.terminated_at && (
              <p className="text-xs text-muted-foreground">Date : {new Date(contract.terminated_at).toLocaleDateString('fr-FR')}</p>
            )}
          </div>
        </div>
      )}

      {/* Share banner */}
      {contract.status === 'en_attente' && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              📤 Partagez le lien avec le {role === 'partie' ? 'Livreur' : partieLabel} pour qu'il remplisse sa partie.
            </p>
            <Button variant="outline" size="sm" onClick={handleShareLink} className="shrink-0 text-xs" disabled={!isCrossCheckChecked}>
              <Copy size={14} className="mr-1" /> Copier le lien
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-32">
        <DeliveryPartyForm
          who="partie"
          data={contract}
          onUpdate={updateField}
          onSave={triggerSave}
          onVerifyCIN={verifyCIN}
          readOnly={isReadOnly || role !== 'partie'}
        />

        <DeliveryPartyForm
          who="livreur"
          data={contract}
          onUpdate={updateField}
          onSave={triggerSave}
          onVerifyCIN={verifyCIN}
          readOnly={isReadOnly || role !== 'livreur'}
        />

        <DeliveryArticlesSection />

        {/* Lieu et date */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-fade-in shadow-contract">
          <h3 className="font-display text-base font-semibold text-foreground">📍 Lieu et date</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Lieu *</Label>
              <Input
                value={contract.lieu}
                onChange={e => updateField({ lieu: e.target.value })}
                onBlur={triggerSave}
                disabled={isReadOnly}
                placeholder="Ville ou commune"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={contract.date_contrat}
                onChange={e => updateField({ date_contrat: e.target.value })}
                onBlur={triggerSave}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>

        {/* CIN verification summary */}
        {!isReadOnly && (
          <div className={`rounded-xl border p-4 space-y-2 ${allCINValid ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck size={16} className={allCINValid ? 'text-success' : 'text-warning'} />
              Vérification d'identité
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <span className={isCINValid(contract.partie_cin_recto_status) && isCINValid(contract.partie_cin_verso_status) ? 'text-success' : 'text-muted-foreground'}>
                {isCINValid(contract.partie_cin_recto_status) && isCINValid(contract.partie_cin_verso_status) ? '✓' : '○'} CIN {partieLabel}
              </span>
              <span className={isCINValid(contract.livreur_cin_recto_status) && isCINValid(contract.livreur_cin_verso_status) ? 'text-success' : 'text-muted-foreground'}>
                {isCINValid(contract.livreur_cin_recto_status) && isCINValid(contract.livreur_cin_verso_status) ? '✓' : '○'} CIN Livreur
              </span>
            </div>
          </div>
        )}

        {/* Cross validation */}
        {!isReadOnly && (
          <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6 space-y-4 animate-fade-in">
            <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 size={20} className="text-accent" />
              Vérification croisée
            </h3>

            {role === 'partie' && (
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors">
                <Checkbox
                  checked={contract.validation_partie}
                  onCheckedChange={v => updateField({ validation_partie: !!v })}
                  disabled={!isMyInfoComplete || !isBaseInfoComplete}
                />
                <div>
                  <p className="text-sm font-medium">Je confirme que les informations du Livreur sont exactes</p>
                  <p className="text-xs text-muted-foreground mt-1">En cochant, vous attestez avoir vérifié les informations du Livreur</p>
                </div>
              </label>
            )}

            {role === 'livreur' && (
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors">
                <Checkbox
                  checked={contract.validation_livreur}
                  onCheckedChange={v => updateField({ validation_livreur: !!v })}
                  disabled={!isMyInfoComplete || !isBaseInfoComplete}
                />
                <div>
                  <p className="text-sm font-medium">Je confirme que les informations du {partieLabel} sont exactes</p>
                  <p className="text-xs text-muted-foreground mt-1">En cochant, vous attestez avoir vérifié les informations du {partieLabel}</p>
                </div>
              </label>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={14} />
              <span>
                {contract.validation_partie && contract.validation_livreur
                  ? 'Les deux parties ont confirmé. Le contrat peut être validé.'
                  : contract.validation_partie
                    ? 'En attente de la confirmation du Livreur.'
                    : contract.validation_livreur
                      ? `En attente de la confirmation du ${partieLabel}.`
                      : 'Les deux parties doivent confirmer pour valider le contrat.'}
              </span>
            </div>
          </div>
        )}

        {/* Validated info */}
        {contract.status === 'valide' && contract.validated_at && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-sm space-y-1">
            <p className="font-medium text-success flex items-center gap-2">
              <CheckCircle2 size={16} /> Contrat validé — Identité vérifiée
            </p>
            <p className="text-muted-foreground">N° {contract.contract_number}</p>
            <p className="text-muted-foreground">Validé le : {new Date(contract.validated_at).toLocaleDateString('fr-FR')}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="text-xs">
            {contract.status === 'en_attente' && !allFieldsComplete && (
              <p className="text-muted-foreground">Remplissez tous les champs obligatoires</p>
            )}
            {contract.status === 'en_attente' && allFieldsComplete && !allCINValid && (
              <p className="text-destructive">CIN recto/verso des deux parties requis</p>
            )}
            {contract.status === 'en_attente' && allFieldsComplete && allCINValid && !canValidate && (
              <p className="text-warning">En attente de la confirmation des deux parties</p>
            )}
            {contract.status === 'valide' && <p className="text-success font-medium">Contrat validé ✓</p>}
            {contract.status === 'resilie' && <p className="text-destructive font-medium">Contrat résilié</p>}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {contract.status === 'valide' && role === 'partie' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setTerminateDialogOpen(true)}
                className="text-xs"
              >
                <AlertTriangle size={14} className="mr-1" /> Résilier
              </Button>
            )}
            {contract.status === 'en_attente' && (
              <Button
                onClick={handleValidateWithCheck}
                disabled={!canValidate}
                className="gradient-navy text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 size={16} className="mr-1.5" /> Valider
              </Button>
            )}
            <Button
              onClick={() => generateDeliveryContractPDF(contract)}
              disabled={contract.status !== 'valide' && !(contract.validation_partie && contract.validation_livreur)}
              variant="outline"
              className={(contract.status === 'valide' || (contract.validation_partie && contract.validation_livreur)) ? 'border-accent text-accent-foreground hover:bg-accent/10' : ''}
            >
              <Download size={16} className="mr-1.5" /> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Terminate dialog */}
      <Dialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-destructive" />
              Résilier le contrat
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le contrat sera archivé.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Motif de résiliation *</Label>
              <Input
                value={terminateMotif}
                onChange={e => setTerminateMotif(e.target.value)}
                placeholder="Décrivez le motif..."
              />
            </div>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <Checkbox
                checked={terminateFauteGrave}
                onCheckedChange={v => setTerminateFauteGrave(!!v)}
              />
              <div>
                <p className="text-sm font-medium text-destructive">Faute grave</p>
                <p className="text-xs text-muted-foreground">Le livreur sera ajouté à la liste noire et ne pourra plus créer de contrat sans validation admin</p>
              </div>
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTerminateDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleTerminate}>Confirmer la résiliation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryContractPage;
