---
title: Desinstalar o K3s
description: Como usar o script de desinstalação gerado pelo próprio instalador do K3s para remover serviços, interfaces de rede e regras de firewall criadas pelo cluster.
sidebar:
  order: 10
---

> **Pré-requisitos:** acesso root ao host, nó já removido do cluster (veja [remover um nó](../remove-k3s-node/)) quando aplicável.
> **Versões testadas:** K3s v1.36.1+k3s1.

O instalador do K3s grava um script de desinstalação no próprio host. Use-o em vez de remover pacotes ou diretórios manualmente: ele para os serviços na ordem correta, remove interfaces de rede criadas pelo CNI e limpa regras de iptables/nftables adicionadas pelo K3s.

:::danger
A desinstalação apaga o datastore local (incluindo etcd embarcado, se este for um manager) e todos os dados de `/var/lib/rancher/k3s`. Em um manager que ainda participa de um cluster com outros managers, isso remove o membro do quorum sem um processo de remoção controlada: confirme que o nó já foi removido corretamente (veja [remover um nó](../remove-k3s-node/)) antes de desinstalar.
:::

## Identificar e executar o script correto

> **Executar em:** nó alvo, como `root`.

```bash
ls /usr/local/bin/k3s-uninstall.sh /usr/local/bin/k3s-agent-uninstall.sh 2>/dev/null
```

Managers (server) usam `k3s-uninstall.sh`; agents usam `k3s-agent-uninstall.sh`. Execute apenas o que existir no host:

```bash
/usr/local/bin/k3s-uninstall.sh 2>/dev/null || /usr/local/bin/k3s-agent-uninstall.sh
```

## Validação

> **Executar em:** nó alvo.

```bash
systemctl status k3s 2>&1 | head -n1
ls /etc/rancher/k3s 2>&1
ip link show | grep -E 'cni|flannel' || true
```

O serviço não deve mais existir (`Unit k3s.service could not be found`), `/etc/rancher/k3s` não deve existir e não deve sobrar nenhuma interface de rede criada pelo CNI.

## Troubleshooting

Se alguma interface de rede (`cni0`, `flannel.1`) permanecer depois da desinstalação, remova-a manualmente (`ip link delete <interface>`): normalmente indica que o script rodou com o serviço já parado por outro meio, fora da ordem esperada.

## Rollback

Não há rollback. Reinstalar o K3s no mesmo host, se necessário, é uma instalação nova: siga [instalar o primeiro servidor](../install-first-k3s-server/), [adicionar um servidor](../join-k3s-server/) ou [adicionar um agente](../join-k3s-agent/), conforme o papel pretendido.

## Fontes e leitura adicional

- [K3s: Uninstall](https://docs.k3s.io/installation/uninstall): referência oficial dos scripts de desinstalação e do que cada um remove.
