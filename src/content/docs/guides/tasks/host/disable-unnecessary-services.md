---
title: Desabilitar serviços desnecessários
sidebar:
  order: 10
---

> **Pré-requisitos:** acesso root ao host.
> **Versões testadas:** Debian 12 (bookworm), systemd 252.

Uma instalação mínima do Debian já vem enxuta, mas imagens de provedores de nuvem e instalações com a opção "Desktop environment" costumam trazer serviços que um nó de cluster não usa: Bluetooth, impressão (CUPS), descoberta de rede local (Avahi), interfaces gráficas. Cada serviço ativo é superfície de ataque adicional e consumo de CPU/memória que compete com o K3s.

Não desabilite serviços às cegas. Liste o que está ativo, decida caso a caso e documente a decisão — um serviço aparentemente inútil pode ser exigido por hardware específico (ex.: agente de gerenciamento do provedor de nuvem).

## Listar serviços ativos

> **Executar em:** nó alvo.

```bash
systemctl list-units --type=service --state=running
```yaml

Revise a lista contra o papel do host. Candidatos comuns a desabilitar em um servidor sem interface gráfica: `bluetooth.service`, `cups.service`, `avahi-daemon.service`, `ModemManager.service`.

## Desabilitar um serviço

> **Executar em:** nó alvo, como `root`.

```bash
read -r -p "Nome do serviço a desabilitar (ex.: bluetooth.service): " SERVICE_NAME

systemctl disable --now "${SERVICE_NAME}"
```yaml

`--now` para o serviço imediatamente além de remover sua ativação no próximo boot, em um único comando.

## Validação

> **Executar em:** nó alvo.

```bash
systemctl status "${SERVICE_NAME}"
systemctl is-enabled "${SERVICE_NAME}"
```yaml

`is-enabled` deve retornar `disabled` e o serviço não deve aparecer mais em `systemctl list-units --type=service --state=running`.

## Rollback

```bash
systemctl enable --now "${SERVICE_NAME}"
```yaml

## Próximo passo

[Atualizações automáticas de segurança](../configure-automatic-security-updates/).

## Fontes e leitura adicional

- [`systemctl(1)` — systemd](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html): referência de `disable`, `enable`, `is-enabled` e do estado de unidades.
