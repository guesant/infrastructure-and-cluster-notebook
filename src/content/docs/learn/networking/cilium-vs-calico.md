---
title: Cilium vs. Calico — CNI plugins para Kubernetes
sidebar:
  order: 4
---

> **Para quem é:** operadores K3s/Kubernetes escolhendo entre Cilium (eBPF) e Calico (network policies).

Ambas substituem Flannel (CNI padrão K3s), oferecendo networking mais robusto. Cilium é moderna (eBPF); Calico é confiável (iptables).

## Comparação rápida

| Aspecto | Cilium | Calico |
| --------- | -------- | -------- |
| **Tecnologia** | eBPF nativo (kernel 5.8+) | iptables/ebpf híbrido |
| **Network policies** | ✅ L3-L7 | ✅ L3-L4 |
| **Performance** | Alto (kernel) | Médio (iptables overhead) |
| **Service mesh** | Cilium Mesh (integrado) | Precisa Istio |
| **Observabilidade** | Hubble (nativa) | Requer ferramentas |
| **Setup** | Simples | Simples |
| **Production ready** | ✅ Sim (CNCF graduated) | ✅ Sim (Tigera support) |
| **Suporte** | Isovalent (empresa) | Tigera (empresa) |

## Cilium — Moderno (eBPF)

**Pontos fortes:**

- Velocidade nativa do kernel (eBPF)
- Service mesh integrado (sem Istio)
- Observabilidade Hubble out-of-the-box
- Network policies até camada de aplicação (L7)
- Melhor em workloads high-performance

**Requisito:**

- Kernel ≥ 5.8 (Linux 5.8+, ou RHEL 8.2+)
- Sem Windows nodes (eBPF é Linux)

**Quando usar:**

- Performance crítica
- Quer service mesh nativo
- Labs/clusters modernos

---

## Calico — Maduro (iptables)

**Pontos fortes:**

- Suportado em kernels antigos (5.0+, até mais velhos)
- Network policies sofisticadas
- Suporte para AWS, GCP, on-prem
- BGP nativo (mais opções de roteamento)
- Suporte empresarial Tigera

**Simplicidade:**

- Menos dependências
- Funciona em ambientes antigos

**Quando usar:**

- Clusters legados (kernel < 5.8)
- Já usa BGP
- Infraestrutura heterogênea

---

## Decisão prática

**Cilium se:**

- Kernel ≥ 5.8
- Quer performance
- Quer service mesh nativo
- Lab moderno

**Calico se:**

- Kernels mais antigos
- Precisa compatibilidade
- Quer suporte empresarial (Tigera)
- Usa BGP nativo

**Alternativa:** Flannel (padrão K3s) — funciona, simples, mas sem network policies avançadas.

---

## Instalação rápida

### Cilium

```bash
helm repo add cilium https://helm.cilium.io
helm install cilium cilium/cilium --namespace kube-system \
  --set kubeProxyReplacement=strict
```yaml

### Calico

```bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/tigera-operator.yaml
```yaml

---

## Network Policies exemplo

Ambas suportam `NetworkPolicy` Kubernetes padrão:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```yaml

Cilium adiciona `CiliumNetworkPolicy` para L7 (DNS, HTTP).

---

## Referências

- [Cilium documentation](https://docs.cilium.io/): guia oficial.
- [Calico documentation](https://docs.tigera.io/calico/latest/about/): guia oficial.
- [Network policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/): spec Kubernetes.
