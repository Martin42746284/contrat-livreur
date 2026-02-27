import React, { useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Role, CINPhotos, PartyInfo, DistributorInfo } from '@/types/contract';
import PartyForm from '@/components/PartyForm';
import ArticlesSection from '@/components/ArticlesSection';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { generateContractPDF } from '@/utils/generatePDF';
import { Download, CheckCircle2, Shield, ArrowLeft, Scissors, ShoppingBag, ShieldCheck, Share2, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useContract } from '@/hooks/useContract';

const ContractPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roleFromUrl = searchParams.get('role') as Role | null;
  const [role, setRole] = useState<Role | null>(roleFromUrl);
  const [creating, setCreating] = useState(false);

  const contractId = id === 'new' ? null : id || null;
  const { contract, loading, saving, dbId, triggerSave, updateContract, updateParty, verifyCIN, createContract, validateContract } = useContract(contractId);

  const handleSelectRole = async (selectedRole: Role) => {
    if (id) {
      // Joining an existing contract
      setRole(selectedRole);
      navigate(`/contract/${id}?role=${selectedRole}`, { replace: true });
      return;
    }
    // Creating a new contract
    setCreating(true);
    const newId = await createContract(selectedRole);
    setCreating(false);
    if (newId) {
      setRole(selectedRole);
      navigate(`/contract/${newId}?role=${selectedRole}`, { replace: true });
    }
  };

  const computeStatus = useCallback(() => {
    if (contract.status === 'valide') return 'valide';
    if (contract.validationFournisseuse || contract.validationDistributrice) return 'en_attente';
    return 'brouillon';
  }, [contract]);

  const isPartyComplete = (info: PartyInfo, isDistrib = false) => {
    const base = info.nomComplet && info.cin;
    if (isDistrib) return base && (info as DistributorInfo).nomPage;
    return base;
  };

  const isCINValid = (photos: CINPhotos) =>
    photos.rectoStatus === 'valid' && photos.versoStatus === 'valid';

  const allCINValid =
    isCINValid(contract.fournisseuse.cinPhotos) &&
    isCINValid(contract.distributrice.cinPhotos);

  const allFieldsComplete =
    isPartyComplete(contract.fournisseuse) &&
    isPartyComplete(contract.distributrice, true) &&
    contract.lieu &&
    contract.date &&
    (contract.produits.robes || contract.produits.jupes || contract.produits.chemises || contract.produits.ensembles || contract.produits.autres) &&
    (contract.paiement.mvola || contract.paiement.orangeMoney || contract.paiement.airtelMoney);

  const canValidate =
    allFieldsComplete &&
    allCINValid &&
    contract.validationFournisseuse &&
    contract.validationDistributrice &&
    contract.status !== 'valide';

  const handleValidate = () => {
    if (!canValidate) return;
    validateContract();
  };

  const handleDownload = () => {
    generateContractPDF(contract);
    toast.success('PDF téléchargé !');
  };

  const handleShareLink = () => {
    if (!dbId) return;
    const otherRole = role === 'fournisseuse' ? 'distributrice' : 'fournisseuse';
    const link = `${window.location.origin}/contract/${dbId}?role=${otherRole}`;
    navigator.clipboard.writeText(link);
    toast.success('Lien copié !', {
      description: `Envoyez ce lien à la ${otherRole === 'fournisseuse' ? 'Fournisseuse' : 'Distributrice'} pour qu'elle remplisse sa partie.`,
    });
  };

  const isReadOnly = contract.status === 'valide';
  const displayStatus = computeStatus();
  const isCrossCheckChecked = role === 'fournisseuse' ? contract.validationFournisseuse : contract.validationDistributrice;

  const isMyInfoComplete = role === 'fournisseuse'
    ? isPartyComplete(contract.fournisseuse) && isCINValid(contract.fournisseuse.cinPhotos)
    : isPartyComplete(contract.distributrice, true) && isCINValid(contract.distributrice.cinPhotos);

  // Check if initial fields usually filled by creator are complete
  const isBaseInfoComplete = !!(contract.lieu && contract.date);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  // Role selection screen
  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-8 text-center animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-6">
              <ShieldCheck size={16} className="text-accent" />
              <span className="text-sm font-medium text-foreground">Contrat sécurisé avec vérification CIN</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Contrat de Vente en Ligne
            </h1>
            <p className="text-muted-foreground">
              Sélectionnez votre rôle pour {id ? 'accéder au' : 'créer un nouveau'} contrat.<br />
              <span className="text-xs">Les photos CIN seront vérifiées automatiquement par IA.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectRole('fournisseuse')}
              disabled={creating}
              className="group p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-contract-lg transition-all duration-300 text-left space-y-3 disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-lg gradient-navy flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
                <Scissors size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Fournisseuse</h3>
              <p className="text-sm text-muted-foreground">Couturière qui confectionne les articles</p>
            </button>

            <button
              onClick={() => handleSelectRole('distributrice')}
              disabled={creating}
              className="group p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-contract-lg transition-all duration-300 text-left space-y-3 disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center text-accent-foreground group-hover:scale-105 transition-transform">
                <ShoppingBag size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Distributrice</h3>
              <p className="text-sm text-muted-foreground">Vendeuse en ligne via boutique virtuelle</p>
            </button>
          </div>

          {creating && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" size={16} />
              Création du contrat...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setRole(null); navigate('/'); }}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground leading-tight">Contrat de Vente</h1>
              <p className="text-xs text-muted-foreground">
                Connecté en tant que : <span className="font-semibold capitalize">{role === 'fournisseuse' ? 'Fournisseuse' : 'Distributrice'}</span>
                {saving && <span className="ml-2 text-accent">• Sauvegarde...</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dbId && (
              <Button variant="outline" size="sm" onClick={handleShareLink} className="text-xs" disabled={!isCrossCheckChecked}>
                <Share2 size={14} className="mr-1" />
                Partager
              </Button>
            )}
            <StatusBadge status={displayStatus} />
          </div>
        </div>
      </header>

      {/* Share banner */}
      {dbId && !isReadOnly && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              📤 Partagez le lien avec {role === 'fournisseuse' ? 'la Distributrice' : 'la Fournisseuse'} pour qu'elle remplisse sa partie du contrat.
            </p>
            <Button variant="outline" size="sm" onClick={handleShareLink} className="shrink-0 text-xs" disabled={!isCrossCheckChecked}>
              <Copy size={14} className="mr-1" />
              Copier le lien
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Fournisseuse section */}
        <PartyForm
          type="fournisseuse"
          data={contract.fournisseuse}
          onChange={partial => updateParty('fournisseuse', partial)}
          onSave={triggerSave}
          onVerifyCIN={(side, img) => verifyCIN('fournisseuse', side, img)}
          readOnly={isReadOnly || role !== 'fournisseuse'}
        />

        {/* Distributrice section */}
        <PartyForm
          type="distributrice"
          data={contract.distributrice}
          onChange={partial => updateParty('distributrice', partial)}
          onSave={triggerSave}
          onVerifyCIN={(side, img) => verifyCIN('distributrice', side, img)}
          readOnly={isReadOnly || role !== 'distributrice'}
        />

        {/* Articles */}
        <ArticlesSection data={contract} onUpdate={updateContract} onSave={triggerSave} readOnly={isReadOnly} />

        {/* CIN verification summary */}
        {!isReadOnly && (
          <div className={`rounded-xl border p-4 space-y-2 ${allCINValid ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck size={16} className={allCINValid ? 'text-success' : 'text-warning'} />
              Vérification d'identité
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className={isCINValid(contract.fournisseuse.cinPhotos) ? 'text-success' : 'text-muted-foreground'}>
                  {isCINValid(contract.fournisseuse.cinPhotos) ? '✓' : '○'} CIN Fournisseuse
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={isCINValid(contract.distributrice.cinPhotos) ? 'text-success' : 'text-muted-foreground'}>
                  {isCINValid(contract.distributrice.cinPhotos) ? '✓' : '○'} CIN Distributrice
                </span>
              </div>
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

            {role === 'fournisseuse' && (
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors">
                <Checkbox
                  checked={contract.validationFournisseuse}
                  onCheckedChange={v => updateContract({ validationFournisseuse: !!v })}
                  disabled={!isMyInfoComplete || !isBaseInfoComplete}
                />
                <div>
                  <p className="text-sm font-medium">Je confirme que les informations de la Distributrice sont exactes</p>
                  <p className="text-xs text-muted-foreground mt-1">En cochant cette case, vous attestez avoir vérifié les informations de la Distributrice</p>
                </div>
              </label>
            )}

            {role === 'distributrice' && (
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors">
                <Checkbox
                  checked={contract.validationDistributrice}
                  onCheckedChange={v => updateContract({ validationDistributrice: !!v })}
                  disabled={!isMyInfoComplete || !isBaseInfoComplete}
                />
                <div>
                  <p className="text-sm font-medium">Je confirme que les informations de la Fournisseuse sont exactes</p>
                  <p className="text-xs text-muted-foreground mt-1">En cochant cette case, vous attestez avoir vérifié les informations de la Fournisseuse</p>
                </div>
              </label>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={14} />
              <span>
                {contract.validationFournisseuse && contract.validationDistributrice
                  ? 'Les deux parties ont confirmé. Le contrat peut être validé.'
                  : contract.validationFournisseuse
                    ? 'En attente de la confirmation de la Distributrice.'
                    : contract.validationDistributrice
                      ? 'En attente de la confirmation de la Fournisseuse.'
                      : 'Les deux parties doivent confirmer les informations pour valider le contrat.'}
              </span>
            </div>
          </div>
        )}

        {/* Dates info when validated */}
        {isReadOnly && contract.dateValidation && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-sm space-y-1">
            <p className="font-medium text-success flex items-center gap-2">
              <CheckCircle2 size={16} /> Contrat validé — Identité vérifiée
            </p>
            <p className="text-muted-foreground">Créé le : {new Date(contract.dateCreation).toLocaleDateString('fr-FR')}</p>
            <p className="text-muted-foreground">Validé le : {new Date(contract.dateValidation).toLocaleDateString('fr-FR')}</p>
          </div>
        )}
      </main>

      {/* Footer actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="text-xs">
            {!isReadOnly && !allFieldsComplete && (
              <p className="text-muted-foreground">Remplissez tous les champs obligatoires</p>
            )}
            {!isReadOnly && allFieldsComplete && !allCINValid && (
              <p className="text-destructive">Les CIN recto/verso des deux parties doivent être vérifiées</p>
            )}
            {!isReadOnly && allFieldsComplete && allCINValid && !canValidate && (
              <p className="text-warning">En attente de la confirmation des deux parties</p>
            )}
            {isReadOnly && <p className="text-success font-medium">Contrat validé ✓</p>}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {!isReadOnly && (
              <Button
                onClick={handleValidate}
                disabled={!canValidate}
                className="gradient-navy text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 size={16} className="mr-1.5" />
                Valider le contrat
              </Button>
            )}
            <Button
              onClick={handleDownload}
              disabled={contract.status !== 'valide'}
              variant="outline"
              className={contract.status === 'valide' ? 'border-accent text-accent-foreground hover:bg-accent/10' : ''}
            >
              <Download size={16} className="mr-1.5" />
              Télécharger PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPage;
