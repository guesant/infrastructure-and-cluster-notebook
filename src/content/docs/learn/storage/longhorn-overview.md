---
title: Visão geral do Longhorn
description: Apresenta engine, réplicas, CSI e armazenamento secundário do Longhorn, e organiza os caminhos para instalação, operação e backup.
sidebar:
  order: 5
---

> **Para quem é:** quem quer entender a arquitetura do Longhorn antes de instalá-lo ou operá-lo.

Longhorn é um sistema de armazenamento em blocos distribuído, desenvolvido para Kubernetes, que funciona como provisionador CSI. Ele resolve o problema de [armazenamento persistente](../kubernetes-storage-model/) replicando volumes entre nós, sem depender de um SAN ou storage externo dedicado.

## Como funciona

Para cada volume, o Longhorn cria um **engine** — um processo associado ao Pod que usa o volume — e um conjunto de **réplicas**, preferencialmente distribuídas em nós e discos diferentes. O engine escreve de forma síncrona em todas as réplicas ativas; se uma réplica falha, o Longhorn pode reconstruí-la em outro disco elegível a partir de uma réplica saudável.

```mermaid
flowchart LR
    accTitle: Componentes de um volume Longhorn
    accDescr: O engine do volume atende ao Pod e replica escritas de forma síncrona para réplicas distribuídas em diferentes discos e nós.

    Pod["Pod"] --> Engine["Engine do volume"]
    Engine -->|"escrita síncrona"| ReplicaA["Réplica — nó A"]
    Engine -->|"escrita síncrona"| ReplicaB["Réplica — nó B"]
    Engine -->|"escrita síncrona"| ReplicaC["Réplica — nó C"]
```yaml

O **armazenamento secundário** (backupstore) é um destino externo — normalmente compatível com S3 ou NFS — para onde o Longhorn pode copiar backups de volumes, distinto das réplicas primárias. Um backup no backupstore sobrevive à perda de todos os nós do cluster; réplicas não.

O Longhorn também expõe uma interface web para gerenciar volumes, nós, discos e backups visualmente, além da API/CRDs usados pela linha de comando e pelo GitOps.

## Alternativas

Ceph oferece um modelo mais maduro e flexível (blocos, objetos e arquivos), com custo de complexidade operacional maior. Para um cluster pequeno ou de nó único, o Longhorn tem uma curva de operação mais simples. Veja [armazenamento local ou distribuído](../local-vs-distributed-storage/) para a decisão mais ampla antes de escolher entre eles.

## Quando usar

Quando workloads precisam de volumes que sobrevivam à perda de um disco (ou, em multinó, de um nó), e o ambiente não já dispõe de um storage externo gerenciado.

## Quando evitar

Em um cluster de nó único sem plano de expansão, o Longhorn ainda vale pela reconstrução de réplicas após perda de disco, mas não substitui backup externo — veja [replicação não é backup](../replication-is-not-backup/). Workloads com necessidade extrema de IOPS podem exigir avaliação de desempenho antes de adotar qualquer armazenamento em rede.

## Páginas relacionadas

- [Instalar o Longhorn](../../../guides/tasks/storage/install-longhorn/)
- [Configurar um nó do Longhorn](../../../guides/tasks/storage/configure-longhorn-node/)
- [Configurar backup de volume](../../../guides/tasks/storage/configure-volume-backup/)
- [Considerações de armazenamento para bancos de dados](../database-storage/)

## Referências

- [Arquitetura e conceitos do Longhorn 1.12.0](https://longhorn.io/docs/1.12.0/concepts/): documentação oficial de engine, réplicas, CSI e backupstore.
