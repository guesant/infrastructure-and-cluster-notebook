---
title: Validar requisitos do host
description: Como confirmar CPU, memória, disco, kernel, cgroups, módulos, swap e parâmetros de rede antes de instalar o K3s, evitando falhas difíceis de diagnosticar durante o bootstrap.
sidebar:
  order: 12
---

> **Pré-requisitos:** as etapas anteriores de [preparar um servidor Debian](../prepare-debian-server/) concluídas.
> **Versões testadas:** Debian 12 (bookworm), kernel 6.1.

Esta página confirma que o host atende aos requisitos mínimos do K3s antes da instalação. Rodar a instalação em um host que não atende aos requisitos costuma falhar de forma pouco óbvia (um control plane que não estabiliza, um kubelet que não registra o nó) em vez de um erro claro logo no início.

## CPU, memória e disco

> **Executar em:** nó alvo.

```bash
nproc
free --human
df --human /var/lib/rancher
```

Um manager de produção pede no mínimo 2 vCPUs e 2 GiB de memória; ambientes de teste toleram menos, mas abaixo de 1 vCPU/512 MiB o control plane fica instável sob qualquer carga. Reserve espaço em disco suficiente em `/var/lib/rancher` para imagens de container, dados do etcd e, se aplicável, volumes do Longhorn.

## Kernel, cgroups e módulos

> **Executar em:** nó alvo.

```bash
uname -r
cat /sys/fs/cgroup/cgroup.controllers
lsmod | grep -E '^(br_netfilter|overlay)'
```

O K3s exige cgroups v2 (padrão no Debian 12) e os módulos `br_netfilter` e `overlay` carregados para rede de Pods e o driver de armazenamento de containers, respectivamente. Se `lsmod` não listar algum dos dois:

```bash
modprobe br_netfilter overlay
printf 'br_netfilter\noverlay\n' >/etc/modules-load.d/k3s.conf
```

## Swap

> **Executar em:** nó alvo.

```bash
swapon --show
```

O kubelet, por padrão, recusa iniciar com swap ativo. Desabilite-o e remova a entrada de `/etc/fstab` para que a mudança sobreviva a um reboot:

```bash
swapoff --all
sed -i '/\sswap\s/s/^/#/' /etc/fstab
```

Se o ambiente exigir manter swap (não recomendado para nós de cluster), a instalação do K3s precisa do argumento `--kubelet-arg=fail-swap-on=false`; documente essa decisão explicitamente.

## Parâmetros de rede do kernel

> **Executar em:** nó alvo, como `root`.

```bash
cat <<SYSCTL_CONF >/etc/sysctl.d/90-k3s.conf
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
SYSCTL_CONF

sysctl --system
```

`ip_forward` é necessário para o roteamento entre Pods e para o NAT usado pelo Service networking; `bridge-nf-call-iptables` garante que o tráfego em bridge passe pelas regras de firewall/NAT do host.

## Validação final

> **Executar em:** nó alvo.

```bash
sysctl net.ipv4.ip_forward net.bridge.bridge-nf-call-iptables
swapon --show
cat /sys/fs/cgroup/cgroup.controllers
```

`ip_forward` deve retornar `1`, `swapon --show` não deve listar nada e `cgroup.controllers` deve listar `cpu`, `memory` e `pids` entre os controllers disponíveis.

## Troubleshooting

Se `cat /sys/fs/cgroup/cgroup.controllers` retornar "arquivo não encontrado", o host está em cgroups v1: verifique se o kernel e a distribuição estão nas versões testadas; distribuições mais antigas exigem habilitar cgroups v2 explicitamente na linha de comando do kernel (`systemd.unified_cgroup_hierarchy=1`), fora do escopo desta página.

## Próximo passo

O host está pronto para [instalar o primeiro servidor](../../kubernetes/install-first-k3s-server/), [adicionar um servidor](../../kubernetes/join-k3s-server/) ou [adicionar um agente](../../kubernetes/join-k3s-agent/), conforme seu papel no cluster.

## Fontes e leitura adicional

- [K3s: Requirements](https://docs.k3s.io/installation/requirements): referência oficial de CPU, memória, kernel, cgroups e módulos.
- [Kubernetes: Swap Memory Management](https://kubernetes.io/docs/concepts/architecture/nodes/#swap-memory): explica o comportamento padrão do kubelet em relação a swap.
