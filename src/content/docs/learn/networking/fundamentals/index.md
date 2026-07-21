---
title: Fundamentos de rede
description: Trilha de leitura desta seção, dos modelos de camadas que dão vocabulário ao resto do notebook até os mecanismos de acesso e exposição que sustentam operar um cluster remoto.
sidebar:
  order: 0
---

> **Para quem é:** quem quer entender o vocabulário e os mecanismos de rede que o resto do notebook assume como conhecido, antes de ver como o Linux implementa cada peça.

Esta seção segue uma ordem deliberada: primeiro os dois modelos de camadas que dão vocabulário a tudo que vem depois (OSI e TCP/IP), depois o endereçamento que qualquer rede depende (IPv4, IPv6) e a camada de segurança que protege o que trafega nela (TLS/mTLS), e por fim os mecanismos que resolvem acesso administrativo e exposição de serviços a partir de fora da rede local (VPNs e overlays, túneis de exposição, BGP e confiança de rota, plataformas dedicadas de borda). Ler fora de ordem é possível, já que cada página linka o que assume como conhecido, mas a sequência abaixo é a que menos exige ir e voltar. Depois desta seção, a trilha continua em [rede no Linux](../linux/), onde os mesmos conceitos aparecem como interfaces, rotas e regras de firewall reais num host.

## Modelos e endereçamento

1. [Modelo OSI e modelo TCP/IP](osi-and-tcpip/) — por que dois modelos de camadas convivem, e onde a numeração do OSI (L3/L4/L7) aparece no resto do notebook.
2. [Endereçamento IPv4 e IPv6](ipv4-and-ipv6/) — CIDR, blocos privados, NAT, e o que muda de fato com IPv6.
3. [TLS e mTLS](tls-and-mtls/) — o handshake, o que um certificado prova, e autenticação mútua entre os dois lados de uma conexão.

## Acesso e exposição

1. [VPNs e redes overlay](vpns-and-overlay-networks/) — OpenVPN e WireGuard como VPNs, Tailscale e ZeroTier como overlays gerenciados, critérios de escolha.
2. [Túneis de exposição](exposure-tunnels/) — Cloudflare Tunnel e ngrok, e em que isso difere de uma VPN.
3. [BGP, AS e confiança de rota](bgp-and-route-trust/) — Sistemas Autônomos, RPKI, e as defesas contra IP spoofing.
4. [Plataformas dedicadas de rede](dedicated-network-platforms/) — RouterOS e pfSense/OPNsense como roteamento e firewall na borda, antes do host.
