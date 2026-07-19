---
title: Modelo de armazenamento do Kubernetes
description: Explica como PersistentVolumeClaim, StorageClass e PersistentVolume se relacionam para fornecer armazenamento persistente a um Pod.
sidebar:
  order: 1
---

> **Para quem é:** quem vai declarar armazenamento persistente para uma aplicação e precisa entender as peças antes de escolher um provisionador.

Um Pod é substituível: o Kubernetes pode recriá-lo em outro nó a qualquer momento. Os dados que precisam sobreviver a essa substituição não podem viver no filesystem do container — precisam de um recurso independente do ciclo de vida do Pod. O Kubernetes resolve isso com três objetos que se relacionam por indireção.

## Como funciona

Um `PersistentVolumeClaim` (PVC) é a solicitação feita por uma aplicação: quanto espaço, qual modo de acesso, opcionalmente qual `StorageClass`. Ele não descreve armazenamento físico — descreve uma necessidade.

Uma `StorageClass` identifica um provisionador (Longhorn, um driver de nuvem, NFS) e os parâmetros que ele deve usar para atender solicitações. Uma `StorageClass` pode ser marcada como padrão do cluster; sem uma classe padrão, um PVC que não especifica `storageClassName` fica `Pending` indefinidamente.

Um `PersistentVolume` (PV) representa o armazenamento provisionado de fato — criado automaticamente pelo provisionador quando um PVC é aceito, ou registrado manualmente em cenários estáticos. O Kubernetes associa (`bind`) um PV a um PVC compatível; a partir daí, o Pod monta o PVC, e a indireção resolve para o PV correspondente.

```mermaid
flowchart LR
    accTitle: Relação entre PVC, StorageClass e PV
    accDescr: Um Pod monta um PersistentVolumeClaim, que solicita armazenamento por meio de uma StorageClass; o provisionador identificado pela classe cria o PersistentVolume que é associado ao PVC.

    Pod["Pod"] -->|"monta"| PVC["PersistentVolumeClaim"]
    PVC -->|"referencia"| SC["StorageClass"]
    SC -->|"identifica"| Provisioner["Provisionador (CSI)"]
    Provisioner -->|"cria"| PV["PersistentVolume"]
    PV -->|"vinculado a"| PVC
```yaml

Essa indireção existe para que a aplicação (o manifesto do PVC) não precise conhecer detalhes do backend de armazenamento. O mesmo manifesto de PVC pode funcionar com Longhorn, um driver de nuvem ou NFS — apenas a `StorageClass` referenciada muda.

## Alternativas

Um `PersistentVolume` também pode ser criado estaticamente por um administrador, sem provisionamento dinâmico via `StorageClass` — útil para volumes pré-existentes que precisam ser importados, mas incomum em clusters novos. Veja [Longhorn — visão geral](../longhorn-overview/) para o provisionador dinâmico usado neste notebook.

## Quando usar

Todo dado que precisa sobreviver à recriação de um Pod — bancos de dados, filas com persistência, arquivos enviados por usuários — deve usar um PVC. Dados temporários ou reconstruíveis a partir de outra fonte não precisam.

## Quando evitar

Não crie um PVC para dados que já são replicados de forma consistente por outro mecanismo (ex.: um índice reconstruível a partir do banco). Um PVC desnecessário adiciona complexidade operacional (backup, capacidade, replicação) sem necessidade real.

## Páginas relacionadas

- [PersistentVolumes: modos de acesso e ciclo de vida](../persistent-volumes/)
- [Armazenamento local ou distribuído](../local-vs-distributed-storage/)
- [Criar uma StorageClass](../../../guides/tasks/storage/create-storage-class/)

## Referências

- [Kubernetes — Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/): referência oficial de PV, PVC e StorageClass.
- [Kubernetes — Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/): documenta provisionadores, parâmetros e a classe padrão.
