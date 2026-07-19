---
title: Saúde de uma aplicação
description: Explica a diferença entre um Pod Running, um Pod Ready e uma aplicação de fato disponível para o consumidor.
sidebar:
  order: 4
---

> **Para quem é:** quem está definindo o que monitorar em uma aplicação além do estado básico do Pod.

`kubectl get pods` mostrando `Running` não prova que uma aplicação está funcional. Existem várias camadas entre "o processo está de pé" e "o consumidor consegue usar o serviço".

## Como funciona

```mermaid
flowchart LR
    accTitle: Camadas entre um processo rodando e uma aplicação disponível
    accDescr: Um Pod pode estar Running sem estar Ready; estar Ready sem que a dependência funcione; e a aplicação como um todo pode estar degradada mesmo com todos os Pods saudáveis individualmente.

    Running["Pod: Running<br/>(processo iniciado)"] --> Ready["Pod: Ready<br/>(readinessProbe passa)"]
    Ready --> Dependencias["Dependências saudáveis<br/>(banco, fila, APIs externas)"]
    Dependencias --> Disponivel["Aplicação de fato disponível<br/>(perspectiva do consumidor)"]
```yaml

`Running` significa que o container iniciou e não terminou. `Ready` significa que a `readinessProbe` configurada passou — mas uma probe mal desenhada pode não verificar nada relevante (veja os antipadrões em [prontidão de workloads](../../../operations/checklists/application-readiness/#startup-readiness-e-liveness-probes)). Mesmo com Pods `Ready`, uma dependência externa degradada (banco lento, fila cheia) pode deixar a aplicação de fato indisponível para o consumidor, sem que nenhum sinal interno do Kubernetes capture isso.

A camada final — disponibilidade percebida — só é medida observando a operação do ponto de vista de quem consome o serviço: os quatro sinais (latência, tráfego, erros, saturação) aplicados à interação real, não ao estado interno do Pod.

## Alternativas

Um probe sintético (uma requisição de teste periódica simulando um usuário real) mede a camada final diretamente, em vez de inferir disponibilidade a partir de sinais internos — veja [monitoramento de caixa-preta versus caixa-branca](../blackbox-vs-whitebox-monitoring/).

## Quando os sinais internos são suficientes

Para detectar falhas de infraestrutura óbvias (Pod não inicia, réplica insuficiente) onde a causa é clara a partir do estado do Kubernetes.

## Quando os sinais internos não bastam

Para confirmar que o serviço realmente atende ao consumidor, especialmente quando dependências externas podem degradar sem que nenhuma probe interna detecte — nesse caso, um teste sintético ou monitoramento externo é necessário (veja [configurar monitoramento externo de disponibilidade](../../../guides/tasks/observability/configure-external-availability-monitoring/)).

## Páginas relacionadas

- [Monitoramento de caixa-preta versus caixa-branca](../blackbox-vs-whitebox-monitoring/)
- [Prontidão de workloads](../../../operations/checklists/application-readiness/)
- [Configurar monitoramento externo de disponibilidade](../../../guides/tasks/observability/configure-external-availability-monitoring/)

## Referências

- [Liveness, Readiness, and Startup Probes — Kubernetes](https://kubernetes.io/docs/concepts/workloads/pods/probes/): define a semântica de cada probe e suas consequências.
