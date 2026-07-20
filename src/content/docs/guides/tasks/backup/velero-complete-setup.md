---
title: "Velero: cenários de backup e restore"
description: Padrões de uso do Velero além da instalação básica, como localização adicional de backup via CRD, filtros de namespace, disaster recovery e o checklist de prontidão contínua.
sidebar:
  order: 6
---

> **Para quem é:** operadores que já têm o Velero instalado e precisam aplicar padrões de backup e restore além do caminho básico.
> **Pré-requisito:** [instalar Velero](../install-velero/).

Esta página não repete a instalação, coberta em [instalar Velero](../install-velero/). Ela cobre
os padrões de uso que aparecem depois que o Velero já está rodando: como declarar um
`BackupStorageLocation` ou `VolumeSnapshotLocation` adicional via CRD (em vez de `--set` no
Helm), como filtrar backups e restaurações por namespace, e o checklist de prontidão contínua
para disaster recovery.

## Declarar um BackupStorageLocation adicional via CRD

O Helm chart cria o `BackupStorageLocation` padrão a partir dos valores de instalação, mas um
segundo local de backup (por exemplo, um bucket separado para um ambiente específico) é mais
direto de declarar diretamente como um recurso Kubernetes:

```yaml
apiVersion: velero.io/v1
kind: BackupStorageLocation
metadata:
  name: secondary
  namespace: velero
spec:
  provider: aws
  objectStorage:
    bucket: my-cluster-backups
    prefix: velero
  config:
    region: us-east-1
```

Um `VolumeSnapshotLocation` adicional segue o mesmo princípio, para um segundo backend de
snapshot de volumes:

```yaml
apiVersion: velero.io/v1
kind: VolumeSnapshotLocation
metadata:
  name: aws-ebs-secondary
  namespace: velero
spec:
  provider: aws
  config:
    region: us-east-1
```

Ao criar um backup, referencie o local desejado com `--storage-location secondary`; sem essa
flag, o Velero usa o local marcado como padrão.

## Filtrar backups por namespace

```bash
# Backup só de um namespace específico
velero backup create prod-only \
  --include-namespaces production

# Backup de tudo, exceto os namespaces do próprio sistema
velero backup create all-except-system \
  --exclude-namespaces kube-system,kube-node-lease
```

Os dois filtros são mutuamente exclusivos por backup: use `--include-namespaces` quando o
objetivo é isolar poucos namespaces, e `--exclude-namespaces` quando o objetivo é cobrir quase
tudo, excluindo apenas o que não faz sentido versionar (namespaces do próprio Kubernetes, por
exemplo).

## Restaurar apenas um namespace

```bash
velero restore create restore-api-only \
  --from-backup my-first-backup \
  --include-namespaces api
```

Esse padrão é útil para recuperar um namespace específico sem sobrescrever o restante do
cluster, por exemplo depois de uma alteração acidental isolada a uma aplicação.

## Checklist de prontidão para disaster recovery

- [ ] Backups agendados rodando diariamente (`velero schedule get` mostra o schedule esperado).
- [ ] Teste de restauração executado ao menos semanalmente, mensal no mínimo, não apenas planejado.
- [ ] Retenção configurada de forma explícita (por exemplo, 30 dias via `--ttl 720h`).
- [ ] Alerta configurado para falha de backup, usando a métrica Prometheus `velero_backup_failure_total`.
- [ ] Bucket S3 com criptografia e versionamento habilitados.
- [ ] Credenciais do Velero em um Secret com acesso restrito por RBAC, não compartilhado com outras cargas.

## Próximos passos

- [Backup e recuperação](../../../../operations/backups/backup-and-recovery/): runbook geral de proteção e recuperação do cluster, do qual o Velero é uma das ferramentas.

## Referências

- [Velero Documentation](https://velero.io/docs/): documentação oficial completa.
- [Velero: Troubleshooting](https://velero.io/docs/main/troubleshooting/): guia oficial de investigação de falhas.
