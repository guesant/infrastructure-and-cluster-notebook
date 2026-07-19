---
title: Retenção e cardinalidade
description: Explica por que retenção e cardinalidade são a mesma decisão de custo e capacidade vista de dois ângulos diferentes.
sidebar:
  order: 6
---

> **Para quem é:** quem está configurando o Prometheus/Loki e precisa decidir quanto tempo guardar dados e quantas dimensões instrumentar.

Reter dados indefinidamente e instrumentar toda dimensão possível parecem escolhas seguras — na prática, ambas competem pelo mesmo recurso finito: armazenamento e capacidade de consulta.

## Como funciona

**Retenção** é por quanto tempo um dado permanece consultável. Defina-a pela pergunta operacional que ela precisa responder, não por um valor padrão arbitrário: se uma investigação típica olha os últimos 30 dias, reter 7 dias é insuficiente; reter 2 anos é custo sem benefício correspondente.

**Cardinalidade** é o número de combinações distintas de valores de label em uma métrica. Cada combinação nova cria uma série temporal nova — e cada série consome memória e disco continuamente, não apenas no momento em que é escrita.

```mermaid
flowchart LR
    accTitle: Cardinalidade multiplica o custo de armazenamento
    accDescr: Uma métrica com poucos labels de baixa cardinalidade gera poucas séries; adicionar um label de alta cardinalidade, como um ID de usuário, multiplica o número de séries pelo número de valores possíveis daquele label.

    MetricaBaixa["http_requests_total{method, status}"] -->|"poucas combinações"| SeriesBaixa["Dezenas de séries"]
    MetricaAlta["http_requests_total{method, status, user_id}"] -->|"uma série por usuário"| SeriesAlta["Milhares ou milhões de séries"]
```yaml

Um identificador de requisição, sessão ou usuário como label de métrica é o erro de cardinalidade mais comum — ele transforma uma métrica agregável em uma série por evento, que é exatamente o que logs e traces já fazem melhor.

## Alternativas

*Recording rules* pré-agregam séries de alta cardinalidade em métricas derivadas de cardinalidade menor, úteis quando os dados brutos precisam existir mas as consultas frequentes não precisam da granularidade completa.

## Quando aumentar retenção

Quando uma investigação real já foi prejudicada por dados expirados cedo demais — ajuste com base em incidentes reais, não preventivamente sem essa evidência.

## Quando reduzir cardinalidade

Sempre que uma dimensão nova for cogitada como label — estime o produto dos valores possíveis antes de adicionar, e prefira logs/traces para atributos não limitados (IDs, textos livres).

## Decisões que isso implica

Defina um orçamento de cardinalidade por serviço e revise o efeito real após o deploy — veja a seção completa em [observabilidade e alertas](../../../operations/observability/observability-and-alerting/#proteção-de-segredos-e-cardinalidade).

## Páginas relacionadas

- [Métricas, logs e traces](../metrics-logs-and-traces/)
- [Observabilidade para clusters pequenos](../observability-for-small-clusters/)

## Referências

- [Storage — Prometheus](https://prometheus.io/docs/prometheus/latest/storage/): retenção, TSDB local e armazenamento remoto.
- [Instrumentation — Prometheus](https://prometheus.io/docs/practices/instrumentation/): práticas de instrumentação e cardinalidade.
