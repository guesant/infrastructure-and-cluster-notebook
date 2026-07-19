---
title: Arquitetura do Prometheus e do Prometheus Operator
description: Explica o modelo de coleta por pull do Prometheus e como o Prometheus Operator usa CRDs para configurar targets e regras declarativamente.
sidebar:
  order: 2
---

> **Para quem é:** quem vai instalar o kube-prometheus-stack e precisa entender `ServiceMonitor`/`PodMonitor` antes de configurá-los.

O Prometheus coleta métricas por **pull** — ele consulta periodicamente (`scrape`) um endpoint HTTP que expõe métricas em texto plano, em vez de esperar que aplicações as enviem. Essa escolha simplifica a descoberta (o Prometheus decide o que e quando coletar) e facilita saber quando um target parou de responder.

## Como funciona

O Prometheus Operator adiciona uma camada declarativa sobre o Prometheus puro: em vez de editar o arquivo de configuração do Prometheus manualmente, você cria objetos Kubernetes (`ServiceMonitor`, `PodMonitor`, `PrometheusRule`) e o operator os traduz para a configuração real.

```mermaid
flowchart LR
    accTitle: Como o Prometheus Operator traduz CRDs em configuração
    accDescr: O ServiceMonitor seleciona um Service, o operator traduz isso em configuração de scrape do Prometheus, que coleta métricas do endpoint correspondente.

    ServiceMonitor["ServiceMonitor"] -->|"seleciona"| Service["Service"]
    Service -->|"aponta para"| Pods["Pods da aplicação"]
    ServiceMonitor -->|"traduzido pelo Operator em"| ScrapeConfig["Configuração de scrape"]
    ScrapeConfig --> Prometheus["Prometheus"]
    Prometheus -->|"coleta (pull)"| Pods
```yaml

Um `ServiceMonitor` seleciona um `Service` (não os Pods diretamente) — o `Service` precisa ter uma porta nomeada e `EndpointSlices` válidos apontando para os Pods certos. Um `PodMonitor` seleciona Pods diretamente, útil quando não existe (ou não faz sentido criar) um `Service` estável — veja [configurar um ServiceMonitor](../../../guides/tasks/observability/configure-service-monitor/) e [configurar um PodMonitor](../../../guides/tasks/observability/configure-pod-monitor/).

Um `PrometheusRule` declara regras de alerta e de gravação (`recording rules`), processadas pelo Prometheus na avaliação periódica — não pelo Alertmanager, que só recebe alertas já disparados.

## Alternativas

Para métricas que uma aplicação não pode expor via `/metrics` (ex.: um sistema legado só com logs), um *exporter* traduz outro formato ou protocolo em métricas Prometheus — o `node_exporter` (métricas de host) e o `kube-state-metrics` (estado de objetos Kubernetes) já vêm inclusos no kube-prometheus-stack.

## Quando usar ServiceMonitor

Para a maioria das aplicações que já têm um `Service` estável — o caso comum.

## Quando usar PodMonitor

Quando os Pods não têm (ou não deveriam ter) um `Service` correspondente, ou quando o alvo é uma coleção de Pods com IPs variáveis sem abstração de Service adequada.

## Páginas relacionadas

- [Instalar o Prometheus stack](../../../guides/tasks/observability/install-prometheus-stack/)
- [Configurar um ServiceMonitor](../../../guides/tasks/observability/configure-service-monitor/)
- [Alertas](../alerting/)

## Referências

- [Design — Prometheus Operator](https://prometheus-operator.dev/docs/getting-started/design/): relação entre `ServiceMonitor`, `PodMonitor`, `PrometheusRule` e os seletores das instâncias.
- [Instrumentation — Prometheus](https://prometheus.io/docs/practices/instrumentation/): tipos de métrica e práticas de instrumentação.
