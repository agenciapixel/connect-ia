-- TEMPORÁRIO: Desabilitar completamente RLS para debug
-- ATENÇÃO: Isso é apenas para desenvolvimento! Não use em produção!

-- Desabilitar RLS na tabela members
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS na tabela orgs
ALTER TABLE public.orgs DISABLE ROW LEVEL SECURITY;

-- Mensagem de aviso
DO $$
BEGIN
  RAISE NOTICE 'RLS DESABILITADO TEMPORARIAMENTE - Apenas para desenvolvimento!';
END $$;
