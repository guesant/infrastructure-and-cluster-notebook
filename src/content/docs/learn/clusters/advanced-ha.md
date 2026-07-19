---
title: Alta Disponibilidade Avançada — Além de multinode
sidebar:
  order: 10
---

> **Para quém é:** operadores com clusters produção que precisam de SLA 99.9%+ e resiliência a múltiplos pontos de falha.

Multinode (Fase 5) oferece redundância básica. HA avançada elimina single points of failure:

- Control plane geograficamente disperso
- Datastore externo com replicação
- Load balancing e failover automático

## Além de multinode (Fase 5)

Fase 5 cobriu:

- N servidores K3s (quorum raft)
- Etcd distribuído
- Perde 1 servidor, cluster continua

**HA avançada vai além:**

- Zona de falha múltipla (cloud regions, data centers)
- Datastore externo (PostgreSQL HA, etcd cluster)
- API server loadbalanced
- Kubelet self-healing automático

---

## Arquitetura multi-zona

```yaml
Data Center A        Data Center B         Data Center C
  ├─ K3s server 1     ├─ K3s server 2      ├─ K3s server 3
  │  ├─ etcd          │  ├─ etcd           │  ├─ etcd
  │  └─ API 6443      │  └─ API 6443       │  └─ API 6443
  │
  ├─ Worker 1         ├─ Worker 2          ├─ Worker 3
  └─ Worker 4         └─ Worker 5          └─ Worker 6

Cloud LB (multi-zona)
  └─ 6443 (API servers)
```yaml

Perder DC A inteiro → cluster continua (quorum em B+C).

---

## Datastore externo com replicação

**K3s com PostgreSQL HA:**

```yaml
K3s 1 → PostgreSQL Primary (DC-A)
K3s 2 →   ↓ (async replication)
K3s 3 → PostgreSQL Replica (DC-B)
        Replica (DC-C)
```yaml

Vantagens:

- Etcd não é bottleneck
- PostgreSQL clustering (já testado em production)
- Failover automático com ferramentas como Patroni

---

## Control plane load balancing

**Sem LB:**

```yaml
kubeconfig:
  server: https://k3s-1:6443  # Single point
```yaml

**Com LB:**

```yaml
kubeconfig:
  server: https://api.cluster.local:6443

Cloud LB
  ├─ k3s-1:6443
  ├─ k3s-2:6443
  └─ k3s-3:6443
```yaml

Perder K3s 1 → LB roteia para 2 ou 3.

**Opções:**

- Cloud provider LB (AWS NLB, GCP LB) — automático
- Nginx + keepalived (on-prem, manual failover)

---

## Distributed etcd cluster

**K3s embedded etcd:**

- 3 servidores K3s = 3 etcd instances
- Bom, mas acoplado

**Etcd cluster externo:**

- Etcd em VMs dedicadas (ou 3 pods K3s só pra isso)
- K3s como datastore-endpoint
- Desacoplado do control plane

Trade-off:

- Mais complexo (etcd troubleshooting separado)
- Mais resiliente (falha etcd ≠ falha K3s)

---

## Node health checks e auto-repair

**Kubelet pode remover node faltando:**

```yaml
apiVersion: kubelet.config.k8s.io/v1beta1
evictionHard:
  memory.available: "5%"
  disk.available: "10%"
nodeStatusUpdateFrequency: 10s
nodeStatusReportFrequency: 5m
```yaml

**Node Problem Detector + auto-removal:**

- Monitora node (disk, memory, PID exhaustion)
- Marca unhealthy
- Workloads migram automaticamente

---

## Backup + Disaster Recovery

**Velero para snapshots:**

```bash
velero backup create my-backup
# Se disaster: velero restore create --from-backup my-backup
```yaml

**Etcd snapshot + restore:**

```bash
etcdctl snapshot save backup.db
etcdctl snapshot restore backup.db --data-dir=/var/lib/etcd-restored
```yaml

Recomendação: ambos (app-level + datastore-level).

---

## SLA e RTO/RPO

| Métrica   | Objetivo   | Significado                      |
| --------- | ---------- | -------------------------------- |
| **Uptime** | 99.9%      | 8.7 horas downtime/ano           |
| **RTO**    | < 15 min   | Tempo para voltar online         |
| **RPO**    | < 1 min    | Dados perdem menos de 1 min      |

Para 99.9%:

- Multi-zone (3 AZs)
- Etcd externo com replicação
- Velero com snapshots frequentes (a cada 1h)

---

## Checklist HA avançado

- [ ] 3+ K3s servidores em AZs diferentes
- [ ] Etcd externo ou replicado
- [ ] API server atrás de cloud LB
- [ ] Velero instalado + teste de restore
- [ ] Node Problem Detector rodando
- [ ] Monitoring de etcd disk/memory
- [ ] Runbook de disaster recovery testado

---

## Próximas seções

- [Instalar etcd externo](../../../guides/tasks/kubernetes/install-external-etcd/) — step-by-step.
- [Velero setup](../../../guides/tasks/kubernetes/install-velero/) — backup automático.
- [Control plane LB](../../../guides/tasks/kubernetes/install-api-loadbalancer/) — multi-zona.

---

## Referências

- [K3s HA docs](https://docs.k3s.io/datastore): datastore externo + HA.
- [Etcd clustering](https://etcd.io/docs/v3.5/op-guide/clustering/): etcd setup.
- [Velero docs](https://velero.io/docs/): backup + restore.
