---
title: RKE2 vs. K3s — distribuições Kubernetes
sidebar:
  order: 8
---

> **Para quem é:** operadores decidindo entre K3s e RKE2 (ambas da Rancher/SUSE).

Ambas são Kubernetes leve da Rancher, mas com trade-offs diferentes. K3s é minimalista; RKE2 é maximalista.

## Comparação rápida

| Critério | K3s | RKE2 |
| ---------- | ----- | ------ |
| **Tamanho** | ~50MB | ~700MB |
| **Bundled** | Flannel, Traefik | Nada (escolha seus CNI/ingress) |
| **Armazenamento** | etcd embarcado | Você escolhe |
| **ARM64** | ✅ Nativo | ✅ Nativo |
| **Dev/Lab** | ✅ Perfeito | ⚠️ Overhead |
| **Production** | ✅ Funciona | ✅ Preferido |
| **FIPS/CIS** | ❌ Não | ✅ Sim (hardened) |
| **Compliance** | Nenhum | CIS, DISA, FedRAMP |

## K3s — Minimalista

**Opinativo:**

- Escolha feita por você: Flannel (rede), Traefik (ingress), etcd (storage)
- Fast track para começar

**Melhor para:**

- Desenvolvimento e testes
- Pequenos clusters (<50 nós)
- Quando você sabe o que quer

**Limitações:**

- Sem FIPS/CIS hardening nativo
- Não certificado para compliance

---

## RKE2 — Conformidade

**Agnóstico:**

- Você instala CNI, ingress, storage
- Segurança hardened por padrão (CIS benchmark)
- Suporte para FIPS, DISA K8s Hardening

**Melhor para:**

- Production com requisitos de compliance
- Segurança crítica
- Ambientes regulados (federal, healthcare, finance)

**Overhead:**

- Mais recursos (sem Traefik bundled)
- Configuração manualdesde o início

---

## Decisão prática

**Comece com K3s se:**

- Experimentando com Kubernetes
- Lab/POC com poucos nós
- Quer setup rápido

**Mude para RKE2 se:**

- Precisa de compliance (CIS, FIPS)
- Production com requerimentos regulatórios
- Equipe experiente com Kubernetes
- Já tem estratégia clara de rede/storage

**Híbrido:**

- Usar K3s em dev, RKE2 em prod
- Mesma configuração de aplicações (CNI agnóstico)

---

## Outras distribuições

| Distribuição | Foco | Caso de uso |
| --- | --- | --- |
| **Kubeadm** | Máxima flexibilidade | DIY, aprender Kubernetes |
| **k0s** | Minimalista modular | Edge, IoT |
| **MicroK8s** | Snap-based, Ubuntu | Desktop/laptop |
| **Minikube** | Local dev | Laptop learning |

---

## Migração K3s → RKE2

Se começou com K3s e precisa de compliance:

1. Instale RKE2 novo cluster
2. Migrate workloads (mesma API Kubernetes)
3. Retire K3s
4. Reaproveia hardware

**Não é upgrade in-place** — é redeploy em novo cluster.

---

## Referências

- [K3s documentation](https://docs.k3s.io/): instalação e operação.
- [RKE2 documentation](https://docs.rke2.io/): incluindo CIS hardening.
- [Kubernetes distributions comparison](https://kubernetes.io/docs/setup/): visão oficial.
