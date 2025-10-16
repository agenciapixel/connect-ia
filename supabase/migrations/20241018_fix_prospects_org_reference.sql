-- Corrigir referência da tabela prospects para usar 'orgs' ao invés de 'organizations'

-- Remover constraint antiga
ALTER TABLE IF EXISTS public.prospects
DROP CONSTRAINT IF EXISTS prospects_org_id_fkey;

-- Adicionar constraint correta apontando para 'orgs'
ALTER TABLE public.prospects
ADD CONSTRAINT prospects_org_id_fkey
FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
