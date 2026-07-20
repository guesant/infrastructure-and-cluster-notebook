---
title: Preparar um disco para o Longhorn
description: Como identificar, confirmar que está vazio e particionar um disco dedicado antes de adicioná-lo ao Longhorn, isolando o I/O de armazenamento do disco raiz do sistema.
sidebar:
  order: 2
---

> **Pré-requisitos:** acesso root ao nó, um disco ou partição dedicado (não o disco raiz do sistema).
> **Versões testadas:** Debian 12 (bookworm), Longhorn 1.12.0.

O Longhorn pode usar o disco raiz do sistema (via um diretório em `/var/lib/longhorn`), mas um disco dedicado isola o I/O de armazenamento do I/O do sistema operacional e evita que um volume cheio afete a estabilidade do host. Esta página cobre a preparação de um disco dedicado antes de adicioná-lo ao Longhorn.

:::danger
Os comandos abaixo apagam todo o conteúdo do disco selecionado. Confirme o identificador correto antes de prosseguir: um disco errado aqui é uma perda de dados irreversível.
:::

## Identificar o disco

> **Executar em:** o nó, como `root`.

```bash
lsblk --output NAME,SIZE,TYPE,MOUNTPOINT,FSTYPE
```

Identifique o disco pelo tamanho e ausência de `MOUNTPOINT`; nunca pelo nome do dispositivo isoladamente, que pode variar entre reinicializações em alguns ambientes.

## Confirmar que o disco está vazio

```bash
read -r -p "Dispositivo a preparar (ex.: /dev/sdb): " TARGET_DISK
blkid "${TARGET_DISK}" || printf 'Nenhum filesystem detectado (esperado para um disco novo).\n'
```

Se `blkid` retornar um filesystem existente com dados importantes, pare aqui: este procedimento assume um disco vazio ou que pode ser apagado.

## Particionar (opcional)

Para um disco dedicado inteiro ao Longhorn, uma única partição é suficiente:

```bash
parted --script "${TARGET_DISK}" mklabel gpt
parted --script "${TARGET_DISK}" mkpart primary 0% 100%
```

## Validação

```bash
lsblk --output NAME,SIZE,TYPE,MOUNTPOINT,FSTYPE "${TARGET_DISK}"
```

Confirme a partição criada antes de prosseguir para [criar o filesystem e montar](../create-filesystem-and-mount/).

## Troubleshooting

Se `parted` reportar que o disco está em uso, confirme que nenhum processo ou volume Longhorn existente já referencia esse dispositivo (`lsof "${TARGET_DISK}"`).

## Rollback

Não aplicável antes da criação do filesystem: o disco ainda não contém dados geridos pelo Longhorn nesta etapa.

## Próximo passo

[Criar o filesystem e montar](../create-filesystem-and-mount/).

## Fontes e leitura adicional

- [Longhorn: Multiple Disk Support](https://longhorn.io/docs/1.12.0/nodes-and-volumes/nodes/multidisk/): documenta a adição de discos dedicados a um nó do Longhorn.
