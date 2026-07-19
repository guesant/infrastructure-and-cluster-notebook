---
title: Bash snippets
sidebar:
  order: 1
---

## Error handling

```bash
set -euo pipefail
trap 'echo "Error on line $LINENO"' ERR
```yaml

Roda script em modo estrito: exit on error, undefined vars, pipe failures. Trap imprime linha do erro.

---

## Validar variável

```bash
: "${VAR:?VAR não definido}"

# Ou com valor padrão
: "${VAR:=${DEFAULT}}"
```yaml

Garante que `VAR` está definida; se não, falha com mensagem clara. Segunda forma usa default se vazia.

---

## Loop com retry

```bash
for i in {1..5}; do
  if comando; then
    break
  fi
  echo "Tentativa $i falhou, retrying..."
  sleep $((2 ** i))  # exponential backoff
done
```yaml

Tenta comando até 5 vezes com backoff exponencial (2s, 4s, 8s, etc).

---

## Cleanup com trap

```bash
cleanup() {
  rm -rf "$tmpdir"
}
tmpdir=$(mktemp -d)
trap cleanup EXIT
```yaml

Garante que `tmpdir` é removido ao sair (normal ou error).

---

## Processamento paralelo

```bash
for file in *.txt; do
  process_file "$file" &
done
wait  # aguarda todos
```yaml

Processa múltiplos arquivos em paralelo, depois aguarda completar.

---

## Função com validação

```bash
require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Erro: comando '$1' não encontrado" >&2
    return 1
  }
}

require_command docker
```yaml

Valida que comando existe antes de usar.

---

## String substitution

```bash
# Remover prefix
"${VAR#prefix}"

# Remover suffix
"${VAR%suffix}"

# Replace
"${VAR/old/new}"

# To uppercase (bash 4+)
"${VAR^^}"
```yaml

Bash parameter expansion sem chamar `sed`/`tr`.

---

## Color output

```bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}OK${NC}"
echo -e "${RED}Erro${NC}"
```yaml

Cores em terminal (cuidado: pode quebrar em CI sem `-e`).

---

## Conditional exec

```bash
# Rodar só se stdout não é vazio
output=$(comando)
[[ -n "$output" ]] && echo "Resultado: $output"

# Rodar só se arquivo modificado há menos de 1 hora
[[ $(find file -mmin -60) ]] && echo "Recente"
```yaml

Atalhos comuns de condicional.
