---
title: Configurar journal persistente
description: Como habilitar e limitar o armazenamento persistente do journal do systemd, para que logs sobrevivam a reinicializações e fiquem disponíveis para diagnosticar falhas do K3s.
sidebar:
  order: 9
---

> **Pré-requisitos:** acesso root ao host.
> **Versões testadas:** Debian 12 (bookworm), systemd 252.

Por padrão, o Debian mantém o journal do systemd apenas em memória (`/run/log/journal`), volátil entre reinicializações. Quando o K3s ou um serviço do host falha durante um reboot, inclusive o próprio reboot causado pela falha, os logs do evento desaparecem antes de poderem ser lidos. Torne o journal persistente antes de precisar diagnosticar um problema, não depois.

## Habilitar o armazenamento persistente

> **Executar em:** nó alvo, como `root`.

```bash
mkdir -p /var/log/journal
systemd-tmpfiles --create --prefix /var/log/journal

sed -i 's/^#\?Storage=.*/Storage=persistent/' /etc/systemd/journald.conf
systemctl restart systemd-journald
```

`systemd-tmpfiles --create` aplica as permissões corretas (`root:systemd-journal`, `2755`) ao novo diretório sem exigir reinicialização completa do host.

## Limitar o espaço em disco usado

Sem um limite explícito, o journal persistente pode crescer até consumir uma fração grande do disco. Defina um teto:

> **Executar em:** nó alvo, como `root`.

```bash
read -r -p "Limite máximo do journal (ex.: 500M, 2G): " JOURNAL_MAX_USE

sed -i "s/^#\?SystemMaxUse=.*/SystemMaxUse=${JOURNAL_MAX_USE}/" /etc/systemd/journald.conf
systemctl restart systemd-journald
```

## Validação

> **Executar em:** nó alvo.

```bash
journalctl --disk-usage
find /var/log/journal -maxdepth 1 -type d
```

`--disk-usage` deve reportar um valor maior que zero em `/var/log/journal` (não em `/run/log/journal`) depois de uma reinicialização de teste ou de `systemctl restart systemd-journald`.

## Troubleshooting

Se `--disk-usage` continuar mostrando apenas o volume em `/run`, confirme que `Storage=persistent` (não `auto`) está ativo em `/etc/systemd/journald.conf`: `auto` só persiste quando `/var/log/journal` já existir com as permissões corretas, o que o passo acima já garante.

## Próximo passo

[Desabilitar serviços desnecessários](../disable-unnecessary-services/).

## Fontes e leitura adicional

- [systemd: `journald.conf(5)`](https://www.freedesktop.org/software/systemd/man/latest/journald.conf.html): referência de `Storage`, `SystemMaxUse` e demais limites de retenção.
- [systemd: `journalctl(1)`](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html): documenta `--disk-usage` e as opções de consulta do journal.
