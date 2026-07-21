---
title: DNS e registro de domínios
description: Trilha de leitura desta seção, da resolução de um nome à cadeia de confiança que a autentica, e do registro de um domínio à conectividade WAN que decide se esse domínio precisa de DNS dinâmico.
sidebar:
  order: 0
---

> **Para quem é:** quem já usa `dig`/`nslookup` no dia a dia e quer entender o mecanismo por trás, separando com clareza o que é resolução do que é registro de domínio.

Esta seção segue uma ordem deliberada: primeiro o caminho de uma consulta comum (resolução, cache, TTL), depois o que existe dentro de uma zona e como ela delega parte do espaço de nomes para outra (zonas e registros), depois a cadeia de assinaturas que prova que uma resposta não foi forjada (DNSSEC). A partir daí a trilha muda de assunto de propósito: registro de domínio (WHOIS/RDAP) responde "quem é dono deste nome", uma pergunta completamente distinta de resolução, a regra central que esta seção existe para deixar explícita. As três páginas finais cobrem os casos que fogem do modelo central: quais softwares implementam cada papel, o caso em que não existe servidor nenhum (mDNS), e a conectividade WAN que decide se um operador precisa de DNS dinâmico para começo de conversa.

## Resolução, zonas e confiança

1. [Resolução DNS: do stub resolver à resposta autoritativa](resolution/) — o caminho completo de uma consulta, cache e TTL, e a distinção entre o resolver do sistema e o resolvedor recursivo da rede.
2. [Zonas, delegação e tipos de registro](zones-and-records/) — o que é uma zona, como NS e glue record fazem a delegação funcionar, e os tipos de registro que este notebook usa.
3. [DNSSEC: cadeia de confiança e o que ela realmente protege](dnssec/) — DS, DNSKEY, RRSIG, o que DNSSEC protege e o que não protege, e por que DoT/DoH resolvem um problema diferente.

## Registro de domínio

1. [Registro de domínio, WHOIS e RDAP](domains-whois-rdap/) — registry vs. registrar, e por que WHOIS/RDAP são consulta de dados de registro, não resolução.

## Implementações e casos fora do modelo central

1. [Implementações de servidor DNS: quem faz o quê](dns-servers/) — PowerDNS, Unbound, BIND, Technitium e CoreDNS, e critérios de escolha sem vencedor universal.
2. [mDNS e DNS-SD: resolução sem servidor](mdns-and-service-discovery/) — o caso em que nenhuma infraestrutura de DNS existe, e a base técnica do Bonjour.
3. [Conectividade WAN: PPPoE, DHCP, IP estático e por que isso importa para DNS](wan-connectivity/) — como um roteador de borda obtém endereço, e por que essa escolha decide a necessidade de DNS dinâmico.
