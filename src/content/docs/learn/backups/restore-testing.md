---
title: Testes de restauração
description: Explica por que um backup não testado não deve ser considerado confiável, e o que um teste de restauração precisa validar de fato.
sidebar:
  order: 6
---

> **Para quem é:** quem tem backups configurados, nunca os restaurou, e presume que "estão funcionando" porque os Jobs terminam com sucesso.

Um Job de backup marcado `Completed` prova que os dados foram lidos e enviados a algum lugar — não prova que o artefato resultante é íntegro, completo, ou realmente restaurável.

## Como funciona

Um teste de restauração real precisa validar três camadas, não apenas a primeira:

```mermaid
flowchart TB
    accTitle: Três camadas de validação de um teste de restauração
    accDescr: A primeira camada confirma que o processo de restauração completa sem erro; a segunda confirma que os dados restaurados existem e têm o tamanho esperado; a terceira confirma que a aplicação funciona corretamente com os dados restaurados.

    Processo["O processo de restauração completa sem erro"] --> Existencia["Os dados restaurados existem e têm tamanho plausível"]
    Existencia --> Funcional["A aplicação funciona corretamente com os dados restaurados"]
```yaml

A camada final — validação funcional — é a mais frequentemente pulada e a mais importante: um banco de dados restaurado que inicia sem erro pode ainda assim ter perdido índices, ter dados inconsistentes, ou não passar em uma consulta simples de verificação.

## Alternativas

Para reduzir o custo de testes completos frequentes, um teste parcial (restaurar apenas metadados ou uma amostra) pode ser um meio-termo aceitável entre testes completos espaçados — mas não substitui um teste completo periódico.

## Quando testar

Depois de qualquer mudança relevante na estratégia de backup, e em um cronograma regular (trimestral é um ponto de partida razoável, conforme a criticidade do ambiente) mesmo sem mudanças.

## Quando um teste é insuficiente

Quando ele só confirma que o processo de restauração "rodou sem erro", sem validar a camada funcional — isso mede menos do que parece medir.

## Decisões que isso implica

Registre a duração real de cada teste (compare com o RTO definido) e a perda de dados observada (compare com o RPO definido) — veja [RPO e RTO](../rpo-and-rto/). Um teste sem essas métricas registradas não comprova os objetivos declarados.

## Páginas relacionadas

- [RPO e RTO](../rpo-and-rto/)
- [Roteiro de restore drill](../../../operations/backups/backup-and-recovery/#roteiro-de-restore-drill)
- [Restaurar um cluster PostgreSQL](../../../guides/tasks/databases/restore-postgresql-cluster/)

## Referências

- [K3s — Backup and Restore](https://docs.k3s.io/datastore/backup-restore): referência de restauração testável do datastore.
