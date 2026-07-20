---
title: Expor métricas do Traefik
description: Como habilitar o endpoint Prometheus do Traefik empacotado pelo K3s via HelmChartConfig e criar o ServiceMonitor correspondente.
sidebar:
  order: 4
---

> **Pré-requisitos:** [Prometheus stack instalado](../install-prometheus-stack/), [Traefik configurado via Gateway API](../../networking/configure-traefik-gateway-api/).
> **Versões testadas:** Traefik (empacotado pelo K3s).

O Traefik empacotado pelo K3s não expõe métricas Prometheus por padrão. Esta página habilita o endpoint de métricas e cria o `ServiceMonitor` correspondente.

## Habilitar métricas no Traefik

Adicione ao `HelmChartConfig` do Traefik (o mesmo objeto usado em [Gateway API e Traefik](../../networking/configure-traefik-gateway-api/)):

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
kubectl --namespace kube-system patch helmchartconfig traefik --type=merge --patch '
spec:
  valuesContent: |-
    metrics:
      prometheus:
        entryPoint: metrics
    ports:
      metrics:
        port: 9100
        expose:
          default: false
'
```

Combine este patch com os valores já existentes de `providers.kubernetesGateway` e `ports.web`/`ports.websecure`: não sobrescreva a configuração inteira, apenas adicione a seção `metrics`.

```bash
kubectl --namespace kube-system rollout status deployment/traefik --timeout=180s
```

## Criar o ServiceMonitor

```bash
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: traefik
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  namespaceSelector:
    matchNames:
      - kube-system
  selector:
    matchLabels:
      app.kubernetes.io/name: traefik
  endpoints:
    - port: metrics
      path: /metrics
      interval: 30s
EOF
```

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace monitoring get servicemonitor traefik
kubectl --namespace kube-system get service traefik -o yaml | grep -A2 "name: metrics"
```

Confirme nos targets do Prometheus que o target `traefik` aparece `UP`, e que métricas como `traefik_service_requests_total` aparecem em uma consulta de teste.

## Troubleshooting

Se a porta `metrics` não aparecer no Service do Traefik, confirme que o `HelmChartConfig` foi realmente reconciliado (`kubectl --namespace kube-system describe helmchart traefik` para erros de aplicação do Helm gerenciado pelo K3s).

## Rollback

```bash
kubectl --namespace monitoring delete servicemonitor traefik
```

## Próximo passo

Use as métricas do Traefik para os quatro sinais de serviço (latência, tráfego, erros, saturação) descritos em [observabilidade e alertas](../../../../operations/observability/observability-and-alerting/#sinais-de-serviço-e-disponibilidade), aplicados ao tráfego de entrada do cluster.

## Fontes e leitura adicional

- [Traefik: Metrics](https://doc.traefik.io/traefik/observability/metrics/overview/): referência oficial de métricas e formatos suportados.
- [Traefik: Prometheus](https://doc.traefik.io/traefik/observability/metrics/prometheus/): configuração específica do backend Prometheus.
