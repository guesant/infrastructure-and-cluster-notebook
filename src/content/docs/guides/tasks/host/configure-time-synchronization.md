---
title: Configurar sincronização de horário
description: Como confirmar e ajustar a sincronização de horário via systemd-timesyncd antes de instalar o K3s, evitando falhas de eleição no etcd e recusa de certificados válidos.
sidebar:
  order: 4
---

> **Pré-requisitos:** acesso root ao host, saída de rede liberada para NTP (UDP 123) ou para os servidores NTP escolhidos.
> **Versões testadas:** Debian 12 (bookworm), systemd-timesyncd 252.

O etcd embarcado do K3s rejeita escritas quando o relógio de um membro diverge o suficiente dos demais, e certificados TLS (inclusive os emitidos pelo cert-manager) são validados por período de validade absoluto. Um host com relógio desalinhado pode causar falhas de eleição no etcd ou recusa de certificados válidos. Sincronize o horário antes de instalar o K3s, não depois de investigar um sintoma difícil de reproduzir.

Debian habilita `systemd-timesyncd` por padrão, suficiente para a maioria dos clusters. Use `chrony` apenas se o ambiente já o exigir por outro motivo, por exemplo quando o host precisar atuar como servidor NTP de referência para outros hosts.

## Confirmar e ajustar o serviço

> **Executar em:** nó alvo, como `root`.

```bash
timedatectl status
```

Confirme `System clock synchronized: yes` e `NTP service: active`. Se `NTP service` estiver `inactive`, habilite-o:

```bash
timedatectl set-ntp true
```

## Definir fuso horário e servidores NTP

> **Executar em:** nó alvo, como `root`.

```bash
read -r -p "Fuso horário (ex.: America/Sao_Paulo): " NODE_TIMEZONE
timedatectl set-timezone "${NODE_TIMEZONE}"
```

Para usar servidores NTP específicos em vez dos padrões do Debian, edite `/etc/systemd/timesyncd.conf`:

```bash
read -r -p "Servidores NTP, separados por espaço: " NTP_SERVERS

sed -i "s/^#\?NTP=.*/NTP=${NTP_SERVERS}/" /etc/systemd/timesyncd.conf
systemctl restart systemd-timesyncd
```

## Validação

> **Executar em:** nó alvo.

```bash
timedatectl status
timedatectl timesync-status
```

`System clock synchronized` deve ser `yes` e `timesync-status` deve mostrar um servidor NTP alcançado recentemente (`Poll interval` ativo, sem erro de conexão).

## Troubleshooting

Se `NTP service` permanecer `inactive` mesmo após `set-ntp true`, verifique se outro serviço de tempo (`chrony`, `ntpd`) está instalado e conflitando pela porta 123: apenas um serviço de sincronização deve rodar por vez.

## Próximo passo

Em cluster multinó, repita esta página em cada nó antes de prosseguir; um único nó com relógio divergente já é suficiente para instabilidade no etcd. Depois, siga para [preparar o firewall do host](../configure-ufw/).

## Fontes e leitura adicional

- [systemd: `timedatectl(1)`](https://www.freedesktop.org/software/systemd/man/latest/timedatectl.html): referência dos subcomandos de fuso horário e sincronização.
- [K3s: Requirements](https://docs.k3s.io/installation/requirements): lista a sincronização de horário entre nós como pré-requisito para o datastore.
