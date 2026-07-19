---
title: Instalar o kube-prometheus-stack
sidebar:
  order: 1
---

> **Pré-requisitos:** kubeconfig com acesso administrativo à API, StorageClass disponível para volumes persistentes.
> **Versões testadas:** kube-prometheus-stack 68.x (chart), Kubernetes 1.36.

O kube-prometheus-stack reúne Prometheus Operator, Prometheus, Alertmanager, Grafana e exporters (`node-exporter`, `kube-state-metrics`) em um único chart. Veja [arquitetura do Prometheus](../../../../learn/observability/prometheus-architecture/) antes de instalar, e a política completa em [observabilidade e alertas](../../../../operations/observability/observability-and-alerting/).

## Instalar o chart

> **Executar em:** qualquer máquina com `KUBECONFIG`, Helm e acesso administrativo à API.

```bash
read -r -p "Versão do chart kube-prometheus-stack: " KUBE_PROMETHEUS_STACK_VERSION
read -r -p "Tamanho do volume do Prometheus (ex.: 20Gi): " PROMETHEUS_STORAGE_SIZE
read -r -p "Tamanho do volume do Grafana (ex.: 5Gi): " GRAFANA_STORAGE_SIZE
read -r -p "StorageClass a usar: " MONITORING_STORAGE_CLASS

helm upgrade --install kube-prometheus-stack kube-prometheus-stack \
  --repo https://prometheus-community.github.io/helm-charts \
  --version "${KUBE_PROMETHEUS_STACK_VERSION}" \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName="${MONITORING_STORAGE_CLASS}" \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage="${PROMETHEUS_STORAGE_SIZE}" \
  --set grafana.persistence.enabled=true \
  --set grafana.persistence.storageClassName="${MONITORING_STORAGE_CLASS}" \
  --set grafana.persistence.size="${GRAFANA_STORAGE_SIZE}"
```yaml

Sem persistência configurada, o Prometheus e o Grafana perdem dados/dashboards a cada reinício do Pod — não deixe os campos de storage nos valores padrão sem revisão.

## Definir retenção

Ajuste a retenção conforme decidido em [retenção e cardinalidade](../../../../learn/observability/retention/):

```bash
read -r -p "Retenção do Prometheus (ex.: 15d): " PROMETHEUS_RETENTION

helm upgrade kube-prometheus-stack kube-prometheus-stack \
  --repo https://prometheus-community.github.io/helm-charts \
  --version "${KUBE_PROMETHEUS_STACK_VERSION}" \
  --namespace monitoring \
  --reuse-values \
  --set prometheus.prometheusSpec.retention="${PROMETHEUS_RETENTION}"
```yaml

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace monitoring get pods
kubectl --namespace monitoring get prometheus,alertmanager
kubectl get crd servicemonitors.monitoring.coreos.com prometheusrules.monitoring.coreos.com
```yaml

Todos os Pods devem estar `Running`, e os CRDs do Prometheus Operator devem existir antes de criar qualquer `ServiceMonitor`.

## Acessar o Grafana

> **Executar em:** estação administrativa com `KUBECONFIG` e acesso à API.

```bash
read -r -p "Porta local para o Grafana [3000]: " LOCAL_PORT
LOCAL_PORT="${LOCAL_PORT:-3000}"

kubectl --namespace monitoring \
  port-forward service/kube-prometheus-stack-grafana "${LOCAL_PORT}:80"
```yaml

A senha inicial do usuário `admin` é gerada e armazenada em um Secret:

```bash
kubectl --namespace monitoring get secret kube-prometheus-stack-grafana \
  --output jsonpath='{.data.admin-password}' | base64 --decode
printf '\n'
```yaml

## Troubleshooting

Se os Pods do Prometheus ficarem `Pending`, confirme capacidade da StorageClass (veja [validar requisitos do host](../../../host/validate-host-requirements/)). Se o Grafana não carregar dashboards, confirme que o datasource padrão aponta para o Service do Prometheus correto (`kube-prometheus-stack-prometheus`).

## Rollback

```bash
helm --namespace monitoring uninstall kube-prometheus-stack
```yaml

:::danger
A desinstalação não remove automaticamente os PVCs por padrão do Helm — confirme se isso é desejado antes de excluir os PersistentVolumeClaims manualmente.
:::

## Próximo passo

[Configurar um ServiceMonitor](../configure-service-monitor/) para uma aplicação, e [monitorar os nós K3s](../monitor-k3s-nodes/).

## Fontes e leitura adicional

- [kube-prometheus-stack — Prometheus Community](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack): chart, valores e notas de versão.
- [Prometheus Operator — documentação oficial](https://prometheus-operator.dev/): arquitetura e CRDs do operator.
