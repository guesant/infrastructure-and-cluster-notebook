---
title: Fail2Ban
description: Como instalar e configurar o Fail2Ban para bloquear temporariamente origens que repetem falhas de autenticação SSH, como complemento ao firewall e ao hardening do SSH.
sidebar:
  order: 8
---

> **Pré-requisitos:** acesso root ao host, firewall já configurado (veja [Firewall com UFW](../configure-ufw/) ou [Firewall com firewalld](../configure-firewalld/)).
> **Versões testadas:** Debian 12 (bookworm), Fail2Ban 1.0.

O Fail2Ban observa os logs de autenticação, identifica endereços que repetem falhas dentro de uma janela e solicita ao firewall um bloqueio temporário. Ele complementa o firewall e o hardening do SSH, mas não torna uma senha fraca segura e não deve ser a única proteção de um serviço exposto.

As camadas usadas neste guia têm responsabilidades diferentes:

| Camada | Responsabilidade |
| --- | --- |
| Firewall | Permitir somente origens, protocolos e portas necessários |
| Hardening do SSH | Restringir usuários, métodos de autenticação e funcionalidades do servidor SSH |
| Fail2Ban | Reagir a tentativas repetidas registradas nos logs |

Instale os pacotes:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
apt-get update
apt-get install --yes fail2ban python3-systemd
```

Edite a jail do SSH:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
${EDITOR:-nano} /etc/fail2ban/jail.d/sshd.local
```

```ini
[DEFAULT]
# Endereços que nunca devem ser bloqueados.
# Acrescente redes administrativas somente quando necessário, por exemplo:
# ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24 10.0.0.0/8
ignoreip = 127.0.0.1/8 ::1

# Bloqueio inicial.
bantime = 1h

# Janela na qual as falhas serão contabilizadas.
findtime = 10m

# Quantidade de falhas permitidas dentro da janela.
maxretry = 5

# Aumentar progressivamente o tempo de bloqueio para reincidentes.
bantime.increment = true
bantime.maxtime = 1w

# Não resolver DNS para os endereços encontrados nos logs.
usedns = no

[sshd]
enabled = true
# Ajuste se o SSH não usar a porta associada ao serviço "ssh".
port = ssh
# Ler eventos diretamente do journal do systemd.
backend = systemd
# Modos disponíveis: normal, ddos, extra e aggressive.
mode = normal
```

Valide antes de iniciar ou reiniciar:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
fail2ban-client -t
```

A validação deve terminar com:

```text
OK: configuration test is successful
```

Habilite e inicie o serviço:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
systemctl enable --now fail2ban
```

Depois de qualquer alteração, valide antes de reiniciar:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
fail2ban-client -t && systemctl restart fail2ban
```

Verifique o funcionamento:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
fail2ban-client ping
fail2ban-client status
fail2ban-client status sshd
```

A resposta do primeiro comando deve ser:

```text
Server replied: pong
```

Consulte os logs quando necessário:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
journalctl --unit fail2ban --follow
journalctl --unit ssh --follow
journalctl --unit fail2ban --since "1 hour ago" | grep -E 'Ban|Unban'
```

## Próximo passo

[Configurar journal persistente](../configure-persistent-journal/).

## Fontes e leitura adicional

- [Fail2Ban: projeto oficial](https://github.com/fail2ban/fail2ban): apresenta o funcionamento, a estrutura de configuração e os canais oficiais do projeto.
- [Debian Manpages: `jail.conf(5)`](https://manpages.debian.org/testing/fail2ban/jail.conf.5.en.html): documenta jails, filtros, ações, precedência dos arquivos `.conf` e `.local`, além de opções como `bantime`, `findtime` e `maxretry`.
- [Debian Manpages: `fail2ban-client(1)`](https://manpages.debian.org/testing/fail2ban/fail2ban-client.1.en.html): referência dos comandos de validação, estado e controle usados para operar o serviço e suas jails.
- [Fail2Ban: filtro `sshd` (repositório oficial)](https://github.com/fail2ban/fail2ban/blob/master/config/filter.d/sshd.conf): fonte dos modos e padrões utilizados para reconhecer falhas de autenticação do OpenSSH.
