---
title: Replicação não é backup
description: Explica por que réplicas síncronas de armazenamento não substituem um backup independente, com exemplos de falhas que atravessam todas as réplicas.
sidebar:
  order: 4
---

> **Para quem é:** quem está avaliando se o Longhorn (ou outro armazenamento replicado) já é proteção suficiente para os dados de uma aplicação.

Réplicas síncronas de armazenamento e backups resolvem problemas diferentes, mesmo que ambos pareçam "ter uma cópia dos dados a mais".

## Como funciona

Uma réplica de armazenamento copia cada escrita em tempo real para outro disco (ou nó). Ela protege contra a perda física de um componente — um disco que falha, um nó que cai. Ela não protege contra um erro lógico: se uma aplicação corrompe seus próprios dados, apaga um registro por engano, ou é atingida por ransomware, a escrita destrutiva é replicada com a mesma velocidade e confiabilidade que qualquer outra escrita legítima. Todas as réplicas ficam corrompidas ou vazias ao mesmo tempo.

```mermaid
sequenceDiagram
    accTitle: Uma exclusão acidental se propaga por todas as réplicas
    accDescr: Uma aplicação executa uma exclusão indevida; o engine do volume replica essa escrita para todas as réplicas síncronas, então nenhuma delas preserva o estado anterior.

    participant App as Aplicação
    participant Engine as Engine do volume
    participant R1 as Réplica A
    participant R2 as Réplica B

    App->>Engine: DELETE FROM tabela (engano)
    Engine->>R1: replica a escrita
    Engine->>R2: replica a escrita
    Note over R1,R2: Nenhuma réplica preserva o estado anterior
```yaml

Um backup, por definição, é um ponto no tempo isolado da escrita corrente — só um snapshot anterior ao erro, copiado para fora do sistema de produção, permite voltar a um estado consistente.

## Alternativas

Snapshots do próprio volume (não réplicas, mas pontos de retorno rápidos) ajudam contra erros lógicos recentes, mas normalmente permanecem no mesmo storage e domínio de falha do volume original — não substituem uma cópia externa. Veja [backup e recuperação](../../../operations/backups/backup-and-recovery/#réplica-snapshot-e-backup) para a comparação completa entre réplica, snapshot e backup.

## Quando a distinção importa mais

Bancos de dados e qualquer dado sujeito a erro de aplicação, bug de migração, ou ataque direcionado. Réplicas isoladas não ajudam nesses cenários.

## Quando a distinção importa menos

Dados verdadeiramente reconstruíveis a partir de outra fonte confiável — nesse caso, a réplica já cumpre o papel de disponibilidade, e a "fonte" externa já cumpre o papel de backup.

## Páginas relacionadas

- [Backup e recuperação](../../../operations/backups/backup-and-recovery/)
- [Configurar backup de volume](../../../guides/tasks/storage/configure-volume-backup/)
- [Armazenamento local ou distribuído](../local-vs-distributed-storage/)

## Referências

- [Longhorn — Backups and Secondary Storage](https://longhorn.io/docs/1.12.0/concepts/#3-backups-and-secondary-storage): diferencia réplicas, snapshots e backups no Longhorn especificamente.
