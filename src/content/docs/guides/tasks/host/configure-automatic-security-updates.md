---
title: Configurar atualizações automáticas de segurança
sidebar:
  order: 11
---

> **Pré-requisitos:** acesso root ao host, saída de rede para os repositórios Debian.
> **Versões testadas:** Debian 12 (bookworm), `unattended-upgrades` 2.9.

O pacote `unattended-upgrades` aplica atualizações de segurança do repositório `bookworm-security` automaticamente, sem depender de uma rotina manual de patching. Isso reduz a janela de exposição a vulnerabilidades conhecidas do sistema operacional, mas não substitui o acompanhamento de mudanças de versão do próprio K3s — atualizações automáticas do SO não devem reiniciar o host sem revisão em um nó de produção sem antes confirmar o comportamento de reinício configurado abaixo.

## Instalar e habilitar

> **Executar em:** nó alvo, como `root`. Requer rede (`JAIL_NETWORK=1` ao testar via `jail-exec.sh` neste repositório, quando aplicável).

```bash
apt-get update
apt-get install --yes unattended-upgrades apt-listchanges

dpkg-reconfigure --priority=low unattended-upgrades
```yaml

O `dpkg-reconfigure` habilita o timer `apt-daily-upgrade.timer`, que executa o `unattended-upgrades` periodicamente.

## Restringir ao repositório de segurança e controlar reinícios

Revise `/etc/apt/apt.conf.d/50unattended-upgrades`: por padrão, o Debian já restringe as atualizações automáticas às origens de segurança (`origin=Debian,codename=bookworm-security`). Confirme essa origem e decida explicitamente sobre reinícios automáticos:

> **Executar em:** nó alvo, como `root`.

```bash
grep -A2 '^Unattended-Upgrade::Origins-Pattern' /etc/apt/apt.conf.d/50unattended-upgrades
grep '^Unattended-Upgrade::Automatic-Reboot' /etc/apt/apt.conf.d/50unattended-upgrades
```yaml

Em um nó de cluster, `Automatic-Reboot` como `"false"` (o padrão comentado) exige intervenção manual para aplicar atualizações que pedem reinício — planeje essa janela junto com o [runbook de manutenção](../../../operations/maintenance/maintenance-runbook/). Habilitar reinício automático (`"true"`) simplifica a operação, mas pode derrubar um nó manager sem coordenação com os demais componentes do cluster.

## Validação

> **Executar em:** nó alvo, como `root`.

```bash
systemctl status apt-daily-upgrade.timer
unattended-upgrade --dry-run --debug
```yaml

`--dry-run --debug` mostra quais pacotes seriam atualizados na próxima execução real, sem aplicar nada.

## Troubleshooting

Se `--dry-run` não listar nenhum pacote mesmo com atualizações de segurança pendentes (confirme com `apt list --upgradable`), revise o `Origins-Pattern` — uma origem digitada incorretamente faz o filtro não corresponder a nenhum pacote.

## Rollback

```bash
systemctl disable --now apt-daily-upgrade.timer apt-daily.timer
```yaml

## Próximo passo

[Validar requisitos do host](../validate-host-requirements/).

## Fontes e leitura adicional

- [Debian Wiki — UnattendedUpgrades](https://wiki.debian.org/UnattendedUpgrades): guia oficial de instalação, configuração e comportamento padrão do pacote.
- [`unattended-upgrades(8)`](https://manpages.debian.org/bookworm/unattended-upgrades/unattended-upgrade.8.en.html): referência de `--dry-run`, `--debug` e demais opções.
