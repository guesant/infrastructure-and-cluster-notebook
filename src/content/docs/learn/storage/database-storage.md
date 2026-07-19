---
title: Considerações de armazenamento para bancos de dados
description: Explica por que bancos de dados têm requisitos de armazenamento diferentes de aplicações stateless e como isso influencia a escolha de StorageClass.
sidebar:
  order: 6
---

> **Para quem é:** quem vai rodar um banco de dados (PostgreSQL via CloudNativePG, neste notebook) sobre armazenamento distribuído e quer entender os trade-offs antes de configurar.

Um banco de dados escreve de forma muito mais sensível a latência e ordem do que a maioria das aplicações stateless. Armazenamento distribuído em rede, como o Longhorn, adiciona uma camada entre o processo do banco e o disco físico — essa camada tem custo, e o banco de dados é o workload mais provável de sentir esse custo.

## Como funciona

Um banco de dados relacional como o PostgreSQL usa um log de escrita antecipada (WAL) para garantir durabilidade: uma transação só é confirmada depois que sua entrada no WAL é gravada de forma síncrona em disco. Se o armazenamento subjacente tem latência de escrita alta ou variável, o tempo de confirmação de cada transação aumenta proporcionalmente.

```mermaid
flowchart LR
    accTitle: Caminho de uma escrita de banco de dados sobre armazenamento distribuído
    accDescr: Uma transação do banco grava no WAL local, que por sua vez depende do engine de armazenamento distribuído replicar a escrita antes de confirmar a operação.

    DB["Processo do banco"] -->|"grava WAL"| Volume["Volume (Longhorn)"]
    Volume -->|"replica de forma síncrona"| ReplicaA["Réplica A"]
    Volume -->|"replica de forma síncrona"| ReplicaB["Réplica B"]
    Volume -->|"confirma escrita"| DB
```yaml

Réplicas síncronas de armazenamento (Longhorn) e réplicas de banco de dados (streaming replication do PostgreSQL, gerenciada pelo CloudNativePG) resolvem problemas em camadas diferentes: a primeira protege o volume contra perda de disco; a segunda protege o serviço de banco contra perda do processo/nó primário e permite failover mais rápido. Um cluster PostgreSQL gerenciado pelo CloudNativePG normalmente usa réplicas de banco de dados como mecanismo primário de disponibilidade, com armazenamento distribuído como proteção adicional de durabilidade do disco.

## Alternativas

Um disco local dedicado (sem replicação de armazenamento) oferece a menor latência, mas perde a proteção contra falha de disco — nesse caso, a disponibilidade depende inteiramente das réplicas do próprio banco de dados, se existirem.

## Quando usar armazenamento distribuído para banco de dados

Quando o cluster não tem múltiplas réplicas de banco de dados configuradas, ou quando a proteção adicional contra falha de disco justifica o overhead de latência medido no ambiente real.

## Quando evitar

Quando o teste de carga mostra que a latência de escrita do armazenamento distribuído já excede o aceitável para o workload, e o cluster já conta com réplicas de banco de dados como mecanismo primário de disponibilidade.

## Decisões que isso implica

Meça a latência de escrita real antes de decidir — não presuma que o overhead é aceitável ou inaceitável sem medir. Veja [criar um cluster PostgreSQL](../../../guides/tasks/databases/create-postgresql-cluster/) para a configuração usada neste notebook.

## Páginas relacionadas

- [Visão geral do Longhorn](../longhorn-overview/)
- [Criar um cluster PostgreSQL](../../../guides/tasks/databases/create-postgresql-cluster/)

## Referências

- [PostgreSQL — Write-Ahead Logging](https://www.postgresql.org/docs/current/wal-intro.html): explica o WAL e sua relação com durabilidade de transações.
- [CloudNativePG — Architecture](https://cloudnative-pg.io/documentation/current/architecture/): documenta o modelo de réplicas e failover do operator.
