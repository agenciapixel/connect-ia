# 🔐 Configurar Controle de Acesso - Apenas Usuários Cadastrados

## 🎯 **Objetivo**
Implementar sistema de controle de acesso que permite login apenas para usuários previamente cadastrados e autorizados.

## ⚠️ **IMPORTANTE**
- **Apenas usuários na lista de autorizados poderão fazer login**
- **Usuário admin padrão será criado**: `admin@connectia.com`
- **Sistema será mais seguro e controlado**

## 🔧 **Passo a Passo**

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr
- Vá para **SQL Editor**

### 2. Execute o Script de Controle de Acesso
- Cole o conteúdo de `configurar_controle_acesso.sql`
- Clique em **Run**
- Aguarde a execução completa

### 3. Verificar Resultado
- Confirme que a tabela `authorized_users` foi criada
- Verifique se o usuário admin padrão foi inserido
- Confirme que as funções foram criadas

## 📋 **O que o Script Faz**

### **1. Cria Tabela de Usuários Autorizados**
- `authorized_users` - Lista de usuários que podem fazer login
- Campos: email, name, role, is_active, timestamps
- RLS habilitado para segurança

### **2. Configura Políticas de Segurança**
- **RLS para authorized_users**: Usuários veem apenas a si mesmos
- **Política para auth.users**: Apenas usuários autorizados podem se cadastrar
- **Políticas de admin**: Admins podem gerenciar usuários autorizados

### **3. Cria Funções de Controle**
- `is_user_authorized()` - Verifica se usuário pode fazer login
- `add_authorized_user()` - Adiciona usuário à lista de autorizados
- `remove_authorized_user()` - Remove/desativa usuário
- `get_authorized_users()` - Lista todos os usuários autorizados

### **4. Insere Usuário Admin Padrão**
- **Email**: `admin@connectia.com`
- **Nome**: `Administrador Connect IA`
- **Role**: `admin`
- **Status**: `ativo`

### **5. Configura Segurança do Auth**
- Política que bloqueia cadastro de usuários não autorizados
- Verificação automática antes de permitir login

## ✅ **Resultado Esperado**

Após a execução:
- ✅ **Tabela authorized_users criada** - Sistema de controle implementado
- ✅ **Usuário admin padrão inserido** - `admin@connectia.com`
- ✅ **Políticas RLS configuradas** - Segurança ativada
- ✅ **Funções de controle criadas** - Gerenciamento de usuários
- ✅ **Login controlado** - Apenas usuários autorizados podem fazer login

## 🚀 **Como Gerenciar Usuários Autorizados**

### **Adicionar Novo Usuário:**
```sql
SELECT public.add_authorized_user(
    'usuario@exemplo.com',
    'Nome do Usuário',
    'user'  -- ou 'admin'
);
```

### **Remover Usuário:**
```sql
SELECT public.remove_authorized_user('usuario@exemplo.com');
```

### **Listar Usuários Autorizados:**
```sql
SELECT * FROM public.get_authorized_users();
```

### **Verificar se Usuário está Autorizado:**
```sql
SELECT public.is_user_authorized('usuario@exemplo.com');
```

## 🔍 **Verificações de Segurança**

O script inclui verificações que mostram:
- Total de usuários autorizados
- Usuários ativos vs inativos
- Funções criadas
- Políticas RLS ativas

## 🚨 **IMPORTANTE - Primeiro Login**

Após executar o script:
1. **Use o email**: `admin@connectia.com`
2. **Crie uma senha** no processo de cadastro
3. **Faça login** com essas credenciais
4. **Adicione outros usuários** conforme necessário

## 🛡️ **Benefícios do Sistema**

- **Controle total** sobre quem pode acessar o sistema
- **Segurança aprimorada** - sem logins não autorizados
- **Gestão centralizada** de usuários
- **Auditoria completa** de acessos
- **Flexibilidade** para adicionar/remover usuários

---

**Arquivo principal**: `configurar_controle_acesso.sql`
**Status**: ✅ Pronto para execução
**Prioridade**: 🔴 Alta (Segurança crítica)
**Impacto**: 🔐 Controle total de acesso ao sistema
