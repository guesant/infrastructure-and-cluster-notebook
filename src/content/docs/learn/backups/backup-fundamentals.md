---
title: Fundamentos de backup
description: Explica o que diferencia um backup de uma réplica ou snapshot, e por que essa distinção importa para qualquer dado do cluster.
sidebar:
  order: 1
---

> **Para quem é:** quem está começando a planejar backup de um cluster e precisa do vocabulário básico antes de configurar qualquer ferramenta.

Um backup é, por definição, uma cópia isolada no tempo e no espaço da escrita corrente — só essa cópia permite voltar a um estado anterior a um erro, seja ele físico (disco perdido) ou lógico (exclusão acidental, corrupção, ataque).

## Como funciona

Três mecanismos são frequentemente confundidos:

- **Réplica**: cópia síncrona mantida em tempo real em outro disco/nó. Protege contra perda física, mas propaga qualquer escrita destrutiva com a mesma velocidade que uma escrita legítima.
- **Snapshot**: ponto de retorno rápido do estado de um volume/datastore em um instante específico. Normalmente permanece no mesmo storage/domínio de falha do original.
- **Backup**: cópia isolada, tipicamente em um destino externo, com retenção e controles de acesso próprios.

```mermaid
flowchart LR
    accTitle: Isolamento crescente entre réplica, snapshot e backup
    accDescr: Réplica protege contra falha física com isolamento mínimo; snapshot adiciona um ponto no tempo mas normalmente no mesmo domínio de falha; backup isola completamente em outro destino.

    Replica["Réplica<br/>(isolamento mínimo)"] --> Snapshot["Snapshot<br/>(ponto no tempo, mesmo domínio)"]
    Snapshot --> Backup["Backup<br/>(isolado, outro destino)"]
```yaml

Cada camada adiciona proteção contra um tipo diferente de falha — nenhuma substitui as demais. Veja [replicação não é backup](../../storage/replication-is-not-backup/) para o detalhamento com exemplos práticos.

## Alternativas

Para dados totalmente reconstruíveis a partir de outra fonte confiável (um cache, um índice derivado), nenhuma das três camadas é estritamente necessária — a "fonte" já cumpre esse papel.

## Quando cada camada é suficiente

Réplica sozinha é suficiente apenas para tolerância a falha física, nunca para erro lógico. Snapshot sozinho ajuda contra erros lógicos recentes, mas não contra a perda do storage inteiro. Backup é o único que protege contra os dois cenários combinados.

## Quando backup é obrigatório

Sempre que o dado não pode ser recriado a partir de outra fonte — bancos de dados, estado de configuração não versionado, credenciais.

## Páginas relacionadas

- [RPO e RTO](../rpo-and-rto/)
- [Estado do cluster versus dados de aplicação](../cluster-state-vs-application-data/)
- [Backup e recuperação (runbook completo)](../../../operations/backups/backup-and-recovery/)

## Referências

- [Kubernetes — Volume Snapshots](https://kubernetes.io/docs/concepts/storage/volume-snapshots/): documenta o mecanismo de snapshot via CSI.
