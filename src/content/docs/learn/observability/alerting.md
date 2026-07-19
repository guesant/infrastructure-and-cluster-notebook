---
title: Alertas acionáveis
description: Explica o que torna um alerta útil versus ruidoso, e como severidade, roteamento e runbooks se conectam.
sidebar:
  order: 3
---

> **Para quem é:** quem vai escrever `PrometheusRule`s e configurar o Alertmanager e quer evitar um sistema de alertas que ninguém confia.

Um alerta que dispara sem que ninguém possa agir sobre ele é pior do que nenhum alerta — ele treina a equipe a ignorar notificações, o que esconde os alertas reais quando eles aparecem.

## Como funciona

Um alerta acionável liga uma condição mensurável a uma resposta esperada:

```mermaid
flowchart LR
    accTitle: Componentes de um alerta acionável
    accDescr: Uma expressão ligada a impacto real dispara um alerta, que carrega severidade e responsável, aponta para um runbook, e é roteado ao destino certo.

    Expressao["Expressão ligada a impacto real"] --> Alerta["Alerta disparado"]
    Alerta -->|"labels"| Severidade["Severidade e responsável"]
    Alerta -->|"annotations"| Runbook["Link para runbook"]
    Alerta --> Roteamento["Roteamento (Alertmanager)"]
    Roteamento --> Destino["Destino real (Slack, PagerDuty, e-mail)"]
```yaml

A severidade deveria ser definida pela resposta esperada, não pelo nome técnico do componente: `critical` significa "acionar alguém agora, existe ação possível"; `warning` significa "revisar antes que vire impacto"; `info` não deveria acordar ninguém.

Um `for` (duração mínima antes de disparar) evita ruído de flutuações normais, mas precisa ser compatível com o tempo real tolerável — um `for` longo demais atrasa a detecção de um incidente real.

## Alternativas

*Recording rules* pré-computam expressões caras, reduzindo a carga de avaliação repetida, mas não substituem uma regra de alerta — são um otimização, não uma estratégia de alerta em si.

## Quando um alerta é acionável

Quando existe uma resposta clara e possível, um runbook acessível durante a indisponibilidade, e a condição está ligada a impacto real (não apenas a um valor técnico interessante).

## Quando evitar criar um alerta

Para condições puramente informativas sem ação esperada — registre em dashboard, não em alerta. Um dashboard sem alertas exige vigilância humana constante; um alerta sem critério de ação é ruído.

## Decisões que isso implica

Todo alerta precisa de `owner` e de um teste ponta a ponta que confirme não só a expressão, mas a entrega até o destino real — veja [configurar o Alertmanager](../../../guides/tasks/observability/configure-alertmanager/).

## Páginas relacionadas

- [Configurar o Alertmanager](../../../guides/tasks/observability/configure-alertmanager/)
- [Monitoramento de caixa-preta versus caixa-branca](../blackbox-vs-whitebox-monitoring/)
- [Observabilidade e alertas (runbook completo)](../../../operations/observability/observability-and-alerting/)

## Referências

- [Alerting — Prometheus](https://prometheus.io/docs/practices/alerting/): princípios para alertas simples, acionáveis e ligados a sintomas.
- [Alertmanager — Prometheus](https://prometheus.io/docs/alerting/latest/alertmanager/): agrupamento, roteamento, inibição e silêncios.
