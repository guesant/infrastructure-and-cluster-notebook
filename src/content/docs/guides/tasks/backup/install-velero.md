---
title: Instalar Velero
sidebar:
  order: 5
---

> **Para quem é:** operadores de K3s que querem backup de workloads e volumes, além de etcd.
> **Pré-requisito:** K3s já em operação, acesso administrativo ao cluster, storage (MinIO ou cloud provider).

Velero é instalado como um Helm chart ou via CLI. Este guia cobre setup com **MinIO** (storage local compatível S3).

## Passo 1: Instalar MinIO (backend de storage)

Se usando storage local (não cloud provider):

```bash
helm repo add minio https://charts.min.io
helm repo update

helm install minio minio/minio \
  --namespace minio \
  --create-namespace \
  --set auth.rootPassword=velero-admin \
  --set auth.rootUser=velero-admin \
  --set persistence.size=50Gi
```yaml

Obter endpoint:

```bash
kubectl get svc -n minio minio
# Use: http://minio.minio.svc.cluster.local:9000
```yaml

## Passo 2: Criar bucket e credenciais no MinIO

```bash
kubectl port-forward -n minio svc/minio 9000:9000 &

# Acessar console do MinIO: http://localhost:9000
# User: velero-admin
# Password: velero-admin

# Criar bucket "velero" via console, ou via CLI:
mc alias set minio http://localhost:9000 velero-admin velero-admin
mc mb minio/velero
```yaml

## Passo 3: Criar secret com credenciais

```bash
cat > /tmp/velero-credentials << EOF
[default]
aws_access_key_id = velero-admin
aws_secret_access_key = velero-admin
EOF

kubectl create namespace velero

kubectl create secret generic velero-credentials \
  --from-file=/tmp/velero-credentials \
  -n velero
```yaml

## Passo 4: Instalar Velero via Helm

```bash
helm repo add velero https://charts.velero.io
helm repo update

helm install velero velero/velero \
  --namespace velero \
  --create-namespace \
  --set configuration.backupStorageLocation.bucket=velero \
  --set configuration.backupStorageLocation.provider=aws \
  --set configuration.backupStorageLocation.config.s3Url=http://minio.minio.svc.cluster.local:9000 \
  --set configuration.backupStorageLocation.config.insecureSkipTLSVerify=true \
  --set configuration.schedules.daily.schedule='0 2 * * *' \
  --set configuration.schedules.daily.template.ttl=720h \
  --set schedules.daily.includedNamespaces='*'
```yaml

## Passo 5: Verificar instalação

```bash
velero plugin get  # Verificar plugins instalados
velero backup-location get  # Verificar storage location
velero schedule get  # Verificar agendamentos

# Fazer backup manual
velero backup create test-backup --wait

# Verificar status
velero backup describe test-backup
velero backup logs test-backup
```yaml

## Passo 6: Testar restauração

```bash
# Simular perda de um namespace
kubectl delete namespace default

# Restaurar do backup
velero restore create --from-backup test-backup --wait

# Verificar
kubectl get ns
kubectl get pods
```yaml

## Configuração com AWS S3

Se usando AWS:

```bash
cat > /tmp/velero-credentials << EOF
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
EOF

helm install velero velero/velero \
  --namespace velero \
  --create-namespace \
  --set configuration.backupStorageLocation.bucket=my-velero-bucket \
  --set configuration.backupStorageLocation.provider=aws \
  --set configuration.volumeSnapshotLocation.provider=aws \
  --set configuration.volumeSnapshotLocation.config.region=us-east-1
```yaml

## Agendamento de backups

```bash
velero schedule create nightly \
  --schedule="0 2 * * *" \
  --include-namespaces='*' \
  --ttl 720h
```yaml

- `--schedule`: cron format.
- `--ttl`: retenção (720h = 30 dias).

## Restauração seletiva

```bash
# Restaurar só um namespace
velero restore create --from-backup test-backup \
  --include-namespaces myapp \
  --wait

# Restaurar só um resource type
velero restore create --from-backup test-backup \
  --include-resources deployments,services \
  --wait
```yaml

## Troubleshooting

```bash
# Ver logs do controller Velero
kubectl logs -n velero deployment/velero -f

# Ver eventos de backup
kubectl get events -n velero

# Verificar status de um backup
velero backup describe test-backup --details
```yaml

## Referências

- [Velero Quick Start](https://velero.io/docs/main/basic-install/): instalação oficial.
- [Velero with MinIO](https://velero.io/docs/main/plugins/): usando MinIO como backend.
- [Helm chart Velero](https://github.com/vmware-tanzu/helm-charts/tree/main/charts/velero): valores disponíveis.
