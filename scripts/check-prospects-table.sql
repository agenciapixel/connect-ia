-- Script SQL para verificar e debug da tabela prospects

-- 1. Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'prospects'
);

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'prospects'
ORDER BY ordinal_position;

-- 3. Verificar foreign keys
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name='prospects';

-- 4. Verificar RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'prospects';

-- 5. Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'prospects';

-- 6. Contar registros (se houver)
SELECT COUNT(*) FROM public.prospects;

-- 7. Verificar se há algum registro órfão (sem org_id válido)
SELECT p.id, p.org_id, o.id as org_exists
FROM public.prospects p
LEFT JOIN public.orgs o ON p.org_id = o.id
WHERE o.id IS NULL;
