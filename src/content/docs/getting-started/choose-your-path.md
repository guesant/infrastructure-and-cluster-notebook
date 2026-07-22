---
title: Escolha seu caminho
description: Panorama das opções de orquestração de containers cobertas por este projeto (K3s, Docker Swarm e alternativas apenas conceituais) e critérios para escolher qual seguir.
sidebar:
  order: 1
---

Este projeto cobre mais de uma forma de orquestrar containers em cluster. O caminho mais completo
— com roteiro passo a passo, blueprints e operação contínua — é K3s, mas não é a única opção
documentada. Use esta página para decidir qual caminho seguir antes de entrar nos roteiros
específicos.

## As opções

| Opção | Cobertura neste projeto | Quando faz sentido |
| --- | --- | --- |
| **K3s (Kubernetes)** | Roteiro completo: planejamento, instalação, expansão, rede, armazenamento, GitOps, segredos, backup e operação contínua. | Você precisa dos recursos do Kubernetes (autoscaling, RBAC fino, CNI de terceiros, service mesh) ou quer uma base que cresça além de um cluster pequeno. |
| **Docker Swarm** | [Blueprint completo](../../guides/blueprints/docker-swarm/): rede overlay, secrets, volumes, deploy e recuperação de desastre. | Os hosts já rodam Docker, o cluster é pequeno (poucas dezenas de nós) e simplicidade operacional pesa mais do que flexibilidade. |
| **Outras distribuições Kubernetes** (RKE2, kubeadm) | Apenas conceitual, sem blueprint operacional: [RKE2 vs. K3s](../../learn/clusters/rke2-vs-k3s/), [distribuições de Kubernetes](../../learn/clusters/kubernetes-distributions/). | Requisitos específicos de outra distribuição (por exemplo, RKE2 para conformidade FIPS). Adapte o roteiro de K3s aos passos equivalentes da distribuição escolhida. |
| **Kubernetes gerenciado** (EKS, GKE, AKS) | Apenas conceitual: [Kubernetes gerenciado vs. self-hosted](../../learn/clusters/managed-vs-selfhosted/). | Você não quer operar o control plane ou o etcd. Este projeto foca em self-hosted; use a documentação do provedor gerenciado para a instalação. |

## Ainda não decidiu?

- **Já roda Docker e quer o caminho mais simples?** Veja [Docker Swarm vs. Kubernetes](../../learn/clusters/docker-swarm-vs-kubernetes/) e, se ainda estiver comparando com Compose isolado, [Docker Compose vs. Swarm vs. Kubernetes](../../learn/clusters/docker-compose-vs-swarm-vs-kubernetes/).
- **Não sabe se precisa de Kubernetes de fato?** Leia [conceitos do Kubernetes](../../learn/clusters/kubernetes/) antes de escolher uma distribuição.
- **Precisa self-hosted vs. gerenciado?** Veja [Kubernetes gerenciado vs. self-hosted](../../learn/clusters/managed-vs-selfhosted/).

## Depois de escolher

- **K3s:** siga o [ensaio de criação de cluster K3s](../create-a-k3s-cluster/), que começa pelo [planejamento](../planning/).
- **Docker Swarm:** siga o [blueprint de cluster Docker Swarm](../../guides/blueprints/docker-swarm/), que tem seu próprio pré-requisitos e roteiro.
- **RKE2, kubeadm ou gerenciado:** este projeto não tem um roteiro operacional equivalente ainda (ver [escopo do projeto](../../project/scope/)); use o roteiro de K3s como referência conceitual e a documentação oficial da opção escolhida para os comandos.
