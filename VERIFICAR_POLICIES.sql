-- Verificar policies criadas em MEMBERS
SELECT
    tablename,
    policyname,
    cmd as operacao,
    qual as tipo
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'members'
ORDER BY policyname;

-- Verificar policies criadas em ORGS
SELECT
    tablename,
    policyname,
    cmd as operacao,
    qual as tipo
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'orgs'
ORDER BY policyname;
