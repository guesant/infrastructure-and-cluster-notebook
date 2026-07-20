---
title: Configurar um ServiceMonitor
description: Como criar um ServiceMonitor para que o Prometheus Operator colete métricas de uma aplicação que já tem um Service com porta nomeada.
sidebar:
  order: 2
---

> **Pré-requisitos:** [Prometheus stack instalado](../install-prometheus-stack/), aplicação expondo métricas em formato Prometheus.
> **Versões testadas:** Prometheus Operator 0.86.

Veja [arquitetura do Prometheus](../../../../learn/observability/prometheus-architecture/) para o conceito de `ServiceMonitor`. Esta página cobre a criação de um para uma aplicação com um `Service` já existente.

## Confirmar que o Service expõe a porta de métricas

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
read -r -p "Namespace da aplicação: " APP_NAMESPACE
read -r -p "Nome do Service: " APP_SERVICE_NAME

kubectl --namespace "${APP_NAMESPACE}" get service "${APP_SERVICE_NAME}" -o yaml | grep -A3 ports
```

A porta usada para métricas precisa ter um `name` (ex.: `metrics`): o `ServiceMonitor` referencia a porta pelo nome, não pelo número.

## Criar o ServiceMonitor

```bash
read -r -p "Nome do ServiceMonitor: " SERVICE_MONITOR_NAME
read -r -p "Label selector do Service (ex.: app.kubernetes.io/name=api): " SERVICE_LABEL_SELECTOR
read -r -p "Nome da porta de métricas: " METRICS_PORT_NAME
read -r -p "Caminho do endpoint de métricas [/metrics]: " METRICS_PATH
METRICS_PATH="${METRICS_PATH:-/metrics}"

SELECTOR_KEY="${SERVICE_LABEL_SELECTOR%%=*}"
SELECTOR_VALUE="${SERVICE_LABEL_SELECTOR#*=}"

kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ${SERVICE_MONITOR_NAME}
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  namespaceSelector:
    matchNames:
      - ${APP_NAMESPACE}
  selector:
    matchLabels:
      ${SELECTOR_KEY}: ${SELECTOR_VALUE}
  endpoints:
    - port: ${METRICS_PORT_NAME}
      path: ${METRICS_PATH}
      interval: 30s
      scrapeTimeout: 10s
EOF
```

O label `release: kube-prometheus-stack` precisa corresponder ao `serviceMonitorSelector` configurado na instância do Prometheus: confirme o valor real se a instalação usou um nome de release diferente.

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace monitoring get servicemonitor "${SERVICE_MONITOR_NAME}"
```

Confirme também nos targets do Prometheus (via port-forward para a interface web, ou `kubectl --namespace monitoring port-forward service/kube-prometheus-stack-prometheus 9090:9090` e acessar `/targets`) que o target aparece com estado `UP`.

## Troubleshooting

Um manifesto aceito pela API não prova que o target foi descoberto: veja a tabela de diagnóstico em [observabilidade e alertas](../../../../operations/observability/observability-and-alerting/#limitações-e-diagnóstico) para os pontos de verificação (labels do Service, porta nomeada, RBAC, NetworkPolicy).

## Rollback

```bash
kubectl --namespace monitoring delete servicemonitor "${SERVICE_MONITOR_NAME}"
```

## Próximo passo

Configure um alerta para a aplicação recém-instrumentada; veja o exemplo de `PrometheusRule` em [observabilidade e alertas](../../../../operations/observability/observability-and-alerting/#alerta-mínimo-com-prometheusrule).

## Fontes e leitura adicional

- [Prometheus Operator: ServiceMonitor API reference](https://prometheus-operator.dev/docs/api-reference/api/#monitoring.coreos.com/v1.ServiceMonitor): referência completa dos campos.
