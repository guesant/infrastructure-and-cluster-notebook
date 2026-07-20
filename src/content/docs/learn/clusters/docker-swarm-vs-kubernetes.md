---
title: Docker Swarm vs. Kubernetes
description: Compara Swarm e Kubernetes (K3s) por instalação, curva de aprendizado, recursos e operação, para decidir qual usar em um cluster pequeno.
sidebar:
  order: 5
---

> **Para quem é:** quem está decidindo se um cluster pequeno deve usar Swarm ou Kubernetes (K3s).

Swarm e Kubernetes são orquestradores: ambos executam containers em múltiplas máquinas coordenadas. A escolha entre eles depende do cenário, não de qual é objetivamente melhor.

| Critério | Docker Swarm | Kubernetes (K3s) |
| --- | --- | --- |
| Instalação | `docker swarm init`, um comando | Alguns minutos de setup |
| Curva de aprendizado | Baixa, estende Docker Compose | Alta, introduz conceitos novos (Pods, Services, namespaces) |
| Autoscaling | Manual | HPA automático, opcional |
| Storage | Local ou driver externo | CSI integrado, mais opções |
| Rede | Overlay com mesh ingress | CNI plugável (Flannel, Calico, etc.) |
| Escala testada | Ordem de centenas de nós | Milhares de nós |
| Adoção no mercado | Nicho, focado em Docker | Amplamente adotado no ecossistema cloud native |
| Custo operacional | Baixo | Médio, mais componentes para operar |

## Quando Swarm é suficiente

Para uma equipe pequena (poucos operadores), um cluster com poucas dezenas de nós, e uma equipe que já conhece Docker Compose bem o suficiente para que Swarm seja uma extensão natural em vez de um novo aprendizado. Um exemplo típico é um ambiente de três máquinas rodando API, banco de dados e cache, sem necessidade de HPA, RBAC granular ou um driver CSI avançado.

## Quando Kubernetes é necessário

Quando a escalabilidade precisa crescer de dezenas para milhares de nós sem redesenho da arquitetura, quando o mercado ou a stack de destino (EKS, GKE) já giram em torno de Kubernetes, ou quando recursos como HPA, ingress controllers plugáveis, RBAC granular e namespaces multi-tenant são requisitos reais, não apenas desejáveis. Um fluxo GitOps com Argo CD ou Flux também pressupõe Kubernetes. Um exemplo típico é um cluster de dezenas de nós com múltiplos times, autoscaling e políticas de rede diferentes por namespace.

## Cenários híbridos

Não é incomum combinar as duas ferramentas por ambiente: Swarm para staging ou desenvolvimento, onde a simplicidade compensa, e K3s para produção, onde a robustez importa mais. Outra combinação comum usa Docker Compose para testes rápidos, Swarm para implantações pequenas e Kubernetes para os clusters maiores, escolhendo a ferramenta pelo tamanho real do problema em cada estágio.

## Operação no dia a dia

| Atividade | Swarm | K3s |
| --- | --- | --- |
| Atualizar o cluster | Reiniciar o Docker em cada nó | Rolling update, sem downtime |
| Monitoramento | Ferramentas genéricas (Prometheus) | Prometheus com kube-state-metrics, mais contexto sobre objetos |
| Troubleshooting | `docker service ps`, `docker logs` | `kubectl describe`, `kubectl logs`, `kubectl get events` |
| Backup | Backup do diretório de estado do Swarm | Backup do etcd (veja [fundamentos de backup](../../backups/backup-fundamentals/)) |
| Escalabilidade | Manual (`docker service scale`) | Automática (HPA) ou manual (`kubectl scale`) |

## Decisão prática

Comece por Swarm quando a prioridade for um setup rápido com o menor overhead possível, e por K3s quando a equipe já tiver familiaridade com Kubernetes ou estiver crescendo o suficiente para que a documentação e o mercado de trabalho maiores em torno de Kubernetes pesem a favor. Ambientes críticos, que exigem mais robustez e mais opções de operação, também favorecem K3s. Migrar de Swarm para Kubernetes depois é uma trajetória comum e não representa um erro de decisão inicial: os dois falam a linguagem de containers, e a migração reaproveita a maior parte do conhecimento adquirido.

## Referências

- [Docker: Swarm mode overview](https://docs.docker.com/engine/swarm/): visão oficial do Docker.
- [K3s: documentação oficial](https://docs.k3s.io/): guia oficial do K3s.
- [Kubernetes: Kubernetes Components](https://kubernetes.io/docs/concepts/overview/components/): visão oficial dos componentes do Kubernetes.
