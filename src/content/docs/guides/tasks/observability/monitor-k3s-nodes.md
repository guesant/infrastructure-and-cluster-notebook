---
title: Monitorar nós K3s
description: Como validar node-exporter e kube-state-metrics já instalados pelo kube-prometheus-stack e quais consultas PromQL acompanham CPU, memória, disco e estado dos nós.
sidebar:
  order: 5
---

> **Pré-requisitos:** [Prometheus stack instalado](../install-prometheus-stack/).
> **Versões testadas:** kube-prometheus-stack 68.x.

O kube-prometheus-stack já inclui `node-exporter` (métricas de host: CPU, memória, disco, rede) e `kube-state-metrics` (estado de objetos Kubernetes: nós, Pods, Deployments) instalados e configurados por padrão: esta página cobre a validação e as consultas essenciais, não uma instalação adicional.

## Confirmar que os exporters estão coletando

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace monitoring get daemonset kube-prometheus-stack-prometheus-node-exporter
kubectl --namespace monitoring get pods -l app.kubernetes.io/name=kube-state-metrics
```

O `node-exporter` deve rodar como DaemonSet (um Pod por nó); `kube-state-metrics` roda como Deployment único, consultando a API em vez do host diretamente.

## Consultas essenciais de nó

Via port-forward para o Prometheus (`kubectl --namespace monitoring port-forward service/kube-prometheus-stack-prometheus 9090:9090`):

| Pergunta | Consulta PromQL |
| --- | --- |
| Uso de CPU por nó | `100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)` |
| Memória disponível | `node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes` |
| Espaço em disco livre | `node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}` |
| Nó não Ready | `kube_node_status_condition{condition="Ready", status="true"} == 0` |

## Dashboard no Grafana

O kube-prometheus-stack já inclui dashboards padrão para nós ("Node Exporter / Nodes") e para o cluster ("Kubernetes / Compute Resources / Cluster"); acesse-os pelo Grafana em vez de recriar consultas manualmente para uso rotineiro.

## Validação

Confirme que todos os nós esperados aparecem nas consultas acima, sem lacunas: um nó ausente de `node_cpu_seconds_total` indica que o `node-exporter` não está rodando ou não está sendo coletado nele.

## Troubleshooting

Se um nó novo (adicionado após a instalação do stack) não aparecer nas métricas, confirme que o DaemonSet do `node-exporter` tolera os taints desse nó, se houver algum aplicado.

## Próximo passo

Configure alertas para as condições da tabela em [observabilidade e alertas](../../../../operations/observability/observability-and-alerting/#cobertura-por-camada): nó `NotReady`, disco cheio, memória sob pressão.

## Fontes e leitura adicional

- [Prometheus: node_exporter](https://github.com/prometheus/node_exporter): referência de métricas expostas sobre o host.
- [kube-state-metrics: documentação oficial](https://github.com/kubernetes/kube-state-metrics): referência de métricas sobre o estado dos objetos Kubernetes.
