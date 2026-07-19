---
title: Armazenamento local ou distribuído
description: Compara armazenamento local de nó e armazenamento distribuído replicado, e quando cada um é adequado em um cluster K3s.
sidebar:
  order: 3
---

> **Para quem é:** quem está decidindo se um workload deve usar `local-storage`, Longhorn ou outro provisionador distribuído.

A instalação do primeiro servidor deste notebook desabilita `local-storage` deliberadamente, para que ele não vire a classe padrão por acidente. Essa decisão só faz sentido se você entender a diferença entre as duas categorias de armazenamento.

## Como funciona

**Armazenamento local** vincula os dados ao disco de um nó específico. Rápido (sem rede envolvida) e simples, mas o Pod que usa esse volume só pode ser agendado no nó que o contém — perder o nó é perder os dados, a menos que exista backup externo.

**Armazenamento distribuído** (Longhorn, Ceph, e equivalentes gerenciados em nuvem) replica os dados entre múltiplos nós. Um Pod pode ser reagendado em qualquer nó que tenha acesso à rede de armazenamento, e a perda de um nó não derruba o volume enquanto houver réplicas saudáveis restantes.

```mermaid
flowchart TB
    accTitle: Armazenamento local versus distribuído
    accDescr: No armazenamento local, o volume existe apenas no disco do nó que o Pod ocupa. No armazenamento distribuído, o volume é replicado entre nós e sobrevive à perda de um deles.

    subgraph Local["Armazenamento local"]
        PodA["Pod"] --> DiskA["Disco do nó A"]
    end

    subgraph Distribuido["Armazenamento distribuído"]
        PodB["Pod"] --> Engine["Engine do volume"]
        Engine --> DiskB1["Réplica no nó A"]
        Engine --> DiskB2["Réplica no nó B"]
        Engine --> DiskB3["Réplica no nó C"]
    end
```yaml

Em um cluster de nó único, a distinção entre os dois é menor: não há outro nó para receber uma réplica, e a perda do único host afeta os dois modelos igualmente. A vantagem do armazenamento distribuído em nó único fica limitada à reconstrução de réplicas após a perda de um disco (não do host inteiro) e à possibilidade de expandir para multinó no futuro sem migrar de estratégia.

## Alternativas

Um provisionador de nuvem gerenciado (EBS, uma classe de disco de bloco do provedor) resolve o mesmo problema fora do cluster, delegando a replicação à infraestrutura subjacente — não é o caso coberto por este notebook, focado em hosts próprios.

## Quando usar armazenamento local

Dados verdadeiramente efêmeros ou reconstruíveis (cache local, scratch space) e cenários em que a simplicidade e o desempenho superam a necessidade de tolerância a falha de disco.

## Quando usar armazenamento distribuído

Qualquer dado que precise sobreviver à perda de um disco, ou workloads que precisam poder ser reagendados em outro nó (relevante a partir de multinó). Veja [visão geral do Longhorn](../longhorn-overview/) para a implementação usada neste notebook.

## Decisões que isso implica

Nenhuma das duas opções substitui backup — veja [replicação não é backup](../replication-is-not-backup/) antes de tratar réplicas como proteção suficiente.

## Páginas relacionadas

- [Visão geral do Longhorn](../longhorn-overview/)
- [Replicação não é backup](../replication-is-not-backup/)
- [Instalar o Longhorn](../../../guides/tasks/storage/install-longhorn/)

## Referências

- [Longhorn — Architecture](https://longhorn.io/docs/1.12.0/concepts/#architecture): descreve o modelo de réplicas distribuídas do Longhorn.
