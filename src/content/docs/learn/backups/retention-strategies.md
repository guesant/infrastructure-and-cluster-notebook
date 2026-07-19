---
title: Estratégias de retenção
description: Explica como decidir quantos pontos de backup manter e por quanto tempo, além do reflexo de "guardar tudo para sempre".
sidebar:
  order: 5
---

> **Para quem é:** quem está configurando `retentionPolicy` ou `retain` em qualquer um dos backups deste notebook (etcd, Longhorn, PostgreSQL).

Reter poucos pontos economiza espaço, mas aumenta o risco de que a única cópia disponível já esteja corrompida ou sequer exista quando o incidente for percebido. Reter tudo indefinidamente custa espaço sem benefício correspondente na maioria dos casos.

## Como funciona

Uma política de retenção equilibrada normalmente combina múltiplas granularidades: vários pontos recentes de alta frequência (horários ou diários) e poucos pontos antigos de baixa frequência (semanais, mensais), preservando diversidade temporal sem multiplicar o custo total.

```mermaid
flowchart LR
    accTitle: Retenção em camadas por granularidade
    accDescr: Backups horários recentes cobrem incidentes detectados rapidamente; backups diários e semanais mais antigos cobrem corrupções detectadas com atraso.

    Horarios["Últimas 24h: pontos horários"] --> Diarios["Últimos 30 dias: pontos diários"]
    Diarios --> Semanais["Últimos 6 meses: pontos semanais"]
```yaml

O ponto crítico: uma política com muitos pontos recentes e nenhuma cópia anterior a uma janela de detecção de corrupção não atende a um incidente descoberto tardiamente. Se um erro lógico levou duas semanas para ser percebido, toda a retenção horária/diária já expirou — só uma retenção semanal/mensal salva a situação.

## Alternativas

Para dados totalmente reconstruíveis, reter apenas o ponto mais recente é aceitável — a "retenção" real está na capacidade de reconstruir, não no histórico de backups.

## Quando usar retenção em camadas

Sempre que houver risco de um erro lógico não detectado imediatamente — a maioria dos dados de produção.

## Quando uma retenção simples (N dias) é suficiente

Ambientes de teste ou dados com ciclo de vida curto e conhecido, onde o risco de detecção tardia é baixo.

## Decisões que isso implica

Retenção não é apenas quantidade — inclui também onde e como cada ponto é protegido contra exclusão acidental ou maliciosa (imutabilidade, WORM, quando suportado pelo destino).

## Páginas relacionadas

- [Backups fora do cluster](../off-cluster-backups/)
- [Backup do etcd](../../../operations/backups/backup-k3s-etcd/)
- [Backup e recuperação — frequência e retenção](../../../operations/backups/backup-and-recovery/#frequência-e-retenção)

## Referências

- [K3s — `etcd-snapshot`](https://docs.k3s.io/cli/etcd-snapshot): documenta `etcd-snapshot-retention` e o comportamento de expiração.
- [Longhorn — Scheduling Backups and Snapshots](https://longhorn.io/docs/1.12.0/snapshots-and-backups/scheduling-backups-and-snapshots/): documenta o campo `retain` do `RecurringJob`.
