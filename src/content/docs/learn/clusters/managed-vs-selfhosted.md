---
title: Managed vs. Self-hosted — EKS, GKE, AKS vs. K3s, RKE2
sidebar:
  order: 12
---

> **Para quem é:** organizações escolhendo entre Kubernetes gerenciado (cloud) vs. self-hosted (on-prem ou VMs).

Kubernetes é Kubernetes, mas a experiência operacional muda radicalmente.

## Managed (Cloud)

**Oferecido por cloud providers:**

- AWS EKS
- Google GKE
- Azure AKS
- DigitalOcean Kubernetes
- Linode Kubernetes Engine

**Você gerencia:**

- Worker nodes (às vezes Fargate, sem nodes)
- Aplicações
- Segurança de aplicação

**AWS gerencia:**

- Control plane (API, etcd, controllers)
- Patches e upgrades
- HA by default (multi-zone)
- Integração com serviços AWS (IAM, RDS, S3, etc.)

---

## Self-hosted (K3s, RKE2)

**Você gerencia tudo:**

- Infraestrutura (VMs, rede, storage)
- Control plane (servidores K3s)
- Datastore (etcd, PostgreSQL com Kine)
- Patches e upgrades

**Você controla:**

- Custo (paga por VMs, não por control plane)
- Tecnologia (não quer AWS lock-in)
- Configuração (exatamente o que quer)

---

## Comparação financeira

### AWS EKS (3 nós t3.medium)

```yaml
Control plane: $0.10/hora (~$73/mês)
Nodes (3x t3.medium): $0.042 × 3 × 730h/mês = $92/mês
Data transfer: ~$10/mês (estimate)
Total: ~$175/mês
```yaml

### K3s self-hosted (3 nós t3.medium na AWS)

```yaml
Nodes (3x t3.medium): $0.042 × 3 × 730h/mês = $92/mês
Data transfer: ~$5/mês
Total: ~$97/mês (sem control plane AWS)
```yaml

**EKS é ~80% mais caro** (mas você paga pela conveniência).

---

## Decisão matrix

| Critério | Managed | Self-hosted |
| ---------- | --------- | --- |
| **Setup** | 10 min (console) | 5 min (script) |
| **Operação** | Minimal | Medium |
| **Custo** | Alto (control plane + nós) | Baixo (nós só) |
| **Lock-in** | Cloud provider | Nenhum |
| **Multi-cloud** | Não | Sim |
| **Compliance** | Cloud-native | Seu controle |
| **Escala** | Ilimitada | Limitada por infra |
| **HA** | Automática | Manual (Fase 9) |
| **Skill required** | Baixo | Médio |

---

## Quando usar Managed

✅ **Use EKS/GKE se:**

- Já é cloud-native (AWS/Google)
- Quer delegar ops (sem especialista K8s)
- HA crítica (99.9% SLA)
- Equipe pequena

❌ **Não use se:**

- Multi-cloud (quer portabilidade)
- Budget apertado
- On-prem só
- Compliance rígida não-cloud

---

## Quando usar Self-hosted

✅ **Use K3s/RKE2 se:**

- On-prem ou multi-cloud
- Quer controle total
- Budget reduzido
- Equipe ops experiente

❌ **Não use se:**

- Quer zero operational overhead
- Compliance cloud-native (EKS + AWS compliance melhor)
- Escala masiva (1000+ nós)

---

## Padrão híbrido

**Muitas organizações fazem:**

```yaml
Dev/Test → K3s local (laptop)
Staging → RKE2 self-hosted (dedicated VMs)
Production → EKS (HA, compliance, multi-zone)
```yaml

Arquitetura porta (mesmos YAMLs), operação customizada por ambiente.

---

## Migração: Self-hosted → Managed

Se começar com K3s e depois mudar para EKS:

1. **Prepara EKS** (nova cluster)
2. **Migra workloads** (mesma API Kubernetes, YAMLs rodão)
3. **Cutover** (tráfego para EKS)
4. **Desliga K3s** (keep backup por 1 semana)

RTO: ~1 hora (para aplicações simples). Datastore grande = mais tempo.

---

## Referências

- [AWS EKS pricing](https://aws.amazon.com/eks/pricing/): calculadora.
- [Google GKE pricing](https://cloud.google.com/kubernetes-engine/pricing): calculadora.
- [K3s vs. Managed](https://docs.k3s.io/): padrão K3s.
- [Cost optimization](https://aws.amazon.com/blogs/containers/cost-optimization-for-kubernetes-on-aws/): AWS blog.
