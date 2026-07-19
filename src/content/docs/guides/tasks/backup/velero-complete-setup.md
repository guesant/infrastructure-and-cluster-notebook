---
title: Velero — Backup e Restore completo
sidebar:
  order: 1
---

> **Para quem é:** operadores que precisam backup/restore de aplicações e dados em Kubernetes.

Velero é a ferramenta padrão para backup de clusters Kubernetes — snapshots de aplicações, volumes, configuração.

## Instalação base

```bash
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm install velero vmware-tanzu/velero \
  --namespace velero --create-namespace \
  --set configuration.backupStorageLocation.bucket=my-backup-bucket \
  --set configuration.backupStorageLocation.provider=aws \
  --set configuration.volumeSnapshotLocation.provider=aws \
  --set credentials.useSecret=true
```

## Configuração S3 (AWS)

```yaml
apiVersion: velero.io/v1
kind: BackupStorageLocation
metadata:
  name: default
  namespace: velero
spec:
  provider: aws
  objectStorage:
    bucket: my-cluster-backups
    prefix: velero
  config:
    region: us-east-1
```

## Volume snapshots (EBS)

```yaml
apiVersion: velero.io/v1
kind: VolumeSnapshotLocation
metadata:
  name: aws-ebs
  namespace: velero
spec:
  provider: aws
  config:
    region: us-east-1
```

## Criar primeiro backup

```bash
velero backup create my-first-backup \
  --wait
# Verificar
velero backup describe my-first-backup
velero backup logs my-first-backup
```

## Backup automático (schedule)

```bash
velero schedule create daily-backup \
  --schedule="0 2 * * *" \
  --include-namespaces '*' \
  --default-volumes-to-restic \
  --wait
```

Roda backup diariamente às 02:00 UTC.

## Restore de disaster

```bash
# Listar backups disponíveis
velero backup get

# Restaurar
velero restore create --from-backup my-first-backup
velero restore describe my-first-backup

# Verificar progresso
kubectl get pods -n velero
```

## Exclude/Include namespaces

```bash
# Backup só production
velero backup create prod-only \
  --include-namespaces production

# Backup tudo exceto kube-system
velero backup create all-except-system \
  --exclude-namespaces kube-system,kube-node-lease
```

## Restic (volume backup via tarball)

Para volumes que não suportam snapshots (hostPath, NFS):

```bash
velero backup create with-restic \
  --default-volumes-to-restic
```

Velero usa restic para fazer backup dos volumes como tarball (mais lento, mas funciona em qualquer storage).

## Disaster recovery checklist

- [ ] Backups rodando diariamente (velero schedule)
- [ ] Teste restore 1x/semana (ou mensal mínimo)
- [ ] Retenção configurada (ex: 30 dias)
- [ ] Alertas se backup falhar (Prometheus metric `velero_backup_failure`)
- [ ] S3 bucket encrypted + versioning ligado
- [ ] Credentials em Secret seguro (RBAC limitado)

## Exemplo: Restore de 1 namespace só

```bash
velero restore create restore-api-only \
  --from-backup my-first-backup \
  --include-namespaces api
```

## Próximas seções

- [Monitorar Velero](../../../operations/backup-and-recovery/) — métricas e alertas.

---

## Referências

- [Velero documentation](https://velero.io/docs/): guia oficial.
- [Velero troubleshooting](https://velero.io/docs/latest/troubleshooting/): debug.
