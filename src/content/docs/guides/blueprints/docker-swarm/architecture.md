---
title: Arquitetura do Docker Swarm
sidebar:
  order: 1
---

> **Para quem é:** quem quer entender como Swarm coordena managers e workers antes de instalá-lo.

Docker Swarm usa um modelo de consenso distribuído (Raft) para manter consistência entre managers. Diferente do Kubernetes, há apenas um tipo de worker — os managers opcionalmente também executam containers.

## Componentes

### Manager

Um manager:

- Participa do consensus Raft.
- Mantém o estado do cluster (serviços, tarefas, configs, secrets).
- Agenda tarefas para workers.
- Expõe a API do Swarm (`docker service`, `docker config`, etc.).

Um cluster Swarm requer **quorum de managers**. Com 3 managers, tolera falha de 1. Com 5, tolera falha de 2.

### Worker

Um worker:

- Recebe tarefas do manager (diretos).
- Executa e monitora containers.
- Reporta status das tarefas.
- Não participa de consenso.

### Rede Overlay

Conecta todos os containers de um service entre múltiplos hosts:

- Encapsulamento VXLAN (UDP porta 4789).
- Cada container vê os demais em uma rede Ethernet virtual.
- Balanceamento de carga interno (IPVS).

### Ingress Routing Mesh

Publica ports direto na porta do host:

- Qualquer manager ou worker pode receber requisições na porta publicada.
- Tráfego é roteado automaticamente para o container certo.
- Oferece balanceamento básico.

## Limite de Swarm

Swarm é simples, mas tem limites:

- **Sem persistência nativa**: volumes são locais ao host; replicação é responsabilidade da aplicação.
- **Sem autoscaling**: não há HPA automático; escala manual com `docker service scale`.
- **Sem RBAC fino**: todos os managers têm acesso total.
- **Sem multi-tenancy**: não há namespaces, uma falha de isolamento pode afetar todo o cluster.
- **Máximo ~1000 nós** (limite documentado do Raft).
- **Sem service mesh**: não há mTLS nativo, circuit breakers, etc.

Para cenários que exigem esses recursos, Kubernetes é mais indicado.

## Decisão entre Swarm e Kubernetes

Ver [Docker Swarm vs. Kubernetes](../../learn/clusters/docker-swarm-vs-kubernetes/).

## Referências

- [Swarm mode key concepts](https://docs.docker.com/engine/swarm/key-concepts/): visão oficial dos componentes.
- [Raft Consensus Algorithm](https://raft.io/): explicação do algoritmo usado por Swarm.
