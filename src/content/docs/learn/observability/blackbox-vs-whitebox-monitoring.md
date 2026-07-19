---
title: Monitoramento de caixa-preta ou caixa-branca
description: Compara monitoramento externo (caixa-preta) com instrumentação interna (caixa-branca), e por que os dois são necessários juntos.
sidebar:
  order: 5
---

> **Para quem é:** quem quer entender por que um cluster instrumentado internamente ainda precisa de uma verificação externa.

Os dois modelos observam o sistema de perspectivas diferentes, e nenhum substitui o outro.

## Como funciona

**Monitoramento de caixa-branca** (whitebox) usa instrumentação interna — métricas expostas pela própria aplicação, logs, traces. Ele enxerga o interior do sistema: contadores de erro específicos, latência por operação, estado interno de filas. Sua limitação: se o sistema de monitoramento e a aplicação compartilham a mesma infraestrutura, uma falha ampla pode derrubar os dois juntos, deixando o observador cego exatamente quando mais precisa enxergar.

**Monitoramento de caixa-preta** (blackbox) observa o sistema de fora, sem conhecimento do interior — um teste de DNS, um handshake TLS, uma requisição HTTP completa simulando um usuário. Ele não explica a causa de uma falha, mas detecta a indisponibilidade mesmo quando a instrumentação interna também está fora do ar.

```mermaid
flowchart LR
    accTitle: Caixa-branca observa o interior; caixa-preta observa de fora
    accDescr: O monitoramento de caixa-branca usa métricas e logs internos à aplicação; o monitoramento de caixa-preta testa o sistema de fora, sem depender da instrumentação interna estar funcionando.

    subgraph Interno["Dentro do domínio de falha"]
        App["Aplicação instrumentada"] --> Whitebox["Métricas, logs, traces"]
    end

    subgraph Externo["Fora do domínio de falha"]
        Blackbox["Sonda externa"] -->|"HTTP/DNS/TLS"| App
    end
```yaml

## Alternativas

Um *synthetic monitoring* mais sofisticado (uma transação de múltiplos passos, simulando um fluxo real de usuário) é uma forma avançada de caixa-preta, mais representativa que um simples teste TCP.

## Quando caixa-branca é suficiente

Para diagnosticar a causa de um problema já detectado — a instrumentação interna é onde a investigação realmente acontece.

## Quando caixa-preta é necessária

Sempre, como complemento — é o único sinal que sobrevive à perda completa do cluster ou da plataforma de observabilidade interna. Veja [configurar monitoramento externo de disponibilidade](../../../guides/tasks/observability/configure-external-availability-monitoring/).

## Decisões que isso implica

O monitoramento de caixa-preta deveria rodar fora do domínio de falha do cluster que ele observa — rodá-lo dentro do próprio cluster monitorado reproduz o mesmo problema que ele deveria resolver.

## Páginas relacionadas

- [Saúde de uma aplicação](../application-health/)
- [Configurar monitoramento externo de disponibilidade](../../../guides/tasks/observability/configure-external-availability-monitoring/)

## Referências

- [Observability — Kubernetes](https://kubernetes.io/docs/concepts/cluster-administration/observability/): visão geral oficial dos sinais disponíveis.
