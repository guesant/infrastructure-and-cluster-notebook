---
title: Rede no Linux
description: Trilha de leitura desta seção, das interfaces e endereços que um host expõe até o fluxo de diagnóstico que conecta ip, ss, ping, traceroute/mtr e tcpdump a uma hipótese específica.
sidebar:
  order: 0
---

> **Para quem é:** quem já entende os conceitos gerais de [fundamentos de rede](../fundamentals/) e precisa ver como o Linux implementa cada peça, comando por comando, num host real.

Esta seção segue a ordem em que um pacote realmente percorre o host: primeiro a interface por onde ele entra ou sai (endereço, estado de link), depois a decisão de rota (para onde ele vai), depois a vizinhança de camada 2 (como ele chega ao próximo salto na rede local), depois o netfilter (o que pode descartá-lo ou traduzi-lo pelo caminho), e por fim o fluxo de diagnóstico que amarra todas as peças anteriores quando algo dá errado. Ler fora de ordem é possível, já que cada página linka o que assume como conhecido, mas a sequência abaixo é a que menos exige ir e voltar.

## Interfaces, rotas e vizinhança

1. [Interfaces e endereços no Linux](interfaces-and-addresses/) — `ip link`, `ip address`, estados de link, MTU, e por que o iproute2 substituiu o ifconfig.
2. [Roteamento local no Linux](routing/) — `ip route`, longest prefix match, `ip rule` e policy routing com múltiplas tabelas.
3. [Vizinhança e camada 2](neighbors-and-l2/) — ARP/Neighbor Discovery, bridges, veth pairs, TUN/TAP, e VLAN/VXLAN como segmentação e overlay de camada 2.

## Netfilter e diagnóstico

1. [Netfilter e nftables por dentro](netfilter-and-nftables/) — hooks, conntrack, e nftables como a máquina virtual que UFW, firewalld e iptables-nft configuram por cima.
2. [nftables ou iptables](nftables-vs-iptables/) — comparação por critérios entre as duas interfaces, sem vencedor universal.
3. [Fluxo de diagnóstico de rede no Linux](diagnostics/) — a ordem de investigação que conecta `ip`, `ss`, `ping`, `traceroute`/`mtr` e `tcpdump` a uma hipótese específica em cada etapa.
