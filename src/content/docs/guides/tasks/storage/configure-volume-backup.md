---
title: Configurar backup de volumes do Longhorn
sidebar:
  order: 6
---

> **Pré-requisitos:** [Longhorn instalado](../install-longhorn/), destino de backup (object storage compatível com S3 ou servidor NFS) disponível.
> **Versões testadas:** Longhorn 1.12.0.

Um backup do Longhorn copia os blocos de um volume para um backupstore externo — distinto das réplicas síncronas, que permanecem no mesmo cluster. Veja [replicação não é backup](../../../../learn/storage/replication-is-not-backup/) antes de tratar réplicas como proteção suficiente.

## Configurar o backup target

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API, ou pela interface web do Longhorn.

Para um destino S3, crie primeiro um Secret com as credenciais:

```bash
read -r -s -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
printf '\n'
read -r -s -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
printf '\n'

kubectl --namespace longhorn-system create secret generic longhorn-backup-secret \
  --from-literal=AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
  --from-literal=AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
```yaml

Depois, configure o target via `Setting`:

```bash
read -r -p "URL do backup target (ex.: s3://meu-bucket@us-east-1/): " BACKUP_TARGET_URL

kubectl --namespace longhorn-system patch settings.longhorn.io backup-target --type=merge \
  --patch "{\"value\": \"${BACKUP_TARGET_URL}\"}"

kubectl --namespace longhorn-system patch settings.longhorn.io backup-target-credential-secret --type=merge \
  --patch '{"value": "longhorn-backup-secret"}'
```yaml

## Criar um backup manual

```bash
read -r -p "Nome do volume: " VOLUME_NAME

kubectl --namespace longhorn-system patch volumes.longhorn.io "${VOLUME_NAME}" --type=merge \
  --patch '{"spec": {"snapshotDataIntegrity": "fast-check"}}'

kubectl --namespace longhorn-system create -f - <<EOF
apiVersion: longhorn.io/v1beta2
kind: Backup
metadata:
  name: ${VOLUME_NAME}-manual-$(date +%Y%m%d)
  namespace: longhorn-system
spec:
  snapshotName: ""
  volumeName: ${VOLUME_NAME}
EOF
```yaml

## Agendar backups recorrentes

Prefira um `RecurringJob` a backups manuais para a rotina normal:

```bash
kubectl apply -f - <<EOF
apiVersion: longhorn.io/v1beta2
kind: RecurringJob
metadata:
  name: daily-backup
  namespace: longhorn-system
spec:
  cron: "0 2 * * *"
  task: "backup"
  groups:
    - default
  retain: 7
  concurrency: 2
EOF
```yaml

Associe volumes ao grupo `default` (ou outro grupo customizado) via label `recurring-job-group.longhorn.io/default: enabled` no volume.

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace longhorn-system get backups.longhorn.io
kubectl --namespace longhorn-system get recurringjobs.longhorn.io
```yaml

Confirme que os backups aparecem com `state: Completed` e que o `RecurringJob` está gerando execuções conforme o cron configurado.

## Troubleshooting

Se um backup falhar com erro de credencial, confirme que o Secret referenciado em `backup-target-credential-secret` existe no namespace `longhorn-system` e contém as chaves esperadas pelo tipo de destino (`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` para S3).

## Rollback

```bash
kubectl --namespace longhorn-system delete recurringjob daily-backup
```yaml

## Próximo passo

Teste a restauração — um backup nunca testado não é um backup confiável. Veja [restaurar backup de volume](../restore-volume-backup/).

## Fontes e leitura adicional

- [Longhorn — Backup and Restore](https://longhorn.io/docs/1.12.0/snapshots-and-backups/backup-and-restore/): referência oficial de backup target, criação e agendamento.
- [Longhorn — Set up Recurring Jobs](https://longhorn.io/docs/1.12.0/snapshots-and-backups/scheduling-backups-and-snapshots/): documenta `RecurringJob`, grupos e retenção.
