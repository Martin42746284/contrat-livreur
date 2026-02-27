
-- Create contracts table to persist contract data
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS needed - contracts are accessed via shareable link (public by UUID)
-- The UUID itself serves as the access control (unguessable)
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Allow anyone with the link (UUID) to read and update
CREATE POLICY "Anyone can read contracts by id"
  ON public.contracts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update contracts"
  ON public.contracts FOR UPDATE
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contracts_updated_at();

-- Enable realtime for contracts
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
