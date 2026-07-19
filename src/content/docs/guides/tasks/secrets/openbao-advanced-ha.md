---
title: OpenBao — Auto-unseal + Alta Disponibilidade
sidebar:
  order: 2
---

> **Para quem é:** operadores que precisam OpenBao production-ready com auto-unseal e múltiplas réplicas.

OpenBao standalone (tema anterior) é simples para dev. HA production requer auto-unseal + múltiplos servidores.

## Auto-unseal via AWS KMS

Sem auto-unseal:
- OpenBao inicia locked (sealed)
- Precisa de operador com unseal keys manualmente
- Risco: operador não disponível

**Com auto-unseal:**
- Inicia e desbloqueia automaticamente
- Usa chave KMS (AWS, Google, Azure, HashiCorp Cloud)

### Configurar KMS (AWS)

```bash
# Criar chave KMS
aws kms create-key --description "OpenBao unseal key"
aws kms create-alias --alias-name alias/openbao-unseal \
  --target-key-id <key-id>
```

### Helm values (com auto-unseal)

```yaml
ha:
  enabled: true
  replicas: 3

server:
  dataStorage:
    size: 10Gi
  
  ha:
    enabled: true
    replicas: 3
    
  auditStorage:
    enabled: true
    size: 10Gi

# Auto-unseal via AWS KMS
seal:
  type: awskms
  config:
    region: us-east-1
    kmsKeyId: arn:aws:kms:...
```

### Deploy

```bash
helm install openbao openbao/openbao \
  -f values.yaml \
  --namespace secrets \
  --create-namespace
```

## HA Replication (3+ replicas)

```yaml
ha:
  enabled: true
  replicas: 3
  replicas:
    - name: openbao-0
      affinity: |
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app.kubernetes.io/name
                  operator: In
                  values:
                  - openbao
              topologyKey: kubernetes.io/hostname
```

Cada réplica em nó diferente (anti-affinity).

## Storage backend (integrado)

Opções:
- **Integrated storage** (padrão, Raft): nenhuma config adicional
- **PostgreSQL:** para máxima flexibilidade
- **S3:** para cloud-native

```yaml
# PostgreSQL backend
storage:
  type: postgresql
  config:
    connection_url: "postgresql://user:pass@postgres.default.svc:5432/openbao"
    ha_enabled: true
```

## Metrics + Alertas

OpenBao expõe Prometheus metrics em `:8200/v1/sys/metrics`:

```yaml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: openbao
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: openbao
  endpoints:
  - port: metrics
    interval: 30s
```

Alert crítico:
```yaml
- alert: OpenBaoSealed
  expr: openbao_core_unsealed == 0
  for: 1m
  annotations:
    summary: "OpenBao is sealed"
```

## Backup + Restore

### Raft snapshot (integrated storage)

```bash
# Snapshot
kubectl exec -n secrets openbao-0 -- \
  openbao operator raft snapshot save /tmp/raft.snap

# Restore
kubectl exec -n secrets openbao-0 -- \
  openbao operator raft snapshot restore /tmp/raft.snap
```

### PostgreSQL backup

```bash
# Standard PostgreSQL backup
pg_dump -h postgres.default.svc openbao > openbao-backup.sql
```

## Initialization (primeiro start)

```bash
# Gera unseal keys (1x, guarda seguro)
kubectl exec -n secrets openbao-0 -- \
  openbao operator init \
    -key-shares=5 \
    -key-threshold=3
```

Com auto-unseal, não precisa de unseal keys manualmente após init.

## Disaster recovery

Se perder quórum (2 de 3 réplicas down):

1. **Scale down** perdidas:
   ```bash
   kubectl delete pod openbao-1 -n secrets
   ```

2. **Scale up** nova réplica:
   ```bash
   kubectl scale statefulset openbao --replicas=3 -n secrets
   ```

3. **Raft autopeer** reconstrói quórum

## Production checklist

- [ ] 3+ replicas (quórum tolerante a 1 falha)
- [ ] Auto-unseal habilitado (KMS externo)
- [ ] Storage backend externo (PostgreSQL ou S3)
- [ ] Backups automatizados (1x/dia mínimo)
- [ ] ServiceMonitor + alertas (sealed, disk full, quórum loss)
- [ ] Network policy (acesso controlado)
- [ ] RBAC (limitado por namespace/role)
- [ ] TLS/mTLS entre replicas

## Próximas seções

- [Operação OpenBao](../../../operations/) — runbooks.

---

## Referências

- [OpenBao HA documentation](https://openbao.org/): guia oficial.
- [OpenBao auto-unseal](https://openbao.org/docs/concepts/seal/): spec de auto-unseal.
- [Kubernetes deployment](https://openbao.org/docs/platform/k8s/): instalação K8s.
