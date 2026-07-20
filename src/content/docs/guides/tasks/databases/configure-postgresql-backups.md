---
title: Configurar backups do PostgreSQL
description: Como configurar o destino de backup, arquivamento contínuo de WAL e backups completos agendados no CloudNativePG, com validação da política de retenção.
sidebar:
  order: 5
---

> **Pré-requisitos:** [cluster PostgreSQL criado](../create-postgresql-cluster/), destino de object storage compatível com S3 (ou equivalente suportado).
> **Versões testadas:** CloudNativePG 1.30.

O CloudNativePG integra backup físico contínuo com arquivamento de WAL, permitindo recuperação point-in-time (PITR). Esta página configura o destino e a política de backup; o procedimento de restauração está em [restaurar um cluster PostgreSQL](../restore-postgresql-cluster/) e a visão consolidada de backup de dados de aplicação está em [backup do PostgreSQL](../../../../operations/backups/backup-postgresql/).

## Criar a credencial do object storage

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -p "Namespace do cluster: " PG_NAMESPACE
read -r -s -p "Access Key ID do object storage: " BACKUP_ACCESS_KEY_ID
printf '\n'
read -r -s -p "Secret Access Key do object storage: " BACKUP_SECRET_ACCESS_KEY
printf '\n'

kubectl --namespace "${PG_NAMESPACE}" create secret generic postgresql-backup-credentials \
  --from-literal=ACCESS_KEY_ID="${BACKUP_ACCESS_KEY_ID}" \
  --from-literal=ACCESS_SECRET_KEY="${BACKUP_SECRET_ACCESS_KEY}"
```

## Configurar o destino no Cluster

```bash
read -r -p "Nome do cluster: " PG_CLUSTER_NAME
read -r -p "URL do destino (ex.: s3://meu-bucket/postgresql-backups): " BACKUP_DESTINATION

kubectl --namespace "${PG_NAMESPACE}" patch cluster "${PG_CLUSTER_NAME}" --type=merge --patch "
spec:
  backup:
    barmanObjectStore:
      destinationPath: ${BACKUP_DESTINATION}
      s3Credentials:
        accessKeyId:
          name: postgresql-backup-credentials
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: postgresql-backup-credentials
          key: ACCESS_SECRET_KEY
      wal:
        compression: gzip
    retentionPolicy: 30d
"
```

## Agendar backups completos recorrentes

O arquivamento de WAL é contínuo assim que o destino é configurado; agende também backups base completos:

```bash
kubectl apply -f - <<EOF
apiVersion: postgresql.cnpg.io/v1
kind: ScheduledBackup
metadata:
  name: ${PG_CLUSTER_NAME}-daily
  namespace: ${PG_NAMESPACE}
spec:
  schedule: "0 2 * * *"
  backupOwnerReference: self
  cluster:
    name: ${PG_CLUSTER_NAME}
EOF
```

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace "${PG_NAMESPACE}" get scheduledbackups
kubectl --namespace "${PG_NAMESPACE}" get backups
kubectl --namespace "${PG_NAMESPACE}" describe cluster "${PG_CLUSTER_NAME}" | grep -A5 "Continuous Backup status"
```

Confirme que o WAL está sendo arquivado continuamente (`Continuous Backup status`) e que ao menos um `Backup` completou com sucesso.

## Troubleshooting

Se o backup falhar com erro de credencial, confirme que o Secret `postgresql-backup-credentials` está no mesmo namespace do cluster e que as chaves têm permissão de escrita no bucket/caminho configurado.

## Rollback

```bash
kubectl --namespace "${PG_NAMESPACE}" delete scheduledbackup "${PG_CLUSTER_NAME}-daily"
```

Remover o `ScheduledBackup` não apaga backups já existentes no destino nem interrompe o arquivamento contínuo de WAL, configurado separadamente em `spec.backup`.

## Próximo passo

Teste a restauração: um backup nunca testado não é confiável. Veja [restaurar um cluster PostgreSQL](../restore-postgresql-cluster/).

## Fontes e leitura adicional

- [CloudNativePG: Backup on object stores](https://cloudnative-pg.io/documentation/current/backup_barmanobjectstore/): referência oficial de configuração de backup via Barman Cloud.
- [CloudNativePG: Backup and Recovery](https://cloudnative-pg.io/documentation/current/backup_recovery/): visão geral de estratégias de backup e recuperação suportadas.
