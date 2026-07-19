---
title: Validação automatizada de cluster
sidebar:
  order: 10
---

> **Para quem é:** operadores que querem automatizar verificações de health e gerar relatórios.

Este documento cobre como executar checklists via scripts em vez de manualmente.

## Health check automatizado

Script: `src/scripts/check-cluster-health.sh`

**Uso:**

```bash
./src/scripts/check-cluster-health.sh
```yaml

**Saída:** JSON com status de:

- Comandos disponíveis (kubectl, helm, jq)
- Cluster acessível
- Nós em estado Ready
- Pods rodando (sem falhas)
- API responsiva

**Exemplo:**

```json
{
  "timestamp": "2026-07-19T10:30:00Z",
  "summary": {
    "total": 7,
    "passed": 7,
    "failed": 0
  },
  "checks": {
    "cmd_kubectl": "pass",
    "cmd_helm": "pass",
    "cluster_accessible": "pass",
    "nodes_ready": "pass",
    "pods_running": "pass",
    "api_responsive": "pass"
  }
}
```yaml

## Integração no CI

`.github/workflows/scripts.yml` roda automaticamente:

1. **Shellcheck** — valida sintaxe de todos os scripts
2. **Smoke test** — testa sintaxe + carrega library
3. **Lint** — verifica permissions, busca possíveis secrets

Executado em cada push/PR que toque `src/scripts/`.

---

## Automação de checklists

### Padrão proposto

Para cada checklist em `operations/checklists/`, criar script correspondente:

```yaml
operations/checklists/cluster-operational-checklist.md
↓
src/scripts/validate-cluster-operational.sh
```yaml

**Estrutura do script:**

```bash
#!/bin/bash
# Validação de cluster-operational-checklist.md

source src/scripts/lib/common.sh

check_item_1() {
  # Verificar item 1
}

check_item_2() {
  # Verificar item 2
}

generate_report() {
  # Retornar JSON ou texto
}
```yaml

### Checklists candidatos a automação

| Checklist | Script | Verificações |
| ----------- | -------- | ------------- |
| Post-install | `validate-post-install.sh` | Nós, services, network |
| Cluster operational | `validate-cluster-operational.sh` | Quorum, storage, logs |
| Application readiness | `validate-app-readiness.sh` | Resources, probes, security |
| Security | `validate-cluster-security.sh` | RBAC, network policies, PSP |

---

## Relatórios estruturados

Todos os scripts retornam JSON para:

- Consumir por CI/CD
- Agregar em dashboard
- Armazenar histórico

**Formato padrão:**

```json
{
  "timestamp": "ISO 8601",
  "checklist": "name",
  "summary": {
    "total": N,
    "passed": N,
    "failed": N,
    "warnings": N
  },
  "results": [
    {
      "name": "check name",
      "status": "pass|fail|warning",
      "message": "..."
    }
  ]
}
```yaml

---

## Próximos passos

1. Criar script para cada checklist crítico
2. Integrar ao CI (rodar em cada deployment)
3. Agregar resultados em dashboard (opcional: Prometheus + Grafana)
4. Alertar se validações falham

---

## Referências

- [check-cluster-health.sh](../../../scripts/check-cluster-health.sh): exemplo implementado.
- [quality-criteria.md](../../../project/quality-criteria/): critérios de validação.
- [cluster-operational-checklist.md](./cluster-operational-checklist/): checklist fonte.
