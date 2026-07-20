---
title: Preparar um servidor Debian
description: Roteiro consolidado com as dez etapas para deixar um host Debian pronto para receber o K3s, da definição do hostname à validação final de requisitos.
sidebar:
  order: 1
---

> **Pré-requisitos:** instalação mínima do Debian 12 (bookworm) concluída, acesso root ou sudo, console da máquina disponível como via de recuperação.
> **Versões testadas:** Debian 12 (bookworm).

Esta página funciona como roteiro para deixar um host Debian pronto para receber o K3s. Ela não repete os comandos das páginas específicas: segue cada uma na ordem abaixo e volte aqui para conferir o que falta.

| Etapa | Página | Por quê |
| --- | --- | --- |
| 1 | [Configurar o hostname](../configure-hostname/) | K3s usa o hostname como `node-name` padrão; precisa ser único no cluster. |
| 2 | [Configurar DNS](../configure-dns/) | O host precisa resolver nomes externos e, quando aplicável, internos. |
| 3 | [Configurar sincronização de horário](../configure-time-synchronization/) | Relógio divergente causa falhas de eleição no etcd e recusa de certificados válidos. |
| 4 | [Firewall com UFW](../configure-ufw/) ou [Firewall com firewalld](../configure-firewalld/) | Bloquear entrada por padrão antes de expor qualquer serviço. |
| 5 | [Hardening de SSH](../harden-ssh/) | Reduz a superfície de ataque do único canal de acesso remoto. |
| 6 | [Fail2Ban](../configure-fail2ban/) | Recomendado; mitiga tentativas de força bruta contra o SSH. |
| 7 | [Journal persistente](../configure-persistent-journal/) | Logs sobrevivem a reinicializações, necessários para diagnosticar falhas do K3s. |
| 8 | [Desabilitar serviços desnecessários](../disable-unnecessary-services/) | Reduz superfície de ataque e consumo de recursos no host. |
| 9 | [Atualizações automáticas de segurança](../configure-automatic-security-updates/) | Recomendado; mantém patches de segurança do SO em dia sem depender de rotina manual. |
| 10 | [Validar requisitos do host](../validate-host-requirements/) | Confirma CPU, memória, disco, kernel e módulos antes de instalar o K3s. |

Nenhuma etapa é específica de K3s até a validação final: o mesmo roteiro serve para qualquer nó do cluster, manager ou agent. Em uma topologia multinó, repita as dez etapas em cada host antes de iniciar a instalação do K3s.

## Checkpoint

O host tem hostname único e resolvível, horário sincronizado, firewall ativo com SSH liberado, journal persistente e passou na validação de requisitos. Depois disso, siga para [instalar o primeiro servidor](../../kubernetes/install-first-k3s-server/) ou [adicionar um servidor](../../kubernetes/join-k3s-server/)/[adicionar um agente](../../kubernetes/join-k3s-agent/), conforme o papel deste host no cluster.

## Fontes e leitura adicional

- [K3s: Requirements](https://docs.k3s.io/installation/requirements): lista os requisitos de sistema operacional, recursos e rede cobertos por este roteiro.
- [Debian: Installation Guide](https://www.debian.org/releases/bookworm/installmanual): referência oficial da instalação mínima usada como ponto de partida.
