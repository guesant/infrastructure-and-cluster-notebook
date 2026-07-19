---
title: Métricas, logs e traces
description: Explica os três sinais fundamentais de observabilidade, o que cada um responde e por que nenhum substitui os outros dois.
sidebar:
  order: 1
---

> **Para quem é:** quem está montando a observabilidade de um cluster e precisa decidir o que instrumentar primeiro.

"Observabilidade" não é uma ferramenta — é a capacidade de responder perguntas sobre o estado interno de um sistema a partir de sinais externos. Três tipos de sinal cobrem perguntas diferentes.

## Como funciona

**Métricas** são amostras numéricas organizadas como séries temporais — contadores, gauges, histogramas. Respondem "quanto" e "com que frequência": quantas requisições por segundo, qual a taxa de erro, qual o percentil 99 de latência. São baratas de armazenar e ótimas para alertas e agregações, mas não guardam o contexto de uma execução específica.

**Logs** são registros discretos de eventos, idealmente estruturados. Respondem "o que aconteceu exatamente nesta execução": qual erro específico, qual usuário, qual payload. Custam mais para armazenar e consultar em volume, e frequentemente contêm dados sensíveis que exigem tratamento.

**Traces** capturam o caminho e a duração de uma operação através de múltiplos serviços, dividida em spans. Respondem "onde o tempo foi gasto" em uma requisição distribuída — qual serviço, chamada ou consulta específica foi o gargalo.

```mermaid
flowchart LR
    accTitle: Os três sinais respondem perguntas diferentes
    accDescr: Métricas respondem quanto e com que frequência; logs respondem o que aconteceu especificamente; traces respondem onde o tempo foi gasto em uma operação distribuída.

    Metricas["Métricas"] -->|"responde"| Quanto["Quanto? Com que frequência?"]
    Logs["Logs"] -->|"responde"| OQue["O que aconteceu especificamente?"]
    Traces["Traces"] -->|"responde"| Onde["Onde o tempo foi gasto?"]
```yaml

Os três se correlacionam por tempo, cluster, namespace, workload e, quando adotado, um `trace_id` comum — mas um identificador de requisição nunca deve virar label de métrica, porque criaria uma série nova por requisição (veja [retenção e cardinalidade](../retention/)).

## Alternativas

Eventos do Kubernetes (`kubectl get events`) são um quarto sinal, mais efêmero — úteis para contexto rápido de scheduling e condições de objetos, mas não substituem logs persistentes nem auditoria.

## Quando priorizar métricas

Sempre primeiro — métricas são o sinal mais barato e cobrem a maioria dos alertas de disponibilidade e capacidade. Veja [instalar o Prometheus stack](../../../guides/tasks/observability/install-prometheus-stack/).

## Quando adicionar logs e traces

Logs quando métricas não explicam a causa de um erro específico. Traces quando a aplicação já é distribuída entre múltiplos serviços e a origem de uma latência não é óbvia a partir de métricas isoladas por serviço.

## Páginas relacionadas

- [Arquitetura do Prometheus](../prometheus-architecture/)
- [Retenção e cardinalidade](../retention/)
- [Observabilidade para clusters pequenos](../observability-for-small-clusters/)

## Referências

- [Signals — OpenTelemetry](https://opentelemetry.io/docs/concepts/signals/): definições formais de métricas, logs e traces e sua correlação.
- [Observability — Kubernetes](https://kubernetes.io/docs/concepts/cluster-administration/observability/): visão oficial dos sinais disponíveis em um cluster Kubernetes.
