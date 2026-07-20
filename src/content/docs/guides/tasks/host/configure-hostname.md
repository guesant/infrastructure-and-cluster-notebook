---
title: Configurar o hostname
description: Como definir um hostname único e resolvível antes de instalar o K3s, já que o hostname vira o node-name padrão de cada nó do cluster.
sidebar:
  order: 2
---

> **Pré-requisitos:** acesso root ao host, hostname já decidido (único no cluster).
> **Versões testadas:** Debian 12 (bookworm), systemd 252.

O K3s usa o hostname como valor padrão de `node-name` quando esse campo não é definido explicitamente no `config.yaml`. Dois nós com o mesmo hostname causam colisão de identidade no cluster, mesmo que o restante da configuração esteja correto. Defina um hostname único e resolvível antes de instalar o K3s, mesmo quando `node-name` for informado manualmente: ferramentas de diagnóstico, logs e o prompt do shell continuam usando o hostname do sistema.

## Definir o hostname

> **Executar em:** nó alvo, como `root`.

```bash
read -r -p "Novo hostname (ex.: k3s-manager-01): " NEW_HOSTNAME

hostnamectl set-hostname "${NEW_HOSTNAME}"
```

`hostnamectl` grava o valor em `/etc/hostname` e atualiza o hostname do kernel imediatamente, sem exigir reinicialização.

## Atualizar `/etc/hosts`

Mantenha uma entrada correspondente em `/etc/hosts` para que o próprio host resolva seu hostname sem depender do DNS:

> **Executar em:** nó alvo, como `root`.

```bash
read -r -p "IP deste nó: " NODE_IP
read -r -p "Hostname definido acima: " NODE_HOSTNAME

printf '%s %s\n' "${NODE_IP}" "${NODE_HOSTNAME}" >>/etc/hosts
```

Revise `/etc/hosts` manualmente se o arquivo já tiver uma entrada `127.0.1.1` apontando para um hostname antigo: deixar as duas entradas causa resolução inconsistente entre processos que leem o arquivo em ordens diferentes.

## Validação

> **Executar em:** nó alvo.

```bash
hostnamectl status
getent hosts "$(hostname)"
```

`hostnamectl status` deve mostrar o novo `Static hostname`. `getent hosts` deve resolver o hostname para o IP configurado.

## Troubleshooting

Se o hostname aparecer correto em `hostnamectl` mas o prompt do shell ainda mostrar o valor antigo, abra uma nova sessão: o shell interativo lê o hostname apenas na inicialização.

## Rollback

Repita o procedimento com o hostname anterior e remova a entrada adicionada em `/etc/hosts`. Um hostname já usado por um nó existente no cluster não deve ser reaplicado a outro nó sem antes removê-lo do cluster (veja [Remover um nó do K3s](../kubernetes/remove-k3s-node/)).

## Próximo passo

[Configurar DNS](../configure-dns/).

## Fontes e leitura adicional

- [systemd: `hostnamectl(1)`](https://www.freedesktop.org/software/systemd/man/latest/hostnamectl.html): referência oficial dos subcomandos e do escopo de cada tipo de hostname.
- [K3s: Server Configuration Reference](https://docs.k3s.io/cli/server): documenta `node-name` e a origem do valor padrão a partir do hostname do sistema.
