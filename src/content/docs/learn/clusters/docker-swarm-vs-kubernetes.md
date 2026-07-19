---
title: Docker Swarm vs. Kubernetes
sidebar:
  order: 5
---

> **Para quem é:** quem está decidindo se um cluster pequeno deve usar Swarm ou Kubernetes (K3s).

Swarm e Kubernetes são orquestradores — ambos executam containers em múltiplas máquinas. A escolha não é binária, depende do cenário.

## Comparação rápida

| Critério | Docker Swarm | Kubernetes (K3s) |
| --- | --- | --- |
| **Instalação** | `docker swarm init` (1 comando) | ~5-10 minutos de setup |
| **Aprendizado** | Baixo — Docker Compose + serviços | Alto — conceitos novos (pods, services, namespaces) |
| **Autoscaling** | Manual | HPA automático (opcional) |
| **Storage** | Local ou driver externo | CSI integrado (mais opções) |
| **Networking** | Overlay overlay + mesh ingress | CNI plugável (Flannel, Calico, etc.) |
| **Escalabilidade** | ~1000 nós (teórico) | 5000+ nós testados |
| **Mercado/Jobs** | Niche (Docker-focused) | Onipresente (cloud native) |
| **Cost operacional** | Baixo | Médio (mais componentes) |

## Quando usar Swarm

- **Equipe pequena** (1-5 devops/ops).
- **Cluster < 50 nós**.
- **Já usa Docker Compose** — Swarm estende naturalmente.
- **Setup rápido** — ambiente de teste, staging, labs.
- **Habilidade com Docker** > Kubernetes.
- **Requisitos simples** — não precisa HPA, RBAC fino, ou CSI avançado.

Exemplo: 3 máquinas rodando API + DB + cache com Docker Compose.

## Quando usar Kubernetes (K3s)

- **Equipe com experiência** — ou disposição de aprender.
- **Escalabilidade crítica** — de 10 para 1000 nós sem redesign.
- **Mercado exige Kubernetes** — e você quer usar a mesma tecnologia que usaria no EKS/GKE.
- **Recursos avançados** — HPA, ingress controller plugável, RBAC, namespaces multi-tenancy.
- **Workflow GitOps** — Argo CD, Flux, etc.
- **Cluster de produção robusto** — que precisa sobreviver a atualizações sem downtime.

Exemplo: 5-50 nós com múltiplos times, requisitos de autoscaling, diferentes estratégias de net policy por namespace.

## Casos híbridos

Não é raro ver:

- **Swarm para staging/dev** (simplicidade) + **K3s para prod** (robustez).
- **Docker Swarm internamente** (operações locais) + **Kubernetes em cloud** (EKS/GKE para escalabilidade pública).
- **Ambos coexistindo** — Docker Compose para testes rápidos, Swarm para pequenos deploys, K3s para clusters maiores.

## Manutenção operacional

| Atividade | Swarm | K3s |
| --- | --- | --- |
| Atualizar cluster | `systemctl restart docker` em cada nó | Rolling update, sem downtime |
| Monitoramento | Ferramentas genéricas (Prometheus) | Prometheus + kube-state-metrics (mais contexto) |
| Troubleshooting | `docker service ps`, `docker logs` | `kubectl describe`, `kubectl logs`, `kubectl events` |
| Backup | Backup do `/var/lib/docker/swarm/` | Backup do etcd |
| Escalabilidade | Manual (`docker service scale`) | Automática (HPA) ou manual (`kubectl scale`) |

## Tendência na indústria

- **Kubernetes domina cloud native** — todos os grandes provedores oferecem.
- **Swarm é niche** — Docker Inc. não investe ativamente; comunidade é pequena.
- **K3s é a alternativa leve** — "Kubernetes mas simples".

Se o projeto pode crescer além de um cluster pequeno, Kubernetes é mais futurology-proof.

## Decisão prática

1. Começa pequeno? **Use Swarm** (setup rápido, menos overhead).
2. Já sabe Kubernetes? **Use K3s** (familiaridade).
3. Equipe em crescimento? **K3s** (mais documentação, mais hiring pool).
4. Ambiente crítico? **K3s** (mais robustez, mais opções).

E não há vergonha em começar com Swarm e migrar depois — containers são containers.

## Referências

- [Docker Swarm vs Kubernetes comparison](https://docs.docker.com/engine/swarm/): visão oficial do Docker.
- [K3s documentation](https://docs.k3s.io/): guia oficial do K3s.
- [Kubernetes vs Docker — what's the difference?](https://kubernetes.io/docs/concepts/overview/): documentação oficial do Kubernetes.
