
-- Table principale des contrats livreur
CREATE TABLE public.delivery_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_number TEXT NOT NULL UNIQUE DEFAULT 'DLV-' || to_char(now(), 'YYYYMMDD-HH24MISS') || '-' || substr(gen_random_uuid()::text, 1, 4),
  
  -- Partie principale (fournisseur ou distributeur)
  type_partie TEXT NOT NULL CHECK (type_partie IN ('fournisseur', 'distributeur')),
  partie_nom_complet TEXT NOT NULL DEFAULT '',
  partie_cin TEXT NOT NULL DEFAULT '',
  partie_adresse TEXT NOT NULL DEFAULT '',
  partie_telephone TEXT NOT NULL DEFAULT '',
  partie_cin_recto TEXT,
  partie_cin_verso TEXT,
  partie_cin_recto_status TEXT NOT NULL DEFAULT 'idle',
  partie_cin_verso_status TEXT NOT NULL DEFAULT 'idle',
  
  -- Livreur
  livreur_nom_complet TEXT NOT NULL DEFAULT '',
  livreur_cin TEXT NOT NULL DEFAULT '',
  livreur_adresse TEXT NOT NULL DEFAULT '',
  livreur_telephone TEXT NOT NULL DEFAULT '',
  livreur_cin_recto TEXT,
  livreur_cin_verso TEXT,
  livreur_cin_recto_status TEXT NOT NULL DEFAULT 'idle',
  livreur_cin_verso_status TEXT NOT NULL DEFAULT 'idle',
  
  -- Validations
  validation_partie BOOLEAN NOT NULL DEFAULT false,
  validation_livreur BOOLEAN NOT NULL DEFAULT false,
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'valide', 'refuse', 'resilie')),
  motif_resiliation TEXT,
  
  -- Lieu et date
  lieu TEXT NOT NULL DEFAULT '',
  date_contrat DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validated_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ
);

-- Journal d'audit horodaté
CREATE TABLE public.delivery_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.delivery_contracts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Liste noire livreurs (blocage sans validation admin)
CREATE TABLE public.delivery_blacklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livreur_cin TEXT NOT NULL,
  livreur_nom TEXT NOT NULL,
  contract_id UUID REFERENCES public.delivery_contracts(id),
  reason TEXT NOT NULL,
  admin_cleared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.delivery_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert delivery_contracts" ON public.delivery_contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read delivery_contracts" ON public.delivery_contracts FOR SELECT USING (true);
CREATE POLICY "Anyone can update delivery_contracts" ON public.delivery_contracts FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert audit_log" ON public.delivery_audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read audit_log" ON public.delivery_audit_log FOR SELECT USING (true);

CREATE POLICY "Anyone can read blacklist" ON public.delivery_blacklist FOR SELECT USING (true);
CREATE POLICY "Anyone can insert blacklist" ON public.delivery_blacklist FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update blacklist" ON public.delivery_blacklist FOR UPDATE USING (true);

-- Trigger updated_at
CREATE TRIGGER update_delivery_contracts_updated_at
  BEFORE UPDATE ON public.delivery_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contracts_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_contracts;
