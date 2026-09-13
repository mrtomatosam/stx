-- Habilitar RLS nas tabelas relevantes
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_messages ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver o próprio perfil e perfis públicos
CREATE POLICY "profiles_select_own_or_public"
ON profiles
FOR SELECT
USING (
  auth.uid() = id
  OR role <> 'admin'
);

-- Usuários só podem atualizar o próprio perfil
CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Usuários só podem excluir a própria conta
CREATE POLICY "profiles_delete_own"
ON profiles
FOR DELETE
USING (auth.uid() = id);

-- Apenas admins podem ver ou manipular contas sensíveis
CREATE POLICY "profiles_admin_full_access"
ON profiles
FOR ALL
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Mensagens públicas: qualquer usuário autenticado pode ler as públicas
CREATE POLICY "timeline_select_public"
ON timeline_messages
FOR SELECT
USING (true);

-- Usuários só podem inserir mensagens próprias
CREATE POLICY "timeline_insert_own"
ON timeline_messages
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND author = auth.jwt() ->> 'username');

-- Usuários só podem alterar sua própria mensagem
CREATE POLICY "timeline_update_own"
ON timeline_messages
FOR UPDATE
USING (author = auth.jwt() ->> 'username')
WITH CHECK (author = auth.jwt() ->> 'username');

-- Usuários só podem apagar sua própria mensagem
CREATE POLICY "timeline_delete_own"
ON timeline_messages
FOR DELETE
USING (author = auth.jwt() ->> 'username');

-- Admins podem gerenciar tudo
CREATE POLICY "timeline_admin_full_access"
ON timeline_messages
FOR ALL
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');
