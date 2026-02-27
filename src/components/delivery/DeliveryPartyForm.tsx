import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CINUpload from '@/components/CINUpload';
import { DeliveryContractData, CINVerificationStatus } from '@/types/deliveryContract';

interface DeliveryPartyFormProps {
  who: 'partie' | 'livreur';
  data: DeliveryContractData;
  onUpdate: (partial: Partial<DeliveryContractData>) => void;
  onSave?: () => void;
  onVerifyCIN: (who: 'partie' | 'livreur', side: 'recto' | 'verso', img: string) => void;
  readOnly?: boolean;
}

const DeliveryPartyForm: React.FC<DeliveryPartyFormProps> = ({ who, data, onUpdate, onSave, onVerifyCIN, readOnly }) => {
  const prefix = who === 'partie' ? 'partie' : 'livreur';
  const title = who === 'partie'
    ? `Informations du ${data.type_partie === 'fournisseur' ? 'Fournisseur' : 'Distributeur'}`
    : 'Informations du Livreur';
  const icon = who === 'partie' ? (data.type_partie === 'fournisseur' ? '✂️' : '🛒') : '🚚';

  const nom = data[`${prefix}_nom_complet` as keyof DeliveryContractData] as string;
  const cin = data[`${prefix}_cin` as keyof DeliveryContractData] as string;
  const adresse = data[`${prefix}_adresse` as keyof DeliveryContractData] as string;
  const telephone = data[`${prefix}_telephone` as keyof DeliveryContractData] as string;
  const cinRecto = data[`${prefix}_cin_recto` as keyof DeliveryContractData] as string | null;
  const cinVerso = data[`${prefix}_cin_verso` as keyof DeliveryContractData] as string | null;
  const rectoStatus = data[`${prefix}_cin_recto_status` as keyof DeliveryContractData] as CINVerificationStatus;
  const versoStatus = data[`${prefix}_cin_verso_status` as keyof DeliveryContractData] as CINVerificationStatus;

  return (
    <div className={`rounded-xl border p-6 space-y-4 animate-fade-in ${readOnly ? 'bg-muted/50 border-border' : 'bg-card border-accent/30 shadow-contract'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        {readOnly && <span className="ml-auto text-xs font-medium bg-muted px-2 py-1 rounded text-muted-foreground">Lecture seule</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Nom complet *</Label>
          <Input value={nom} onChange={e => onUpdate({ [`${prefix}_nom_complet`]: e.target.value })} onBlur={onSave} disabled={readOnly} placeholder="Nom et prénom" />
        </div>
        <div className="space-y-1.5">
          <Label>CIN *</Label>
          <Input value={cin} onChange={e => onUpdate({ [`${prefix}_cin`]: e.target.value })} onBlur={onSave} disabled={readOnly} placeholder="Numéro CIN" />
        </div>
        <div className="space-y-1.5">
          <Label>Adresse</Label>
          <Input value={adresse} onChange={e => onUpdate({ [`${prefix}_adresse`]: e.target.value })} onBlur={onSave} disabled={readOnly} placeholder="Adresse complète" />
        </div>
        <div className="space-y-1.5">
          <Label>Téléphone</Label>
          <Input type="tel" value={telephone} onChange={e => onUpdate({ [`${prefix}_telephone`]: e.target.value })} onBlur={onSave} disabled={readOnly} placeholder="034 XX XXX XX" />
        </div>
      </div>

      <div className="border-t border-border pt-4 mt-4">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          🪪 Photos de la Carte d'Identité Nationale (CIN) *
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CINUpload
            label="CIN — Recto"
            photo={cinRecto}
            status={rectoStatus}
            error={null}
            onPhotoChange={photo => onUpdate({
              [`${prefix}_cin_recto`]: photo,
              [`${prefix}_cin_recto_status`]: photo ? rectoStatus : 'idle',
            })}
            onVerify={img => onVerifyCIN(who, 'recto', img)}
            disabled={readOnly}
          />
          <CINUpload
            label="CIN — Verso"
            photo={cinVerso}
            status={versoStatus}
            error={null}
            onPhotoChange={photo => onUpdate({
              [`${prefix}_cin_verso`]: photo,
              [`${prefix}_cin_verso_status`]: photo ? versoStatus : 'idle',
            })}
            onVerify={img => onVerifyCIN(who, 'verso', img)}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartyForm;
