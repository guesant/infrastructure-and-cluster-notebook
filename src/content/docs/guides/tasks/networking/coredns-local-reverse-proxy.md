---
title: DNS interno e reverse proxy local
description: Roteiro que combina os guias de CoreDNS e reverse proxy para eliminar o uso de kubectl port-forward manual no acesso administrativo a serviços internos.
sidebar:
  order: 3
---

Acessar um serviço interno (Grafana, Prometheus, Argo CD) normalmente exige `kubectl port-forward`: um comando por serviço, preso a um terminal aberto e a uma porta local diferente a cada vez. As duas páginas seguintes substituem isso por um setup permanente, combinando resolução de nomes com roteamento de tráfego.

Para o raciocínio completo por trás dessa combinação (por que ela existe, quando vale a pena adotá-la e quais variantes de topologia são possíveis), veja o blueprint [DNS interno e reverse proxy local](../../../blueprints/dns-and-reverse-proxy/). Esta página é apenas o roteiro de execução dentro de `guides/tasks/networking`.

| Etapa | Página | Por quê |
| --- | --- | --- |
| 1 | [Configurar CoreDNS para resolução interna](../setup-coredns-internal/) | Declara a zona `internal` que resolve nomes administrativos como `grafana.internal` para o reverse proxy local. |
| 2 | [Configurar reverse proxy em localhost](../setup-reverse-proxy-localhost/) | Recebe a conexão em `127.0.0.1:443` e roteia por SNI até o serviço correto. |

## Checkpoint

`curl -k https://grafana.internal` (ou o serviço equivalente escolhido) responde a partir da estação administrativa, sem nenhum `kubectl port-forward` em execução. Cada uma das duas páginas acima já inclui sua própria seção de validação; não há uma terceira página de checklist separada para este roteiro.

## Fontes e leitura adicional

- [DNS interno e reverse proxy local (blueprint)](../../../blueprints/dns-and-reverse-proxy/): arquitetura completa, variantes de topologia e considerações de segurança.
