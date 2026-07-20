---
title: Restaurar um cluster PostgreSQL
description: Como restaurar um cluster PostgreSQL do CloudNativePG a partir de um backup existente, criando um novo cluster sem afetar o original.
sidebar:
  order: 6
---

> **Pré-requisitos:** [backup do PostgreSQL configurado](../configure-postgresql-backups/) e um backup existente no destino.
> **Versões testadas:** CloudNativePG 1.30.

O CloudNativePG restaura criando um **novo** cluster a partir do backup; não substitui o cluster existente no lugar. Isso permite validar a restauração sem afetar o cluster em produção, o mesmo princípio usado na [restauração de volumes Longhorn](../../storage/restore-volume-backup/).

## Restaurar como um novo cluster

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -p "Namespace do novo cluster: " PG_NAMESPACE
read -r -p "Nome do novo cluster restaurado: " PG_RESTORED_NAME
read -r -p "URL do destino de backup original: " BACKUP_DESTINATION
read -r -p "Ponto de recuperação (timestamp ISO 8601, ou Enter para o mais recente): " RECOVERY_TARGET_TIME

RECOVERY_TARGET_YAML=""
if [[ -n "${RECOVERY_TARGET_TIME}" ]]; then
  RECOVERY_TARGET_YAML="    targetTime: \"${RECOVERY_TARGET_TIME}\""
fi

kubectl apply -f - <<EOF
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: ${PG_RESTORED_NAME}
  namespace: ${PG_NAMESPACE}
spec:
  instances: 1
  storage:
    size: 10Gi
  bootstrap:
    recovery:
      source: original-cluster
      recoveryTarget:
${RECOVERY_TARGET_YAML}
  externalClusters:
    - name: original-cluster
      barmanObjectStore:
        destinationPath: ${BACKUP_DESTINATION}
        s3Credentials:
          accessKeyId:
            name: postgresql-backup-credentials
            key: ACCESS_KEY_ID
          secretAccessKey:
            name: postgresql-backup-credentials
            key: ACCESS_SECRET_KEY
EOF
```

Sem `targetTime`, o CloudNativePG restaura até o ponto mais recente disponível no WAL arquivado.

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace "${PG_NAMESPACE}" get cluster "${PG_RESTORED_NAME}"
```

Depois que o cluster restaurado ficar saudável, valide a integridade dos dados na camada da aplicação: confira schema, contagens conhecidas ou checksums, não apenas a existência do Pod:

```bash
kubectl --namespace "${PG_NAMESPACE}" exec -it "${PG_RESTORED_NAME}-1" -- psql -U postgres -c '\dt'
```

## Troubleshooting

Se a restauração ficar presa em `Setting up primary` por muito tempo, confirme que a credencial do `externalClusters` tem permissão de leitura no destino original e que o `destinationPath` está correto: um caminho errado normalmente falha silenciosamente até o timeout.

## Rollback

```bash
kubectl --namespace "${PG_NAMESPACE}" delete cluster "${PG_RESTORED_NAME}"
```

## Próximo passo

Depois de validar a integridade, decida se o cluster restaurado substitui o original (redirecione a aplicação para os novos Services) ou serve apenas como evidência de um restore drill; veja o [roteiro de restore drill](../../../../operations/backups/backup-and-recovery/#roteiro-de-restore-drill).

## Fontes e leitura adicional

- [CloudNativePG: Recovery](https://cloudnative-pg.io/documentation/current/recovery/): referência oficial de recuperação point-in-time e `externalClusters`.
