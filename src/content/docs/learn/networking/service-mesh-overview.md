---
title: Service Mesh — Istio e Linkerd
sidebar:
  order: 5
---

> **Para quem é:** operadores com clusters maduros que precisam de observabilidade, segurança, e roteamento avançado entre serviços.

Service mesh é um padrão de infraestrutura que gerencia comunicação entre microserviços. Istio e Linkerd são as principais implementações.

## O problema que service mesh resolve

**Sem service mesh:**

```yaml
Pod A → Pod B (qual versão? seguro? latência?)
```yaml

Cada aplicação precisa lidar com:

- Roteamento inteligente (canary, A/B)
- Retries e timeouts
- Circuit breakers
- Mutual TLS
- Observabilidade (traces, métricas)

**Com service mesh:**

```yaml
Pod A → Sidecar proxy → Network → Sidecar proxy → Pod B
        (Istio/Linkerd lidam com tudo)
```yaml

---

## Istio — Poderoso mas complexo

**Funcionalidade:**

- Roteamento L7 (HTTP headers, match path, etc)
- Canary deployments
- Mutual TLS automático
- Circuit breakers
- Rate limiting
- Observabilidade (traces, métricas)
- Service mesh federado (multi-cluster)

**Setup:**

- Adiciona ~15 components
- Configuração via CRDs (`VirtualService`, `DestinationRule`)
- Curva de aprendizado steep

**Quando usar:**

- Clusters grandes (100+ serviços)
- Roteamento complexo necessário
- Precisão de observabilidade crítica
- Multi-cluster

---

## Linkerd — Simples e leve

**Funcionalidade:**

- Roteaming básico (load balancing)
- Mutual TLS automático
- Observabilidade (métricas, dashboards)
- Retries e timeouts automáticos
- Policy-based access control

**Setup:**

- Mínimo (helm install, ~2 components)
- Configuração via simples annotations
- Curva de aprendizado suave

**Quando usar:**

- Clusters médios (<50 serviços)
- Quer simplicidade first
- Não precisa de roteamento L7 sofisticado
- Observabilidade básica suficiente

---

## Comparação

| Aspecto | Istio | Linkerd |
| --------- | ------- | --------- |
| **Complexidade** | Alto | Baixo |
| **Resources** | ~5GB | ~500MB |
| **Roteamento** | L7 avançado | L4 básico |
| **Latency overhead** | ~50ms | ~5ms |
| **Learning curve** | Steep | Gentle |
| **Production ready** | ✅ Sim | ✅ Sim (Buoyant) |
| **Cost** | Alto (resources) | Baixo |
| **Community** | Enorme (CNCF) | Menor |

---

## Decisão prática

**Escolha Istio se:**

- Clusters grandes (100+ serviços)
- Roteamento complexo (canary, A/B)
- Equipe dedicada a observabilidade
- Multi-cluster necessário

**Escolha Linkerd se:**

- Começando com service mesh
- Clusters médios
- Quer simplicidade
- Budget apertado (resource-constrained)

**Nem Istio nem Linkerd se:**

- Menos de 10 serviços
- Comunicação simples (sem canary/observabilidade avançada)
- Kernel antigo (Cilium eBPF alternativo)

---

## Alternativa: CNI nativa

**Cilium mesh** oferece funcionalidade service mesh usando eBPF nativo (sem sidecars):

- Sem latência adicional
- Sem sidecars (menores recursos)
- Observabilidade Hubble nativa

Trade-off: menos madura que Istio/Linkerd.

---

## Setup mínimo

### Istio

```bash
istioctl install --set profile=demo -y
# Injetar sidecars automáticamente
kubectl label namespace default istio-injection=enabled
```yaml

### Linkerd

```bash
helm install linkerd2 linkerd/linkerd2 -n linkerd --create-namespace
# Injetar sidecars via anotação
kubectl annotate namespace default linkerd.io/inject=enabled
```yaml

---

## Observabilidade incluída

Ambas oferecem:

- **Métricas:** request latency, error rates, throughput
- **Traces:** end-to-end request tracing
- **Dashboards:** Grafana/Kiali integrado

Linkerd oferece via Prometheus + Grafana; Istio via Kiali.

---

## Referências

- [Istio documentation](https://istio.io/latest/docs/): guia oficial.
- [Linkerd documentation](https://linkerd.io/2/reference/): guia oficial.
- [Service mesh comparison](https://layer5.io/service-mesh-landscape): Layer5 landscape.
