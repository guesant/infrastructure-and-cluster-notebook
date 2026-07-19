---
title: Distribuições Kubernetes — k0s, kubeadm, MicroK8s
sidebar:
  order: 11
---

> **Para quem é:** operadores explorando alternativas a K3s e RKE2 para casos específicos (edge, máquinas locais, DIY).

Kubernetes é um padrão; as distribuições implementam. Além de K3s/RKE2, existem outras optimizadas para cenários diferentes.

## Comparação rápida

| Distribuição | Foco | Tamanho | Deploy |
| --- | --- | --- | --- |
| **K3s** | Minimalista, dev | 50MB | 30s |
| **RKE2** | Production + compliance | 700MB | 5 min |
| **k0s** | Modular, edge | ~200MB | 2 min |
| **kubeadm** | DIY, aprender | Bare | Manual |
| **MicroK8s** | Desktop/laptop | ~1GB | 1 click (snap) |
| **EKS** | AWS managed | — | 10 min (console) |

---

## k0s — Modular e leve

**O que é:**

- Distribuição minimalista da Mirantis
- Totalmente customizável (escolhe cada componente)

**Pontos fortes:**

- Modular (remove controller, sidecar-inject, etc. conforme precisa)
- Pequeno (200MB)
- Fácil instalação (1 binário)
- Edge-first (low-resource)

**Quando usar:**

- IoT / edge computing
- Quer máxima customização
- Resource-constrained

**Trade-off:**

- Menos maduro que K3s
- Comunidade menor

---

## kubeadm — DIY puro

**O que é:**

- Ferramenta de bootstrap Kubernetes
- Você configura tudo (networking, storage, addon)

**Pontos fortes:**

- Máxima flexibilidade
- Aprende Kubernetes a fundo
- Nenhuma opinião

**Quando usar:**

- Estou aprendendo Kubernetes
- Preciso customização extrema
- On-prem só (sem cloud provider)

**Trade-off:**

- Muito manual
- Troubleshooting complexo

---

## MicroK8s — Um-clique

**O que é:**

- Kubernetes via snap (Ubuntu/Linux)
- Tudo integrado (etcd, CNI, addons)

**Pontos fortes:**

- Um comando: `snap install microk8s`
- Addons fáceis (gpu, ingress, storage)
- Roda em laptop

**Quando usar:**

- Desenvolvimento local
- Demo rápida
- Não é production

**Trade-off:**

- Snap-only (Linux)
- Não escalável

---

## Kubeadm vs. k0s vs. K3s

| Aspecto | kubeadm | k0s | K3s |
| --------- | --------- | ----- | ----- |
| **Setup** | Manual | Automated | Trivial |
| **Learning** | Alto | Médio | Baixo |
| **Customização** | Total | Alta | Média |
| **Production ready** | ✅ (se souber o que faz) | ✅ | ✅ |
| **Community modules** | Muitos | Alguns | Muitos |

---

## Decisão prática

**Comece com K3s** (padrão recomendado).

**Mude para kubeadm se:**

- Quer aprender Kubernetes a fundo
- On-prem com exigências extremas

**Use k0s se:**

- Edge/IoT (resource-constrained)
- Quer modularidade

**Use MicroK8s se:**

- Desenvolvimento local
- Snap já instalado

---

## Outras notáveis

- **AKS** (Azure managed) — similar a EKS
- **GKE** (Google managed) — similar a EKS
- **DigitalOcean Kubernetes** — managed simple
- **Talos** — Linux/Kubernetes co-designed (experimental)

---

## Próximas seções

- [k0s vs. K3s](../../../learn/clusters/rke2-vs-k3s/) — comparação detalhada.
- [Instalar com kubeadm](../../../guides/tasks/kubernetes/install-kubeadm/) — DIY passo-a-passo.

---

## Referências

- [k0s documentation](https://docs.k0sproject.io/): guia oficial.
- [kubeadm docs](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/): spec Kubernetes.
- [MicroK8s docs](https://microk8s.io/docs): guia oficial.
