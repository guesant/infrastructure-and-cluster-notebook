---
title: Automação de backups com Velero
sidebar:
  order: 3
---

> **Para quem é:** operadores com Velero já instalado que querem automatizar e monitorar backups.

Velero oferece agendamentos, políticas de retenção e hooks para validar backups.

## Agendamentos básicos

Criar um backup diário às 2h da manhã:

```bash
velero schedule create daily-backup \
  --schedule="0 2 * * *" \
  --include-namespaces='*' \
  --ttl 720h
```yaml

Variações:

```bash
# Backup de um namespace específico
velero schedule create app-backup \
  --schedule="0 3 * * *" \
  --include-namespaces myapp

# Backup a cada 6 horas
velero schedule create frequent \
  --schedule="0 */6 * * *" \
  --ttl 360h  # Retenção: 15 dias

# Backup semanal com mais retenção
velero schedule create weekly \
  --schedule="0 4 0 * * 0" \
  --ttl 2160h  # 90 dias
```yaml

## Filtros granulares

Incluir/excluir namespaces:

```bash
velero schedule create prod-only \
  --schedule="0 2 * * *" \
  --include-namespaces 'prod-*,default' \
  --exclude-namespaces 'test,dev'
```yaml

Incluir/excluir resources:

```bash
velero schedule create app-backup \
  --schedule="0 2 * * *" \
  --include-resources 'deployments,services,configmaps' \
  --exclude-resources 'secrets'
```yaml

## Políticas de retenção

```bash
# TTL automático (delete after N hours)
velero schedule create daily \
  --schedule="0 2 * * *" \
  --ttl 720h  # 30 dias

# Listar scheduled backups
velero schedule get

# Desabilitar schedule sem deletar backups
velero schedule delete daily --confirm

# Ver próxima execução
velero schedule describe daily
```yaml

## Hooks de validação

Executar comando antes/depois de backup (ex: congelar banco de dados):

```bash
cat > backup-hook.yaml << EOF
apiVersion: velero.io/v1
kind: BackupStorageLocation
metadata:
  name: default
spec:
  provider: aws
  objectStorage:
    bucket: my-bucket
  hooks:
    resources:
    - name: pre-backup-hook
      includedNamespaces:
      - mydb
      execOnPod:
        container: postgres
        command:
        - /bin/sh
        - -c
        - pg_dump -U postgres mydb | gzip > /tmp/backup.sql.gz
EOF

kubectl apply -f backup-hook.yaml
```yaml

## Monitoramento

Ver status dos backups:

```bash
# Backups recentes
velero backup get

# Detalhes de um backup
velero backup describe daily-backup-20260719 --details

# Ver logs
velero backup logs daily-backup-20260719

# Listar restores
velero restore get
```yaml

## Alertas

Configurar alertas (com Prometheus):

```yaml
groups:
- name: velero
  rules:
  - alert: VeleroBackupFailed
    expr: increase(velero_backup_failure_total[1h]) > 0
    annotations:
      summary: "Velero backup falhou"
  
  - alert: VeleroBackupSlow
    expr: velero_backup_duration_seconds > 3600
    annotations:
      summary: "Velero backup demorando >1h"
```yaml

## Teste de recuperação regular

Validar que backups são realmente restauráveis:

```bash
# Criar namespace de teste
kubectl create namespace velero-test

# Restaurar um backup ali
velero restore create \
  --from-backup daily-backup-20260719 \
  --namespace-mappings myapp:velero-test \
  --wait

# Validar que recursos foram restaurados
kubectl get all -n velero-test

# Limpar teste
kubectl delete namespace velero-test
```yaml

## Backup de PVCs com Velero Uploader

Se volumes não suportam snapshots nativos:

```bash
# Configurar uploader (alternativa a snapshot)
helm upgrade velero velero/velero \
  --set configuration.volumeSnapshotLocation.provider=none \
  --set nodeAgent.enabled=true
```yaml

Então volumes serão copiados via uploader (mais lento, mas mais portável).

## Disaster recovery checklist

```yaml
☐ Backups agendados e executo regularmente
  # velero schedule get

☐ Retenção está adequada (não muito curta)
  # velero backup describe <nome> | grep -i ttl

☐ Teste de recuperação feito no último mês
  # Documentar resultado

☐ Storage location é verificável
  # velero backup-location get

☐ Alertas configurados no monitoramento
  # Ver integration com Prometheus

☐ Procedures de restauração documentados
  # Exemplo: restaurar namespace X sem downtime de Y
```yaml

## Referências

- [Velero Schedules](https://velero.io/docs/main/disaster-recovery/): agendamentos.
- [Velero Backup Hooks](https://velero.io/docs/main/backup-hooks/): hooks customizados.
- [Velero Restore](https://velero.io/docs/main/restore-reference/): opções de restauração.
