---
title: Configurar um PodMonitor
description: Como criar um PodMonitor para coletar métricas de Pods que não têm um Service estável correspondente.
sidebar:
  order: 3
---

> **Pré-requisitos:** [Prometheus stack instalado](../install-prometheus-stack/), Pods expondo métricas em formato Prometheus sem um Service estável.
> **Versões testadas:** Prometheus Operator 0.86.

Um `PodMonitor` seleciona Pods diretamente, sem depender de um `Service`: útil quando os Pods não têm (ou não deveriam ter) um Service correspondente. Veja [arquitetura do Prometheus](../../../../learn/observability/prometheus-architecture/) para quando preferir `PodMonitor` a [ServiceMonitor](../configure-service-monitor/).

## Criar o PodMonitor

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -p "Namespace dos Pods: " APP_NAMESPACE
read -r -p "Nome do PodMonitor: " POD_MONITOR_NAME
read -r -p "Label selector dos Pods (ex.: app.kubernetes.io/name=worker): " POD_LABEL_SELECTOR
read -r -p "Nome ou número da porta de métricas: " METRICS_PORT
read -r -p "Caminho do endpoint de métricas [/metrics]: " METRICS_PATH
METRICS_PATH="${METRICS_PATH:-/metrics}"

SELECTOR_KEY="${POD_LABEL_SELECTOR%%=*}"
SELECTOR_VALUE="${POD_LABEL_SELECTOR#*=}"

kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: ${POD_MONITOR_NAME}
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
  podMetricsEndpoints:
    - port: ${METRICS_PORT}
      path: ${METRICS_PATH}
      interval: 30s
EOF
```

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace monitoring get podmonitor "${POD_MONITOR_NAME}"
```

Confirme nos targets do Prometheus que os Pods selecionados aparecem com estado `UP`.

## Troubleshooting

Se nenhum target aparecer, confirme que `podMonitorSelector` da instância do Prometheus aceita este objeto (mesmo `release` label) e que os Pods realmente têm os labels usados no seletor: `kubectl get pods --namespace "${APP_NAMESPACE}" --show-labels`.

## Rollback

```bash
kubectl --namespace monitoring delete podmonitor "${POD_MONITOR_NAME}"
```

## Próximo passo

[Configurar o Alertmanager](../configure-alertmanager/) para os alertas relacionados a este workload.

## Fontes e leitura adicional

- [Prometheus Operator: PodMonitor API reference](https://prometheus-operator.dev/docs/api-reference/api/#monitoring.coreos.com/v1.PodMonitor): referência completa dos campos.
