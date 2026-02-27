export type DeliveryRole = 'partie' | 'livreur';
export type DeliveryPartieType = 'fournisseur' | 'distributeur';
export type DeliveryContractStatus = 'en_attente' | 'valide' | 'refuse' | 'resilie';
export type CINVerificationStatus = 'idle' | 'verifying' | 'valid' | 'invalid';

export interface DeliveryContractData {
  id: string;
  contract_number: string;
  type_partie: DeliveryPartieType;

  // Partie principale
  partie_nom_complet: string;
  partie_cin: string;
  partie_adresse: string;
  partie_telephone: string;
  partie_cin_recto: string | null;
  partie_cin_verso: string | null;
  partie_cin_recto_status: CINVerificationStatus;
  partie_cin_verso_status: CINVerificationStatus;

  // Livreur
  livreur_nom_complet: string;
  livreur_cin: string;
  livreur_adresse: string;
  livreur_telephone: string;
  livreur_cin_recto: string | null;
  livreur_cin_verso: string | null;
  livreur_cin_recto_status: CINVerificationStatus;
  livreur_cin_verso_status: CINVerificationStatus;

  // Validations
  validation_partie: boolean;
  validation_livreur: boolean;

  // Status
  status: DeliveryContractStatus;
  motif_resiliation: string | null;

  // Lieu et date
  lieu: string;
  date_contrat: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  validated_at: string | null;
  terminated_at: string | null;
}

export const initialDeliveryContract: Omit<DeliveryContractData, 'id' | 'contract_number' | 'created_at' | 'updated_at'> = {
  type_partie: 'fournisseur',
  partie_nom_complet: '',
  partie_cin: '',
  partie_adresse: '',
  partie_telephone: '',
  partie_cin_recto: null,
  partie_cin_verso: null,
  partie_cin_recto_status: 'idle',
  partie_cin_verso_status: 'idle',
  livreur_nom_complet: '',
  livreur_cin: '',
  livreur_adresse: '',
  livreur_telephone: '',
  livreur_cin_recto: null,
  livreur_cin_verso: null,
  livreur_cin_recto_status: 'idle',
  livreur_cin_verso_status: 'idle',
  validation_partie: false,
  validation_livreur: false,
  status: 'en_attente',
  motif_resiliation: null,
  lieu: '',
  date_contrat: new Date().toISOString().split('T')[0],
  validated_at: null,
  terminated_at: null,
};
