---
title: Configurar DNS
description: Como identificar se /etc/resolv.conf é gerado automaticamente ou estático e configurar os resolvers DNS que o host usa para resolução externa e, quando aplicável, interna.
sidebar:
  order: 3
---

> **Pré-requisitos:** acesso root ao host, endereços dos resolvers DNS disponíveis (internos e/ou públicos).
> **Versões testadas:** Debian 12 (bookworm).

O host precisa resolver nomes externos para baixar pacotes, imagens de container e o instalador do K3s, e pode precisar resolver nomes internos quando o cluster usar DNS-01 para certificados ou depender de serviços nomeados fora do Kubernetes. Esta página cobre apenas a resolução do host; a resolução interna de Pods e Services é responsabilidade do CoreDNS do próprio cluster e não é afetada por esta configuração.

Debian não habilita `systemd-resolved` por padrão: a resolução normalmente é feita por `/etc/resolv.conf` estático ou gerado pelo cliente DHCP. Identifique qual dos dois casos se aplica antes de editar qualquer arquivo.

## Identificar o gerenciador de resolução

> **Executar em:** nó alvo.

```bash
readlink -f /etc/resolv.conf
systemctl is-active systemd-resolved 2>/dev/null || true
```

Se a saída de `readlink` apontar para um arquivo gerado (`/run/...`), o arquivo é sobrescrito automaticamente pelo cliente DHCP ou pelo NetworkManager; edite a configuração da interface, não `/etc/resolv.conf` diretamente. Se `/etc/resolv.conf` for um arquivo comum, ele pode ser editado diretamente.

## Definir resolvers estáticos

> **Executar em:** nó alvo, como `root`. Aplicável quando `/etc/resolv.conf` não é gerado automaticamente.

```bash
read -r -p "Resolvers, separados por vírgula (ex.: 1.1.1.1,8.8.8.8): " DNS_RESOLVERS
read -r -p "Domínio de busca (Enter para nenhum): " DNS_SEARCH_DOMAIN

{
  IFS=',' read -ra RESOLVER_LIST <<<"${DNS_RESOLVERS}"
  for RESOLVER in "${RESOLVER_LIST[@]}"; do
    printf 'nameserver %s\n' "${RESOLVER}"
  done
  if [[ -n "${DNS_SEARCH_DOMAIN}" ]]; then
    printf 'search %s\n' "${DNS_SEARCH_DOMAIN}"
  fi
} >/etc/resolv.conf
```

Quando o host usa `ifupdown` com um arquivo de interface estático, declare os mesmos resolvers em `/etc/network/interfaces` (`dns-nameservers`) para que sobrevivam a um `ifdown`/`ifup`; do contrário a interface pode regravar `/etc/resolv.conf` sem eles.

## Validação

> **Executar em:** nó alvo.

```bash
resolvectl status 2>/dev/null || cat /etc/resolv.conf
getent hosts docs.k3s.io
```

`getent hosts` deve retornar um endereço IP. Se falhar, confirme conectividade de saída na porta UDP/TCP 53 para os resolvers configurados antes de suspeitar da configuração local.

## Troubleshooting

Resolução lenta ou intermitente costuma indicar um resolver inalcançável listado antes de um resolver funcional: `/etc/resolv.conf` é consultado na ordem em que os `nameserver` aparecem, com timeout completo antes de tentar o próximo.

## Rollback

Restaure o `/etc/resolv.conf` anterior ou reverta a configuração da interface. Um backup do arquivo original antes da edição evita precisar reconstruir a lista de resolvers manualmente.

## Próximo passo

[Configurar sincronização de horário](../configure-time-synchronization/).

## Fontes e leitura adicional

- [man7.org: `resolv.conf(5)`](https://man7.org/linux/man-pages/man5/resolv.conf.5.html): referência da sintaxe e da ordem de resolução dos resolvers.
- [Debian Wiki: Network Configuration](https://wiki.debian.org/NetworkConfiguration): explica a interação entre `ifupdown`, NetworkManager e `/etc/resolv.conf` no Debian.
