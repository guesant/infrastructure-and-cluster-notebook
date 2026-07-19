---
title: Valores aleatórios
sidebar:
  order: 1
---

## Gerar senha aleatória (printável)

```bash
openssl rand -base64 16
# Saída: abcd1234EFGH5678ijkl9012
```yaml

**Quando usar:** configurar senhas iniciais, secrets, tokens.

**Considerações:**

- `openssl rand -base64 N` gera N bytes de aleatoriedade, encod em base64 (~33% maior).
- Para 16 bytes → ~24 caracteres em base64.
- Alternativa: `tr </dev/urandom 'A-Za-z0-9' | head -c 16`.

**Relacionado:**

- [Gerar token hexadecimal](#gerar-token-hexadecimal)
- [Criar chave SSH](/toolbox/commands/certificates/#criar-chave-ssh)

---

## Gerar token hexadecimal

```bash
openssl rand -hex 32
# Saída: 4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d
```yaml

**Quando usar:** tokens de API, session IDs, que precisam ser ASCII-safe hex.

**Considerações:**

- `-hex` encod em hexadecimal (2 caracteres por byte).
- Para 32 bytes → 64 caracteres hex.
- Mais legível que base64 para logs/configs.

**Relacionado:**

- [Gerar senha aleatória](#gerar-senha-aleatória-imprimível)

---

## Gerar UUID

```bash
uuidgen
# Saída: 550e8400-e29b-41d4-a716-446655440000

# Versão lowercase (alguns sistemas exigem)
uuidgen | tr A-Z a-z
```yaml

**Quando usar:** IDs únicos para resources, eventos, cluster IDs.

**Considerações:**

- `uuidgen` cria UUID v1 (timestamp+MAC).
- Alternativa: `cat /proc/sys/kernel/random/uuid` (Linux).

---

## Gerar número aleatório em range

```bash
# Entre 1 e 100
echo $((RANDOM % 100 + 1))

# Entre 0 e 255
echo $((RANDOM % 256))
```yaml

**Quando usar:** delays aleatórios em scripts, seed para testes.

**Considerações:**

- `$RANDOM` é bash; em sh usar `/dev/urandom`.
- Para ranges maiores, usar `awk 'BEGIN { srand(); print int(rand() * N) }'`.

**Relacionado:**

- [Gerar senha aleatória](#gerar-senha-aleatória-imprimível)
