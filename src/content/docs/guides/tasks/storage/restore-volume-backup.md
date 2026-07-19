---
title: Restaurar backup de um volume Longhorn
sidebar:
  order: 7
---

> **Pré-requisitos:** [backup de volume configurado](../configure-volume-backup/) e um backup existente no backupstore.
> **Versões testadas:** Longhorn 1.12.0.

Restaurar um backup cria um novo volume a partir de um ponto salvo — não substitui o volume original no lugar. Isso permite validar a restauração sem afetar o volume em produção, mesmo em um drill.

## Listar backups disponíveis

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace longhorn-system get backups.longhorn.io
```yaml

## Restaurar como um novo volume

```bash
read -r -p "Nome do backup (campo metadata.name do Backup): " BACKUP_NAME
read -r -p "Nome do novo volume restaurado: " RESTORED_VOLUME_NAME

kubectl --namespace longhorn-system apply -f - <<EOF
apiVersion: longhorn.io/v1beta2
kind: Volume
metadata:
  name: ${RESTORED_VOLUME_NAME}
  namespace: longhorn-system
spec:
  fromBackup: "$(kubectl --namespace longhorn-system get backups.longhorn.io "${BACKUP_NAME}" -o jsonpath='{.status.url}')"
  numberOfReplicas: 3
  size: "$(kubectl --namespace longhorn-system get backups.longhorn.io "${BACKUP_NAME}" -o jsonpath='{.status.size}')"
EOF
```yaml

## Criar um PVC apontando para o volume restaurado

O Longhorn precisa de um PV/PVC estático referenciando o volume já restaurado:

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: ${RESTORED_VOLUME_NAME}-pv
spec:
  capacity:
    storage: "$(kubectl --namespace longhorn-system get volumes.longhorn.io "${RESTORED_VOLUME_NAME}" -o jsonpath='{.spec.size}')"
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: longhorn-static
  csi:
    driver: driver.longhorn.io
    volumeHandle: ${RESTORED_VOLUME_NAME}
    fsType: ext4
EOF
```yaml

## Validação

> **Executar em:** um Pod de teste que monta o novo PVC, em um namespace isolado.

```bash
kubectl --namespace longhorn-system get volumes.longhorn.io "${RESTORED_VOLUME_NAME}"
```yaml

Confirme `state: attached` ou `detached` conforme esperado, e monte o volume em um Pod de teste para validar a integridade dos dados (não apenas a existência do volume) — a mesma lógica do [roteiro de restore drill](../../../../operations/backups/backup-and-recovery/#roteiro-de-restore-drill).

## Troubleshooting

Se o volume restaurado ficar preso em `attaching`, confirme que nenhum outro Pod já reivindicou o mesmo `volumeHandle` — o Longhorn não permite dois PVs apontando para o mesmo volume simultaneamente.

## Rollback

```bash
kubectl delete pv "${RESTORED_VOLUME_NAME}-pv"
kubectl --namespace longhorn-system delete volumes.longhorn.io "${RESTORED_VOLUME_NAME}"
```yaml

## Próximo passo

Depois de validar a integridade, decida se o volume restaurado substitui o original (aponte a aplicação para o novo PVC) ou serve apenas como evidência do drill.

## Fontes e leitura adicional

- [Longhorn — Restore from a Backup](https://longhorn.io/docs/1.12.0/snapshots-and-backups/backup-and-restore/restore-from-a-backup/): referência oficial do processo de restauração.
