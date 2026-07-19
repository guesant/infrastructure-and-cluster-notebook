---
title: Monitorar o Longhorn
sidebar:
  order: 6
---

> **Pré-requisitos:** [Prometheus stack instalado](../install-prometheus-stack/), [Longhorn instalado](../../storage/install-longhorn/).
> **Versões testadas:** Longhorn 1.12.0.

O Longhorn expõe métricas Prometheus nativamente pelo manager, mas nenhum `ServiceMonitor` é criado automaticamente — esta página cria a instrumentação e destaca as métricas essenciais.

## Criar o ServiceMonitor

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: longhorn
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  namespaceSelector:
    matchNames:
      - longhorn-system
  selector:
    matchLabels:
      app: longhorn-manager
  endpoints:
    - port: manager
      path: /metrics
      interval: 30s
EOF
```yaml

## Consultas essenciais

| Pergunta | Consulta PromQL |
| --- | --- |
| Capacidade usada por volume | `longhorn_volume_actual_size_bytes` |
| Volumes degradados | `longhorn_volume_robustness == 2` (valor `2` representa `degraded`) |
| Capacidade livre por disco | `longhorn_disk_capacity_bytes - longhorn_disk_usage_bytes` |
| Snapshots por volume | `longhorn_volume_snapshot_size_bytes` |

Um volume `degraded` significa que ao menos uma réplica está indisponível — não é uma indisponibilidade do volume em si (ainda há réplicas saudáveis), mas reduz a tolerância a falha adicional e merece investigação antes que uma segunda réplica também falhe.

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace monitoring get servicemonitor longhorn
```yaml

Confirme nos targets do Prometheus que o target `longhorn` está `UP` e que as consultas acima retornam dados.

## Troubleshooting

Se nenhuma métrica aparecer, confirme o label exato do Service do Longhorn manager (`kubectl --namespace longhorn-system get service --show-labels`) — o valor usado no `selector` acima é o padrão da instalação via Helm, mas pode variar conforme a versão do chart.

## Próximo passo

Configure alertas para volumes degradados e capacidade de disco baixa — veja [revisão de capacidade de disco](../../../../operations/maintenance/disk-capacity-review/) para os limiares operacionais já definidos.

## Fontes e leitura adicional

- [Longhorn — Monitoring](https://longhorn.io/docs/1.12.0/monitoring/): referência oficial de métricas expostas e integração com Prometheus.
