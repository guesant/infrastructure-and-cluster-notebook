---
title: Policy Enforcement — OPA, Kyverno, Pod Security
sidebar:
  order: 3
---

> **Para quem é:** operadores que precisam garantir compliance e segurança de forma automática via políticas no cluster.

Policy enforcement em Kubernetes permite rejeitar deployments inseguros **antes** de rodar. Três abordagens: OPA/Gatekeeper (agnóstico), Kyverno (nativo Kubernetes), Pod Security Admission (padrão).

## O problema

Sem política, deployments podem violar segurança:

- Rodar como root
- Sem resource limits
- Com privilégios desnecessários
- Network policies abertas

**Com policy:** regras automáticas rejeitam o deployment.

## OPA/Gatekeeper — Máxima flexibilidade

**O que é:**

- Open Policy Agent (OPA) é um mecanismo de policy language-agnostic
- Gatekeeper é a integração OPA com Kubernetes (admission controller)

**Funcionalidade:**

- Políticas em linguagem Rego (custom)
- Valida qualquer recurso (Pods, Deployments, Ingress, etc.)
- Rejeita ou alerta (não muta)

**Quando usar:**

- Políticas complexas (lógica condicional, regras negócio)
- Auditar sem rejeitar (modo audit)
- Compliance específico (PCI-DSS, HIPAA)

**Trade-off:**

- Curva de aprendizado em Rego
- Mais overhead (parsing + validação custom)

---

## Kyverno — Kubernetes-native

**O que é:**

- Policy engine nativo Kubernetes
- Políticas como `ClusterPolicy` (YAML, sem nova linguagem)

**Funcionalidade:**

- Valida (reject/validate)
- Mutate (modifica resources automaticamente)
- Generate (cria novos resources via policy)
- Regras simples (comparação, match patterns)

**Quando usar:**

- Políticas simples (requere labels, nega privilégios)
- Quer mutação automática (ex.: adiciona network policy padrão)
- YAML-first (sem aprender nova linguagem)

**Trade-off:**

- Menos poderosa que OPA para lógica complexa
- Mais leve (Kubernetes-only)

---

## Pod Security Admission (PSA) — Padrão

**O que é:**

- Admission controller nativo Kubernetes (substituiu PodSecurityPolicy)
- Três níveis: `restricted`, `baseline`, `privileged`

**Funcionalidade:**

- Não customizável (apenas 3 níveis pré-definidos)
- Valida campos conhecidos (runAsNonRoot, allowPrivilegeEscalation, etc.)

**Quando usar:**

- Proteção básica (cobre 80% dos casos)
- Sem overhead custom
- Compliance simples

**Trade-off:**

- Inflexível (não há "customização" além dos 3 níveis)

---

## Comparação

| Aspecto | OPA/Gatekeeper | Kyverno | Pod Security |
| --------- | --- | --- | --- |
| **Complexity** | Alto (Rego) | Médio (YAML patterns) | Baixo (3 níveis) |
| **Power** | Máxima | Média (bom para 90%) | Mínima |
| **Mutate** | Não | Sim | Não |
| **Learning curve** | Steep | Gentle | Trivial |
| **Resource overhead** | Médio | Baixo | Mínimo |
| **For what** | Compliance custom | Segurança padrão + mutação | Baseline rápida |

## Decisão prática

**Use OPA/Gatekeeper se:**

- Compliance complexo (HIPAA, PCI-DSS)
- Precisa de lógica condicional
- Auditar sem rejeitar (audit mode)

**Use Kyverno se:**

- Policies simples (labels, privilégios)
- Quer mutação automática
- YAML é confortável

**Use Pod Security se:**

- Quer segurança básica com zero overhead
- Aceita 3 níveis pré-definidos

---

## Exemplos mínimos

### Kyverno: Bloquear root

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: no-root
spec:
  validationFailureAction: enforce
  rules:
  - name: check-runAsNonRoot
    match:
      resources:
        kinds:
        - Pod
    validate:
      message: "Pod must run as non-root"
      pattern:
        spec:
          securityContext:
            runAsNonRoot: true
```yaml

### Pod Security: Baseline

```bash
kubectl label namespace default pod-security.kubernetes.io/enforce=baseline
```yaml

---

## Implementação típica

1. **Começa com Pod Security** (baseline level, audit mode)
2. **Adiciona Kyverno** para policies simples (labels, limits)
3. **Escalona OPA** se compliance complexo exigir (rare)

---

## Referências

- [OPA/Gatekeeper documentation](https://open-policy-agent.org/docs/latest/kubernetes/): guia oficial.
- [Kyverno documentation](https://kyverno.io/): guia oficial.
- [Pod Security Admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/): spec Kubernetes.
