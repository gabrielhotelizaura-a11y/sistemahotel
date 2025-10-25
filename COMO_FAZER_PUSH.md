# 🚀 Como Fazer Push para o GitHub

## Problema Atual
```
remote: Repository not found.
```

Isso significa que o repositório não existe no GitHub ou você não tem acesso.

## ✅ Solução: Criar o Repositório

### Passo 1: Criar no GitHub
1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name:** `sistemahotel`
   - **Description:** Sistema de Gestão Hoteleira
   - **Visibility:** 🔒 Private (recomendado)
   - **NÃO marque** "Add a README file"
   - **NÃO marque** "Add .gitignore"
   - **NÃO marque** "Choose a license"
3. Clique em **Create repository**

### Passo 2: Fazer Push
```powershell
cd "c:\Users\castr\OneDrive\Área de Trabalho\hotel-sync-fix-main"
git push -u origin main
```

### Se pedir autenticação:
- Use seu **username** do GitHub
- Use um **Personal Access Token** (não a senha)

#### Como criar Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Marque: `repo` (acesso total ao repositório)
4. Copie o token gerado (guarde com segurança!)
5. Use como senha no git push

---

## 🔄 Alternativa: Mudar para Outro Repositório

Se você quer usar outro nome ou conta diferente:

```powershell
# Remover remote atual
git remote remove origin

# Adicionar novo remote (substitua pela URL do seu repositório)
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git

# Fazer push
git push -u origin main
```

---

## 📝 Verificar Status

```powershell
# Ver configuração atual
git remote -v

# Ver status dos arquivos
git status

# Ver histórico de commits
git log --oneline
```

---

## ⚠️ Se der erro de autenticação

### Windows - Usar Git Credential Manager

```powershell
# Limpar credenciais antigas
git credential-manager-core erase

# Tentar push novamente (vai pedir credenciais novas)
git push -u origin main
```

---

## 🎯 Resumo Rápido

1. ✅ Criar repositório `sistemahotel` no GitHub (private)
2. ✅ Executar: `git push -u origin main`
3. ✅ Usar Personal Access Token se pedir senha
4. ✅ Pronto! Código no GitHub 🚀
