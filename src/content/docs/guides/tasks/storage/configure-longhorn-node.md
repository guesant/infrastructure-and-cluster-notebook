---
title: Configurar um nó do Longhorn
description: Como registrar um disco dedicado adicional em um nó do Longhorn e aplicar tags para direcionar volumes específicos a discos específicos.
sidebar:
  order: 4
---

> **Pré-requisitos:** [Longhorn instalado](../install-longhorn/), disco preparado e montado (veja [criar filesystem e montar](../create-filesystem-and-mount/)).
> **Versões testadas:** Longhorn 1.12.0.

Depois da instalação, o Longhorn detecta automaticamente o disco padrão do sistema (`/var/lib/longhorn`) em cada nó, mas um disco dedicado adicional precisa ser registrado explicitamente.

## Adicionar o disco ao nó

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -p "Nome do nó Kubernetes: " NODE_NAME
read -r -p "Caminho do disco montado (ex.: /mnt/longhorn-disk1): " DISK_PATH

kubectl --namespace longhorn-system patch nodes.longhorn.io "${NODE_NAME}" --type=merge \
  --patch "{\"spec\":{\"disks\":{\"disk1\":{\"path\":\"${DISK_PATH}\",\"allowScheduling\":true}}}}"
```

Repita com um nome de disco diferente (`disk2`, `disk3`) para cada disco adicional no mesmo nó.

## Definir tags de disco (opcional)

Tags permitem direcionar volumes específicos para discos específicos (ex.: SSD para bancos de dados, HDD para dados menos sensíveis a latência):

```bash
read -r -p "Tag a aplicar (ex.: ssd): " DISK_TAG

kubectl --namespace longhorn-system patch nodes.longhorn.io "${NODE_NAME}" --type=merge \
  --patch "{\"spec\":{\"disks\":{\"disk1\":{\"tags\":[\"${DISK_TAG}\"]}}}}"
```

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace longhorn-system get nodes.longhorn.io "${NODE_NAME}" -o yaml
```

Confirme em `status.diskStatus` que o disco aparece com `schedulable: true` e a capacidade esperada.

## Troubleshooting

Se o disco não aparecer como agendável, confirme que o caminho montado tem permissões de escrita para o usuário usado pelo Longhorn e espaço livre suficiente: o Longhorn reserva uma porcentagem mínima configurável por disco.

## Rollback

```bash
kubectl --namespace longhorn-system patch nodes.longhorn.io "${NODE_NAME}" --type=merge \
  --patch "{\"spec\":{\"disks\":{\"disk1\":{\"allowScheduling\":false}}}}"
```

Desabilitar o agendamento não remove réplicas já existentes no disco; planeje a migração delas antes de remover o disco fisicamente.

## Próximo passo

[Criar uma StorageClass](../create-storage-class/) para usar as tags de disco configuradas, se aplicável.

## Fontes e leitura adicional

- [Longhorn: Multiple Disk Support](https://longhorn.io/docs/1.12.0/nodes-and-volumes/nodes/multidisk/): referência oficial de configuração de discos por nó.
- [Longhorn: Storage Tags](https://longhorn.io/docs/1.12.0/nodes-and-volumes/nodes/storage-tags/): documenta o direcionamento de volumes por tags de disco e de nó.
