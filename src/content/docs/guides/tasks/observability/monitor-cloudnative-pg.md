---
title: Monitorar clusters CloudNativePG
description: Como criar o PodMonitor para um cluster CloudNativePG e quais consultas PromQL acompanham replicação, conexões e saúde do banco.
sidebar:
  order: 7
---

> **Pré-requisitos:** [Prometheus stack instalado](../install-prometheus-stack/), [cluster PostgreSQL criado](../../databases/create-postgresql-cluster/).
> **Versões testadas:** CloudNativePG 1.30.

Cada Pod de um `Cluster` do CloudNativePG expõe métricas Prometheus nativamente na porta `9187`. Esta página cria o `PodMonitor` correspondente e destaca as métricas essenciais para um banco de dados.

## Criar o PodMonitor

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -p "Namespace do cluster PostgreSQL: " PG_NAMESPACE
read -r -p "Nome do cluster: " PG_CLUSTER_NAME

kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: ${PG_CLUSTER_NAME}
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  namespaceSelector:
    matchNames:
      - ${PG_NAMESPACE}
  selector:
    matchLabels:
      cnpg.io/cluster: ${PG_CLUSTER_NAME}
  podMetricsEndpoints:
    - port: metrics
      interval: 30s
EOF
```

## Consultas essenciais

| Pergunta | Consulta PromQL |
| --- | --- |
| Instância primária atual | `cnpg_pg_replication_is_wal_receiver_up` |
| Conexões ativas | `cnpg_backends_total` |
| Atraso de replicação (segundos) | `cnpg_pg_replication_lag` |
| Cluster em estado não saudável | `cnpg_collector_up == 0` |

Um atraso de replicação crescente costuma preceder um failover ou indicar sobrecarga na réplica: trate como alerta de `warning` antes que vire indisponibilidade.

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace monitoring get podmonitor "${PG_CLUSTER_NAME}"
```

Confirme nos targets do Prometheus que os Pods do cluster aparecem `UP` na porta `metrics`.

## Troubleshooting

Se nenhum target aparecer, confirme que os Pods do `Cluster` realmente têm o label `cnpg.io/cluster` com o valor esperado (`kubectl get pods --namespace "${PG_NAMESPACE}" --show-labels`).

## Próximo passo

Configure alertas para atraso de replicação e conexões próximas do limite configurado em `max_connections` (veja [criar um cluster PostgreSQL](../../databases/create-postgresql-cluster/)).

## Fontes e leitura adicional

- [CloudNativePG: Monitoring](https://cloudnative-pg.io/documentation/current/monitoring/): referência oficial de métricas expostas e dashboards prontos do Grafana.
