---
title: Docker Compose vs. Swarm vs. Kubernetes
sidebar:
  order: 6
---

> **Para quem é:** quem está começando com containers e não sabe qual ferramenta escolher.

Há três formas de orquestrar containers: Compose (local/dev), Swarm (pequeno cluster), Kubernetes (produção/escalável).

## Resumo rápido

| Nível | Ferramenta | Ideal para | Escopo |
| --- | --- | --- | --- |
| **Dev/local** | Docker Compose | Um desenvolvedor, máquina local | Um host |
| **Pequeno cluster** | Docker Swarm | Equipe pequena, < 50 nós | Múltiplos hosts, um datacenter |
| **Produção/cloud** | Kubernetes (K3s, EKS, GKE) | Escalabilidade, multi-tenancy, automação | Múltiplos datacenters, escala pública |

## Docker Compose

É uma **ferramenta de desenvolvimento**, não de produção.

```yaml
version: '3'
services:
  web:
    image: nginx
    ports:
      - "80:80"
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: example
```yaml

Tudo roda na **mesma máquina**, via `docker-compose up`.

**Quando usar:**

- Seu laptop.
- CI/CD local.
- Testing rápido.
- Pequenos ambientes (< 1GB RAM).

**Limitações:**

- Sem escalabilidade.
- Sem alta disponibilidade.
- Sem orquestração entre hosts.
- Não usa conceitos de rede overlay, service discovery, etc.

## Docker Swarm

É uma **plataforma de orquestração** para clusters pequenos.

Sintaxe: Docker Compose YAML + `docker service` em vez de `docker-compose`:

```bash
docker service create --replicas 3 -p 80:8080 nginx
```yaml

Tudo roda em **múltiplos hosts** coordenados via quorum de managers.

**Quando usar:**

- 2-50 nós.
- Sua equipe conhece Docker (Compose).
- Setup e operação simples.
- Staging/QA.

**Limitações (vs. Kubernetes):**

- Sem HPA automático.
- Sem RBAC fino.
- Sem namespaces.
- Sem service mesh.

## Kubernetes (K3s)

É uma **plataforma de orquestração** robusto-pra-escala-industrial.

Sintaxe: YAML declarativo (pods, services, deployments):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
```yaml

Tudo roda em **múltiplos hosts** com conceitos avançados (namespaces, RBAC, ingress, CSI).

**Quando usar:**

- Qualquer cluster que precisa crescer.
- Automação (HPA, rollouts automáticos).
- Multi-tenancy (namespaces).
- Integração com ecossistema cloud native (Prometheus, Grafana, Argo CD, Cert-manager).
- Produção.

## Trajetória típica

```yaml
Laptop
  ↓ (desenvolvimento)
Docker Compose
  ↓ (teste em cluster pequeno)
Docker Swarm
  ↓ (crescimento / requisitos estritos)
Kubernetes (K3s ou EKS)
  ↓ (escala, multi-region, SaaS)
EKS / GKE / AKS
```yaml

Ou direto:

```yaml
Laptop (Compose) → Kubernetes (K3s)
```yaml

(muitas equipes pulam Swarm por causa do mercado — Kubernetes é onipresente.)

## Recomendação

1. **Começando agora?** Escolha K3s (em vez de Swarm). Investimento educacional tem mais retorno.
2. **Projeto pessoal/lab pequeno?** Compose ou Swarm, conforme gosto.
3. **Produção?** K3s mínimo.

## Referências

- [Docker Compose documentation](https://docs.docker.com/compose/): guia oficial.
- [Docker Swarm documentation](https://docs.docker.com/engine/swarm/): guia oficial.
- [Kubernetes documentation](https://kubernetes.io/docs/): guia oficial.
- [K3s documentation](https://docs.k3s.io/): guia oficial do K3s.
