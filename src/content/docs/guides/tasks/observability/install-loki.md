---
title: Instalar o Loki
description: Como instalar o Loki em modo SingleBinary via Helm e conectá-lo como datasource do Grafana, para armazenar logs indexados apenas por labels.
sidebar:
  order: 9
---

> **Pré-requisitos:** kubeconfig com acesso administrativo à API, StorageClass disponível.
> **Versões testadas:** Loki 3.x (modo `SingleBinary`).

Loki é um backend de logs projetado para indexar apenas metadados (labels), não o conteúdo completo dos logs: isso o torna mais barato de operar que backends que indexam texto completo, ao custo de buscas por conteúdo livre serem mais lentas. Veja [métricas, logs e traces](../../../../learn/observability/metrics-logs-and-traces/) para o papel dos logs na observabilidade.

## Instalar em modo SingleBinary

Para um cluster de nó único, o modo `SingleBinary` (sem componentes distribuídos separados) é suficiente:

> **Executar em:** qualquer máquina com `KUBECONFIG`, Helm e acesso administrativo à API.

```bash
read -r -p "Versão do chart loki: " LOKI_VERSION
read -r -p "Tamanho do volume do Loki (ex.: 20Gi): " LOKI_STORAGE_SIZE
read -r -p "StorageClass a usar: " LOKI_STORAGE_CLASS

helm upgrade --install loki loki \
  --repo https://grafana.github.io/helm-charts \
  --version "${LOKI_VERSION}" \
  --namespace monitoring \
  --set deploymentMode=SingleBinary \
  --set loki.commonConfig.replication_factor=1 \
  --set singleBinary.replicas=1 \
  --set singleBinary.persistence.storageClass="${LOKI_STORAGE_CLASS}" \
  --set singleBinary.persistence.size="${LOKI_STORAGE_SIZE}" \
  --set loki.storage.type=filesystem
```

`replication_factor: 1` é apropriado apenas para nó único; em multinó, revise essa configuração para tolerância a falha real do próprio Loki.

## Conectar o Grafana ao Loki

Se o Grafana já estiver instalado (veja [instalar o Prometheus stack](../install-prometheus-stack/)), adicione o datasource:

```bash
kubectl --namespace monitoring patch configmap kube-prometheus-stack-grafana-datasource --type=merge --patch '
data:
  datasource.yaml: |
    datasources:
      - name: Loki
        type: loki
        url: http://loki:3100
        access: proxy
'
kubectl --namespace monitoring rollout restart deployment/kube-prometheus-stack-grafana
```

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace monitoring get pods -l app.kubernetes.io/name=loki
kubectl --namespace monitoring exec deployment/loki -- wget -qO- http://localhost:3100/ready
```

Deve retornar `ready`. No Grafana, confirme que o datasource Loki responde a uma consulta simples (`Explore` → Loki → `{namespace="monitoring"}`).

## Troubleshooting

Se o Loki não iniciar, confirme capacidade da StorageClass e revise `kubectl --namespace monitoring logs deployment/loki` para erros de configuração de storage.

## Rollback

```bash
helm --namespace monitoring uninstall loki
```

## Próximo passo

[Coletar logs com o Alloy](../collect-logs-with-alloy/) para enviar logs dos Pods ao Loki recém-instalado.

## Fontes e leitura adicional

- [Loki: documentação oficial](https://grafana.com/docs/loki/latest/): arquitetura, modos de implantação e configuração.
- [Loki: Helm chart](https://github.com/grafana/loki/tree/main/production/helm/loki): referência do chart e valores.
