---
title: RPO e RTO
description: Explica objetivo de ponto de recuperação e objetivo de tempo de recuperação, e por que ambos precisam ser medidos, não apenas definidos.
sidebar:
  order: 2
---

> **Para quem é:** quem precisa definir metas de backup e recuperação para um serviço, além de "fazemos backup todo dia".

RPO e RTO são as duas perguntas que toda estratégia de backup precisa responder antes de escolher frequência, retenção e procedimento de restauração.

## Como funciona

**RPO** (Recovery Point Objective) é a perda máxima de dados tolerável, medida em tempo. Um RPO de 15 minutos significa que, no pior caso, a restauração pode perder até 15 minutos de dados desde o último ponto recuperável — não que o backup "roda a cada 15 minutos" necessariamente, mas que o mecanismo (backup completo + logs incrementais, por exemplo) garante um ponto recuperável dentro dessa janela.

**RTO** (Recovery Time Objective) é o tempo máximo tolerável para restabelecer o serviço, contado do início do incidente até a funcionalidade restaurada — não apenas até "os arquivos foram copiados de volta".

```mermaid
flowchart LR
    accTitle: RPO mede perda de dados; RTO mede tempo de indisponibilidade
    accDescr: RPO é o intervalo entre o último ponto recuperável e o momento da falha; RTO é o tempo entre o início da recuperação e o serviço voltar a funcionar.

    UltimoBackup["Último ponto recuperável"] -->|"RPO: perda máxima tolerável"| Falha["Momento da falha"]
    Falha -->|"RTO: tempo máximo de indisponibilidade"| Restaurado["Serviço restaurado e validado"]
```yaml

Nenhum dos dois é uma meta abstrata — ambos só têm valor quando medidos contra um teste de restauração real. Uma retenção diária não prova um RPO de 15 minutos; um script de restore nunca executado não prova nenhum RTO.

## Alternativas

Para dados de baixa criticidade, um RPO/RTO frouxo (horas ou dias) é uma escolha deliberada e razoável — nem todo dado precisa do mesmo nível de proteção.

## Quando definir RPO/RTO rigorosos

Para dados de produção onde a perda ou indisponibilidade tem impacto real medido (financeiro, operacional, de confiança).

## Quando um RPO/RTO frouxo é aceitável

Ambientes de desenvolvimento, dados de cache reconstruíveis, ou qualquer serviço cuja indisponibilidade prolongada tem impacto real baixo.

## Decisões que isso implica

RPO define a frequência mínima de backup e a existência (ou não) de logs incrementais; RTO define o procedimento de restauração aceitável (um restore manual demorado pode não caber em um RTO curto). Veja [testes de restauração](../restore-testing/) para como validar ambos na prática.

## Páginas relacionadas

- [Fundamentos de backup](../backup-fundamentals/)
- [Testes de restauração](../restore-testing/)
- [Backup e recuperação (runbook completo)](../../../operations/backups/backup-and-recovery/#rpo-e-rto)

## Referências

- [K3s — Backup and Restore](https://docs.k3s.io/datastore/backup-restore): referência de RPO implícito no agendamento de snapshots do etcd.
