---
title: Backup do PostgreSQL (rotina)
sidebar:
  order: 4
---

> **Pré-requisitos:** [backups do PostgreSQL configurados](../../guides/tasks/databases/configure-postgresql-backups/).
> **Frequência sugerida:** revisão diária do arquivamento de WAL; semanal para os backups completos.

Esta página cobre a rotina de verificação periódica dos backups do CloudNativePG — a configuração inicial está em [configurar backups do PostgreSQL](../../guides/tasks/databases/configure-postgresql-backups/); esta página não repete os comandos de configuração.

## Verificação de rotina

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
read -r -p "Namespace do cluster: " PG_NAMESPACE
read -r -p "Nome do cluster: " PG_CLUSTER_NAME

kubectl --namespace "${PG_NAMESPACE}" get backups
kubectl --namespace "${PG_NAMESPACE}" get scheduledbackups
kubectl --namespace "${PG_NAMESPACE}" describe cluster "${PG_CLUSTER_NAME}" | grep -A5 "Continuous Backup status"
```yaml

Confirme que:

- o arquivamento contínuo de WAL está ativo e sem falhas recentes (`Continuous Backup status`);
- o `ScheduledBackup` gerou um `Backup` completo dentro da janela esperada;
- não há mensagens de erro relacionadas a credencial ou destino no describe do cluster.

## Verificar o ponto de recuperação disponível mais recente

```bash
kubectl --namespace "${PG_NAMESPACE}" get backups -o jsonpath='{.items[-1:].status.stoppedAt}'
```yaml

Compare com o RPO definido para este banco — se o intervalo entre o valor retornado e agora exceder o RPO, investigue antes de considerar a proteção adequada.

## Checklist de rotina

- [ ] Arquivamento contínuo de WAL ativo, sem falhas recentes.
- [ ] `ScheduledBackup` gerando execuções completas dentro do prazo.
- [ ] Ponto de recuperação mais recente dentro do RPO definido.
- [ ] Um teste de restauração (veja [restaurar um cluster PostgreSQL](../../guides/tasks/databases/restore-postgresql-cluster/)) foi executado dentro do prazo trimestral definido em [prontidão de backup](../../operations/checklists/backup-readiness/).

## Troubleshooting

Se o arquivamento de WAL parar, o disco de dados do banco pode encher com WAL não arquivado — trate como incidente imediato, não apenas item de rotina; veja [revisão de capacidade de disco](../../operations/maintenance/disk-capacity-review/).

## Próximo passo

[Validar backups](../validate-backups/) para a rotina consolidada.

## Fontes e leitura adicional

- [CloudNativePG — Backup and Recovery](https://cloudnative-pg.io/documentation/current/backup_recovery/): visão geral de estratégias de backup suportadas.
