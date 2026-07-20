---
title: Criar filesystem e montar um disco
description: Como formatar uma partição preparada, montá-la e persistir a montagem em /etc/fstab antes de registrá-la como disco do Longhorn.
sidebar:
  order: 3
---

> **Pré-requisitos:** disco ou partição preparado (veja [preparar um disco para o Longhorn](../prepare-host-disk/)).
> **Versões testadas:** Debian 12 (bookworm), ext4.

Com a partição criada, formate-a e monte-a em um diretório persistente que o Longhorn usará como disco adicional.

## Criar o filesystem

> **Executar em:** o nó, como `root`.

```bash
read -r -p "Partição a formatar (ex.: /dev/sdb1): " TARGET_PARTITION
mkfs.ext4 "${TARGET_PARTITION}"
```

ext4 é adequado para a maioria dos casos; XFS é uma alternativa válida se o ambiente já padroniza nele.

## Criar o ponto de montagem e montar

```bash
read -r -p "Ponto de montagem (ex.: /mnt/longhorn-disk1): " MOUNT_POINT
mkdir -p "${MOUNT_POINT}"
mount "${TARGET_PARTITION}" "${MOUNT_POINT}"
```

## Persistir o mount em `/etc/fstab`

Sem uma entrada em `/etc/fstab`, o disco não será remontado automaticamente após um reboot: o Longhorn passaria a reportar o disco como ausente até a remontagem manual.

```bash
DISK_UUID="$(blkid --match-tag UUID --output value "${TARGET_PARTITION}")"
printf 'UUID=%s %s ext4 defaults 0 2\n' "${DISK_UUID}" "${MOUNT_POINT}" >>/etc/fstab
```

## Validação

```bash
mount --target "${MOUNT_POINT}"
df --human "${MOUNT_POINT}"
umount "${MOUNT_POINT}" && mount --all && mount --target "${MOUNT_POINT}"
```

O último comando testa que a entrada em `/etc/fstab` está correta, remontando a partir dela em vez do comando `mount` direto anterior.

## Troubleshooting

Se `mount --all` falhar após editar `/etc/fstab`, revise a sintaxe da linha adicionada antes de reiniciar o host: um `/etc/fstab` inválido pode impedir o boot normal em alguns sistemas.

## Rollback

```bash
umount "${MOUNT_POINT}"
sed -i "\|${MOUNT_POINT}|d" /etc/fstab
```

## Próximo passo

[Configurar um nó do Longhorn](../configure-longhorn-node/) para adicionar este disco ao Longhorn.

## Fontes e leitura adicional

- [man7.org: `fstab(5)`](https://man7.org/linux/man-pages/man5/fstab.5.html): referência da sintaxe do arquivo de montagens persistentes.
