---
title: Configurar o Alertmanager
sidebar:
  order: 8
---

> **Pré-requisitos:** [Prometheus stack instalado](../install-prometheus-stack/).
> **Versões testadas:** Alertmanager (empacotado pelo kube-prometheus-stack).

Veja [alertas acionáveis](../../../../learn/observability/alerting/) para os princípios antes de configurar roteamento. Esta página cria uma configuração mínima com um receptor real.

## Configurar um receptor

Exemplo com um webhook do Slack; adapte ao destino real do ambiente:

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -s -p "URL do webhook do Slack: " SLACK_WEBHOOK_URL
printf '\n'

kubectl --namespace monitoring create secret generic alertmanager-slack-webhook \
  --from-literal=url="${SLACK_WEBHOOK_URL}"
```yaml

```bash
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  name: default-routing
  namespace: monitoring
  labels:
    alertmanagerConfig: kube-prometheus-stack
spec:
  route:
    groupBy: ["alertname", "severity"]
    groupWait: 30s
    groupInterval: 5m
    repeatInterval: 4h
    receiver: slack-default
    routes:
      - matchers:
          - name: severity
            value: critical
        receiver: slack-default
        repeatInterval: 1h
  receivers:
    - name: slack-default
      slackConfigs:
        - apiURL:
            name: alertmanager-slack-webhook
            key: url
          channel: "#alerts"
          sendResolved: true
EOF
```yaml

## Validação

Dispare um alerta de teste (uma regra temporária com `expr: vector(1)`) e confirme a entrega:

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: teste-alertmanager
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  groups:
    - name: teste.rules
      rules:
        - alert: TesteDeEntrega
          expr: vector(1)
          for: 1m
          labels:
            severity: critical
          annotations:
            summary: "Teste de entrega do Alertmanager"
EOF
```yaml

Confirme o recebimento no canal configurado e depois **remova a regra de teste**:

```bash
kubectl --namespace monitoring delete prometheusrule teste-alertmanager
```yaml

## Troubleshooting

Se o alerta não chegar ao Slack, confirme o Secret referenciado em `apiURL.name`/`key`, e revise `kubectl --namespace monitoring logs statefulset/alertmanager-kube-prometheus-stack-alertmanager` para erros de entrega.

## Rollback

```bash
kubectl --namespace monitoring delete alertmanagerconfig default-routing
kubectl --namespace monitoring delete secret alertmanager-slack-webhook
```yaml

## Próximo passo

Configure um *dead-man switch* — veja o procedimento em [observabilidade e alertas](../../../../operations/observability/observability-and-alerting/#teste-ponta-a-ponta-e-metamonitoramento) para o conceito completo.

## Fontes e leitura adicional

- [Alertmanager — Prometheus](https://prometheus.io/docs/alerting/latest/alertmanager/): referência oficial de agrupamento, roteamento e silêncios.
- [AlertmanagerConfig — Prometheus Operator](https://prometheus-operator.dev/docs/user-guides/alerting/): documenta a configuração declarativa de roteamento via CRD.
