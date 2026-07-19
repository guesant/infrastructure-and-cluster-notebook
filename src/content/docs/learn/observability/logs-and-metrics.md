---
title: Logs e Métricas — Prometheus, Loki, Grafana
sidebar:
  order: 2
---

> **Para quem é:** operadores que precisam observabilidade de produção (logs centralizados + métricas).

Logs e métricas são os pilares de observabilidade. Prometheus coleta métricas; Loki coleta logs; Grafana visualiza ambos.

## O problema

**Sem observabilidade:**

- Pod morre, você não vê por quê
- API lenta, não sabe onde
- Impossível debugar em produção

**Com observabilidade:**

- Grafana mostra CPU/memória/latência em tempo real
- Loki centraliza logs de todos os pods
- Alertas disparam antes de disaster

---

## Prometheus — Métricas

**O que é:**

- Time-series database para métricas
- Scrape targets (aplicações que expõem `/metrics`)
- PromQL (linguagem de query)

**Funcionalidade:**

- Coleta métricas (CPU, memória, requisições, latência)
- Retenção configurável (15d padrão)
- Alertas via Alertmanager
- Integração Grafana

**Quando usar:**

- Observabilidade padrão de Kubernetes
- Métricas time-series
- Alertas baseados em thresholds

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```yaml

---

## Loki — Logs

**O que é:**

- Log aggregation simples (não indexa full-text)
- Coleta via Promtail (agent) ou docker logging driver
- Labels (ex: `job=api, container=web`)

**Funcionalidade:**

- Logs centralizados em um lugar
- Retenção configurável
- Query via LogQL (similar ao PromQL)
- Integração Grafana

**Quando usar:**

- Logs de todos os pods em um lugar
- Troubleshooting rápido
- Sem elasticsearch complexity

```bash
helm install loki loki-stack/loki-stack \
  --namespace logging --create-namespace
```yaml

---

## Grafana — Visualização

**O que é:**

- Dashboard + alerting visual
- Conecta múltiplas data sources (Prometheus, Loki, Elasticsearch, etc.)

**Funcionalidade:**

- Dashboards em tempo real
- Alertas visual
- Thresholds automáticos
- Plugins

**Quando usar:**

- Sempre (é o padrão de visualização)

```bash
helm install grafana prometheus-community/grafana \
  --namespace monitoring
```yaml

---

## Stack típica

```yaml
Aplicações
  ├─ Prometheus scrape /metrics (2-way)
  └─ Promtail shipper (logs → Loki)
       ↓
Prometheus ← Alertmanager (alertas)
       ↓
    Grafana (visualização)
       ↓
    Dashboard
```yaml

---

## Comparação com alternativas

| Tool | Tipo | Simples? | Escala |
| --- | --- | --- | --- |
| **Prometheus** | Métricas | ✅ | ~1M series |
| **Thanos** | Prometheus HA | ⚠️ | Multi-cluster |
| **Loki** | Logs | ✅ | ⬆️ Escalável |
| **Elasticsearch** | Logs | ❌ (pesado) | Massivo |
| **Grafana** | Visualização | ✅ | Qualquer |

---

## Alertas práticos

### Prometheus: Pod restartando

```yaml
- alert: PodRestartingTooOften
  expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
  for: 5m
  annotations:
    summary: "Pod {{ $labels.pod }} restarting too often"
```yaml

### Loki: Errors em logs

```yaml
alerts:
  - alert: ErrorsIncreasing
    expr: |
      sum by (job) (rate({level="error"} [5m])) > 10
```yaml

---

## Best practices

1. **Retenção sensata:** 15d Prometheus, 7d Loki (reduz custo)
2. **Labels bem-planejados:** facilita query depois
3. **Alertas não ruidosos:** 80/20 (20% dos alertas cobrem 80% dos problemas)
4. **Dashboards por persona:** DevOps dashboard ≠ SRE dashboard

---

## Próximas seções

- [Instalar Prometheus + Loki + Grafana](../../../guides/tasks/observability/install-prometheus-loki-grafana/) — stack completa.
- [Queries Prometheus](../../../toolbox/commands/prometheus/) — PromQL cookbook.

---

## Referências

- [Prometheus documentation](https://prometheus.io/docs/): guia oficial.
- [Loki documentation](https://grafana.com/docs/loki/latest/): guia oficial.
- [Grafana documentation](https://grafana.com/docs/grafana/): guia oficial.
