---
title: Observabilidade para clusters pequenos
description: Adapta as recomendações gerais de observabilidade para um cluster K3s de nó único, sem sacrificar o essencial.
sidebar:
  order: 7
---

> **Para quem é:** quem acha que a pilha completa de observabilidade (Prometheus, Alertmanager, Grafana, Loki) é exagero para um cluster pessoal ou pequeno.

A pilha completa de observabilidade recomendada por este notebook cabe tecnicamente em um cluster de nó único, mas alguns dos seus próprios princípios (redundância, monitoramento externo ao domínio de falha) precisam de ajuste de expectativa nesse contexto.

## Como funciona

Em um cluster single-node, o Prometheus, o Alertmanager e o Grafana rodam no mesmo host que monitoram. Isso significa que a perda do host derruba simultaneamente o cluster e a capacidade de diagnosticá-lo — o metamonitoramento interno (veja [observabilidade e alertas](../../../operations/observability/observability-and-alerting/#teste-ponta-a-ponta-e-metamonitoramento)) não sobrevive a esse cenário.

```mermaid
flowchart TB
    accTitle: Em nó único, monitoramento interno e cluster compartilham o mesmo domínio de falha
    accDescr: Prometheus, Alertmanager e Grafana rodam no mesmo host que monitoram; apenas uma verificação externa ao host sobrevive à perda completa dele.

    subgraph Host["Host único"]
        Cluster["Cluster K3s"]
        Prometheus["Prometheus, Alertmanager, Grafana"]
    end

    Externo["Verificação externa ao host"] -.->|"único sinal que sobrevive à perda do host"| Host
```yaml

Isso não invalida a pilha interna — ela continua sendo o principal meio de diagnóstico no dia a dia. Mas reforça que o [monitoramento externo](../../../guides/tasks/observability/configure-external-availability-monitoring/) não é opcional em nó único: é o único sinal que aparece quando o host inteiro desaparece.

## Alternativas

Um subconjunto mínimo da pilha (só Prometheus + Alertmanager, sem Loki/traces) é uma escolha razoável para reduzir a superfície operacional em um ambiente pessoal, adicionando logs centralizados depois se a necessidade aparecer.

## Quando simplificar

Ambientes pessoais ou de teste, onde o custo de operar Loki/Alloy além de métricas não se justifica ainda — comece por métricas e alertas, que cobrem a maioria dos cenários de disponibilidade.

## Quando não simplificar

Não pule o monitoramento externo mesmo em ambiente pequeno — ele é barato (um serviço de terceiros ou um script simples rodando em outra máquina) e é o único sinal que sobrevive à perda total do host.

## Decisões que isso implica

Ajuste retenção e recursos (CPU/memória) da pilha de observabilidade à capacidade real do host único — ela compete pelos mesmos recursos que os workloads que monitora.

## Páginas relacionadas

- [Configurar monitoramento externo de disponibilidade](../../../guides/tasks/observability/configure-external-availability-monitoring/)
- [Instalar o Prometheus stack](../../../guides/tasks/observability/install-prometheus-stack/)
- [Limitações do blueprint k3s single-node](../../../guides/blueprints/k3s-single-node-gitops/limitations/)

## Referências

- [kube-prometheus-stack — Prometheus Community](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack): chart e valores usados neste notebook.
