---
title: Distributed Tracing — Jaeger e OpenTelemetry
sidebar:
  order: 4
---

> **Para quem é:** operadores com múltiplos serviços que querem ver como requests fluem através de toda arquitetura.

Distributed tracing complementa logs e métricas — mostra o caminho completo de um request através dos serviços.

## O problema

**Sem tracing:**
- Serviço A chama B, B chama C
- Erro acontece em C
- Como isso afetou A e B? Timeline inteira perdida

**Com tracing:**
```
Request ID: abc123
├─ Service A (200ms)
│  ├─ Database query (50ms)
│  └─ Call to Service B (100ms)
│     ├─ Service B (80ms)
│     └─ Call to Service C (20ms, ERROR)
```

## Jaeger — Distribuído, simples

**O que é:**
- Tracing system de código aberto
- Coleta traces, armazena, visualiza

**Funcionalidade:**
- Colector de agents (push) ou SDK (pull)
- Storage backend (in-memory, Elasticsearch, Cassandra)
- UI para explorar traces
- Sampling (enviar 1% dos traces para reduzir volume)

**Quando usar:**
- Setup padrão tracing
- Elasticsearch ou Cassandra já em uso
- Quer UI simples

---

## OpenTelemetry — Padrão universal

**O que é:**
- Standard aberto para tracing, métricas, logs
- Não é backend — é a spec + SDKs

**Funcionalidade:**
- Instrumentação agnóstica (escreve 1x, exporta para qualquer backend)
- Jaeger, Datadog, New Relic, AWS X-Ray todos suportam OTLP (OpenTelemetry Protocol)
- Baggage (metadados entre spans)

**Quando usar:**
- Quer portabilidade (trocar backend depois)
- Multi-cloud ou multi-vendor
- Integração com logs + métricas

---

## Comparação

| Aspecto | Jaeger | OpenTelemetry |
|---------|--------|---|
| **O que é** | Backend de tracing | Padrão + SDKs (agnóstico) |
| **Backend** | Jaeger em si | Exporta para qualquer backend |
| **Instrumentação** | Jaeger SDK | OTEL SDK + exportador |
| **Portabilidade** | Preso ao Jaeger | Portável (troca backend fácil) |
| **Curva** | Média | Média (mais configuração) |

## Decisão prática

**Use Jaeger se:**
- Setup rápido (tudo em uma ferramenta)
- Elasticsearch ou Cassandra já em uso

**Use OpenTelemetry se:**
- Quer independência de vendor
- Planeja multi-cloud
- Já usa logs + métricas (quer integração)

---

## Setup mínimo

### Jaeger
```bash
# Rodar Jaeger (all-in-one, dev only)
docker run --rm -p 6831:6831/udp -p 16686:16686 \
  jaegertracing/all-in-one:latest
# UI em http://localhost:16686
```

### OpenTelemetry Collector
```bash
helm install otel-collector open-telemetry/opentelemetry-collector \
  --set mode=daemonset \
  --set exporters.jaeger.endpoint=jaeger-collector:14250
```

---

## Instrumentation patterns

Aplicação precisa enviar spans:

```python
# Python exemplo (OTEL SDK)
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("operation") as span:
    span.set_attribute("user.id", 123)
    # código aqui é rastreado
```

---

## Sampling

Enviar 100% dos traces = custo alto. Sampling reduz:

```yaml
sampler:
  type: probabilistic
  param: 0.1  # 10% dos traces
```

Recomendação: 1-10% em production, 100% em dev/test.

---

## Referências

- [Jaeger documentation](https://www.jaegertracing.io/): guia oficial.
- [OpenTelemetry documentation](https://opentelemetry.io/docs/): padrão.
- [OTLP specification](https://github.com/open-telemetry/opentelemetry-specification): spec técnica.
