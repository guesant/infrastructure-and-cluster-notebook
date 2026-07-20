---
title: Git
sidebar:
  order: 11
---

## Status e diff

```bash
# Arquivo modificado
git status

# Mudanças não staged
git diff

# Mudanças staged
git diff --cached

# Comparar com branch
git diff main...feature
```

**Quando usar:** revisar o que mudou antes de commit.

**Considerações:**

- `git status`: resumo de mudanças.
- `git diff`: sem staged, mostra unstaged.
- `git diff --cached`: mostra staged changes.

---

## Fazer commit

```bash
# Commit simples
git commit -m "fix: correção de bug"

# Multiline message
git commit -m "Título da mudança" -m "Descrição mais detalhada aqui"

# Commit com tudo (não recomendado para unstaged)
git add .
git commit -m "todos os arquivos"
```

**Quando usar:** registrar mudanças.

**Considerações:**

- Padrão: [type]: [mensagem] (fix, feat, docs, etc).
- `-m` múltiplas vezes para body.
- Sem `-m`: abre editor.

---

## Ver histórico

```bash
# Últimos commits
git log

# Uma linha por commit
git log --oneline

# Gráfico de branches
git log --graph --oneline --all

# Commits de um arquivo
git log -- filename
```

**Quando usar:** entender histórico, encontrar quando bug foi introduzido.

**Considerações:**

- `--oneline`: mais legível.
- `--graph`: visualizar branches.
- `--author`: filtrar por autor.
- `--since`/`--until`: range de tempo.

---

## Branches

```bash
# Listar branches
git branch

# Criar branch
git branch feature/my-feature

# Mudar para branch
git checkout feature/my-feature

# Criar e mudar (atalho)
git checkout -b feature/my-feature

# Deletar branch
git branch -d feature/my-feature
```

**Quando usar:** isolar trabalho, features paralelas.

**Considerações:**

- `-b`: create + checkout em um comando.
- Branch local != remote (push para sincronizar).

---

## Merge de branches

```bash
# Merge simples
git merge feature/my-feature

# Merge com commit explícito
git merge --no-ff feature/my-feature

# Abort se conflito
git merge --abort
```

**Quando usar:** integrar feature branch em main.

**Considerações:**

- Sem `--no-ff`: fast-forward (sem commit merge se linear).
- Conflitos requerem resolução manual.

---

## Reverter commit

```bash
# Criar novo commit que desfaz mudanças
git revert <commit-hash>

# Reverter último commit (new commit)
git revert HEAD

# Reset local (desfazer, não cria commit)
git reset --hard HEAD~1  # Cuidado!
```

**Quando usar:** desfazer em público (revert), desfazer local (reset).

**Considerações:**

- `revert`: seguro (novo commit que desfaz).
- `reset --hard`: destrói histórco local (cuidado em branches compartilhadas).

---

## Stash (guardar mudanças temporárias)

```bash
# Guardar mudanças não commitadas
git stash

# Listar stashes
git stash list

# Recuperar último stash
git stash pop

# Recuperar stash específico
git stash apply stash@{0}
```

**Quando usar:** mudar de branch sem commitar, salvar work in progress.

**Considerações:**

- `stash`: salva modificações, deixa working dir limpo.
- `pop`: recupera e remove stash.
- `apply`: recupera mas mantém stash.

---

## Push para remote

```bash
# Push simples
git push

# Primeira vez (set upstream)
git push -u origin feature/my-feature

# Force (cuidado!)
git push --force-with-lease

# Deletar branch no remote
git push origin --delete feature/my-feature
```

**Quando usar:** enviar commits para servidor.

**Considerações:**

- `-u`: set upstream tracking.
- `--force-with-lease`: mais seguro que `--force`.
- Nunca force-push a main/master.

---

## Pull do remote

```bash
# Fetch + merge
git pull

# Fetch apenas (não merge)
git fetch

# Rebase em vez de merge
git pull --rebase
```

**Quando usar:** sincronizar com remoto, atualizar local.

**Considerações:**

- `pull` = fetch + merge.
- `--rebase`: evita commits merge (histórico mais limpo).
