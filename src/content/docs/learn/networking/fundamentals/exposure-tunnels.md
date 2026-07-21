---
title: Túneis de exposição
description: Como Cloudflare Tunnel e ngrok publicam um serviço interno sem abrir porta de entrada, em que isso difere de uma VPN, os riscos de depender de um terceiro na borda, e o papel do DNS dinâmico quando o lado exposto não tem endereço público estável.
sidebar:
  order: 5
---

> **Para quem é:** quem quer publicar um serviço rodando atrás de NAT, sem IP público fixo ou sem querer abrir porta nenhuma no roteador, e está avaliando se um túnel de exposição é a ferramenta certa ou se o caso pede outra coisa.

A página de [VPNs e redes overlay](../vpns-and-overlay-networks/) resolve o problema de trazer um operador para dentro de uma rede privada. Um túnel de exposição resolve o problema oposto: publicar um serviço que já está dentro de uma rede privada para fora dela, para qualquer cliente da internet, sem que esse cliente precise de VPN nenhuma nem de credencial de rede alguma. VPN move o operador para dentro; túnel de exposição move o serviço para fora.

## Cloudflare Tunnel: conector de saída até a borda da Cloudflare

O `cloudflared`, o conector que implementa o Cloudflare Tunnel, inicia uma conexão de saída do servidor de origem até a rede da Cloudflare, atravessando o firewall local exatamente como qualquer outra conexão de saída comum já faria. Não existe porta de entrada para abrir no roteador nem no firewall do host: o tráfego passa a fluir nos dois sentidos sobre essa mesma conexão já estabelecida, depois que o túnel (um objeto persistente identificado por um UUID) liga a origem à borda da Cloudflare. Um registro DNS aponta o nome público para esse túnel, e a Cloudflare passa a rotear requisições que chegam nesse nome através da conexão de saída até o `cloudflared`, que então entrega o tráfego ao serviço local.

O ponto que exige atenção é onde o TLS é terminado: a conexão HTTPS pública do visitante termina na borda da Cloudflare, não no servidor de origem. A Cloudflare decifra a requisição, e o tráfego entre a borda e o `cloudflared` viaja por dentro do canal já cifrado do túnel, não necessariamente como uma segunda conexão TLS própria do serviço de origem. Na prática, isso significa que a Cloudflare tem acesso ao conteúdo decifrado da requisição em algum ponto do caminho, o preço operacional de terceirizar a borda pública para não precisar expor porta nenhuma.

## ngrok: da sessão efêmera ao domínio reservado

O ngrok resolve o mesmo problema de fundo (publicar um serviço local sem abrir porta) com um modelo de uso historicamente mais associado a desenvolvimento e demonstração: rodar `ngrok http <porta>` cria uma URL pública imediatamente, útil para testar um webhook, mostrar uma tela em progresso, ou depurar uma integração que precisa alcançar `localhost`. No uso gratuito, essa URL costuma ser efêmera: muda a cada sessão, o que a torna inadequada como endereço permanente de um serviço.

O próprio ngrok deixa de ser só essa ferramenta de desenvolvimento nos planos pagos, onde oferece domínios reservados e uso como ingress de produção, inclusive um operador para Kubernetes. A diferença prática que importa para quem está escolhendo, mais do que "é uma ferramenta de dev ou de produção", é: a URL vai mudar a cada reinício, ou existe um domínio fixo reservado? Um serviço que outras pessoas ou sistemas precisam encontrar de forma confiável não pode depender de uma URL que muda sem aviso.

## Riscos de depender de um túnel de exposição

Os dois mecanismos compartilham a mesma categoria de risco, independentemente de qual se escolhe. O serviço passa a depender de um terceiro estar no ar e se comportando corretamente: uma interrupção do provedor do túnel derruba o acesso ao serviço exposto, mesmo que a origem esteja funcionando perfeitamente. A borda pública, com TLS terminado ali, vê o tráfego decifrado antes de encaminhá-lo (ou de reencaminhá-lo cifrado) até a origem, uma superfície de confiança que não existe quando o TLS é terminado diretamente no servidor de origem, como discutido na página de [TLS e mTLS](../tls-and-mtls/). E o nome público do serviço passa a apontar para infraestrutura de terceiros, não para um IP sob controle direto do operador, o que precisa entrar na análise de continuidade: se o provedor do túnel encerrar o serviço, ou mudar de política, o caminho de acesso ao serviço muda com ele.

## DDNS: a alternativa quando existe IP público, só que instável

Nem todo serviço exposto precisa de um túnel através de um terceiro; às vezes o problema real é mais simples: existe conectividade direta de entrada possível (a porta pode ser aberta no roteador), mas o endereço IP público muda sem aviso, o cenário de uma conexão residencial comum ou de um [prefixo IPv6 delegado que pode rotacionar](../ipv4-and-ipv6/#o-problema-do-prefixo-público-rotacionado), já discutido nesta trilha. Nesse caso, DNS dinâmico (DDNS) resolve o problema sem depender de um túnel: um cliente, rodando no roteador, num host do cluster, ou como tarefa agendada, consulta periodicamente o próprio endereço público e, quando ele muda, atualiza o registro `A` ou `AAAA` correspondente via API do provedor de DNS.

O mecanismo formal por trás disso é a operação `UPDATE` do DNS, definida pela RFC 2136: o DNS foi originalmente desenhado para uma base estática, editada manualmente, e essa extensão permite que um cliente autenticado modifique um registro diretamente, sujeito a pré-condições verificadas atomicamente pelo servidor, sem passar por edição manual de arquivo de zona. Provedores voltados a uso doméstico normalmente expõem essa mesma ideia por trás de uma API HTTP mais simples, sem exigir que o cliente implemente o protocolo `UPDATE` completo.

DDNS e túnel de exposição não competem diretamente: DDNS resolve "meu IP muda, mas eu ainda quero ser alcançado diretamente nele"; túnel de exposição resolve "eu não quero (ou não posso) ser alcançado diretamente, ponto final". Um roteador sem porta de entrada abrível (CGNAT, por exemplo, onde o operador nem tem um IP público próprio para começar) elimina DDNS como opção sozinha e deixa o túnel de exposição como o caminho que resta.

## Páginas relacionadas

- [VPNs e redes overlay](../vpns-and-overlay-networks/): o problema oposto, trazer o operador para dentro em vez de publicar um serviço para fora.
- [TLS e mTLS](../tls-and-mtls/): o que significa TLS terminado na borda de um terceiro, aplicado aqui ao Cloudflare Tunnel.
- [Endereçamento IPv4 e IPv6](../ipv4-and-ipv6/): a discussão de prefixo IPv6 rotacionado que motiva DDNS como alternativa ao túnel.

## Referências

- [Cloudflare: Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/): conexão de saída via `cloudflared`, sem porta de entrada.
- [ngrok: What is ngrok?](https://ngrok.com/docs/what-is-ngrok/): do uso efêmero de desenvolvimento a domínios reservados em planos pagos.
- [RFC 2136 — Dynamic Updates in the Domain Name System (DNS UPDATE)](https://www.rfc-editor.org/rfc/rfc2136): mecanismo formal de atualização dinâmica de registros DNS, base do DDNS.
