---
title: Arquitetura do Docker Swarm
sidebar:
  order: 1
---

> **Para quem é:** quem quer entender como Swarm coordena managers e workers antes de instalá-lo.

Docker Swarm usa um modelo de consenso distribuído (Raft) para manter consistência entre
managers. Diferente do Kubernetes, existe apenas um tipo de nó de trabalho: os managers,
opcionalmente, também executam containers, além de suas responsabilidades de consenso.

## Componentes

### Manager

Um manager participa do consenso Raft com os demais managers, mantém o estado do cluster
(serviços, tarefas, configs, secrets) e agenda as tarefas que os workers vão executar. É também
pela API que um manager expõe (`docker service`, `docker config` e as demais subcomandos) que
todo o cluster é operado, mesmo quando a tarefa em si roda em um worker.

Um cluster Swarm depende de quorum de managers para continuar tomando decisões: com 3 managers,
tolera a falha de 1; com 5, tolera a falha de 2. Perder mais managers do que isso trava o cluster
até que o quorum seja restaurado, cenário tratado em detalhe em
[Backup e recuperação](../backup-and-recovery/).

### Worker

Um worker recebe tarefas diretamente do manager, executa e monitora os containers
correspondentes e reporta o status de volta. Diferente de um manager, um worker nunca participa
do consenso Raft, o que o torna descartável e substituível sem risco para a disponibilidade do
control plane do cluster.

### Rede overlay

A rede overlay conecta todos os containers de um mesmo service entre múltiplos hosts,
encapsulando o tráfego em VXLAN (UDP porta 4789) para que cada container enxergue os demais como
se estivessem na mesma rede Ethernet virtual, independentemente do host físico em que rodam. O
balanceamento de carga entre réplicas de um service acontece dentro dessa rede, via IPVS,
transparente para o container.

### Ingress routing mesh

O ingress routing mesh publica portas diretamente nos hosts: qualquer manager ou worker do
cluster, mesmo um que não esteja executando o container de destino, aceita requisições na porta
publicada e as roteia automaticamente para um container que a atenda em algum lugar do cluster.
Isso oferece um balanceamento básico de saída, mas não substitui um load balancer externo quando
o requisito é controlar exatamente qual host recebe o tráfego (ver
[Host mode](../networking/#host-mode-bypass-mesh) em Rede e discovery).

## Limites do Swarm

A simplicidade do Swarm vem de recursos que ele deliberadamente não implementa:

- **Sem persistência nativa**: volumes são locais ao host; replicação entre hosts é
  responsabilidade da aplicação, não do orquestrador.
- **Sem autoscaling**: não há HPA automático; escalar é sempre uma decisão manual via
  `docker service scale`.
- **Sem RBAC fino**: todo manager tem acesso administrativo total ao cluster, sem papéis
  diferenciados.
- **Sem multi-tenancy real**: não há namespaces isolando cargas de trabalho entre si, então uma
  falha de isolamento em um service pode afetar o cluster inteiro.
- **Limite documentado de aproximadamente 1000 nós** para o algoritmo Raft continuar operando
  com desempenho previsível.
- **Sem service mesh nativo**: não há mTLS automático entre services nem circuit breakers.

Para cenários que exigem esses recursos, Kubernetes é a opção mais indicada; veja
[Docker Swarm vs. Kubernetes](../../../../learn/clusters/docker-swarm-vs-kubernetes/) para os
critérios de decisão entre as duas.

## Referências

- [Swarm mode key concepts](https://docs.docker.com/engine/swarm/key-concepts/): visão oficial dos componentes.
- [Raft Consensus Algorithm](https://raft.io/): explicação do algoritmo usado por Swarm.
