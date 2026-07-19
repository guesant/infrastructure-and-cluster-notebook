---
title: Backup de volumes Longhorn (rotina)
sidebar:
  order: 3
---

> **Pré-requisitos:** [backup de volume configurado](../../guides/tasks/storage/configure-volume-backup/).
> **Frequência sugerida:** revisão semanal; execução conforme o `RecurringJob` configurado.

Esta página cobre a rotina de verificação periódica dos backups de volumes Longhorn — a configuração inicial está em [configurar backup de volumes do Longhorn](../../guides/tasks/storage/configure-volume-backup/); esta página não repete os comandos de configuração.

## Verificação de rotina

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace longhorn-system get backups.longhorn.io
kubectl --namespace longhorn-system get recurringjobs.longhorn.io
```yaml

Confirme que:

- o `RecurringJob` gerou execuções recentes conforme o cron configurado;
- todos os backups recentes têm `state: Completed`, sem falhas silenciosas;
- a idade do backup mais recente está dentro do RPO definido para os volumes protegidos.

## Verificar capacidade do backupstore

Um backupstore cheio falha silenciosamente para novos backups sem necessariamente derrubar o cluster:

```bash
kubectl --namespace longhorn-system get settings.longhorn.io backup-target
```yaml

Revise a capacidade do destino diretamente no provedor (S3, NFS) — o Longhorn não impõe um limite próprio além do que o destino permite.

## Checklist de rotina

- [ ] `RecurringJob` ativo e gerando execuções no cron esperado.
- [ ] Nenhum backup recente com `state` diferente de `Completed` sem investigação.
- [ ] Idade do backup mais recente dentro do RPO definido.
- [ ] Capacidade do backupstore revisada.
- [ ] Um teste de restauração (veja [restaurar um volume Longhorn](../../operations/disaster-recovery/restore-longhorn-volume/)) foi executado dentro do prazo trimestral definido em [prontidão de backup](../../operations/checklists/backup-readiness/).

## Troubleshooting

Se um backup falhar recorrentemente, revise `kubectl --namespace longhorn-system describe backups.longhorn.io <nome>` para a mensagem de erro — credencial expirada e destino sem espaço são as causas mais comuns.

## Próximo passo

[Validar backups](../validate-backups/) para a rotina consolidada entre etcd, Longhorn e PostgreSQL.

## Fontes e leitura adicional

- [Longhorn — Backup and Restore](https://longhorn.io/docs/1.12.0/snapshots-and-backups/backup-and-restore/): referência oficial de backup e restauração.
