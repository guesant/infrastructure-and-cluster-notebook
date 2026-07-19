---
title: Docker Swarm — blueprint
sidebar:
  order: 2
---

> **Para quem é:** quem precisa orquestrar múltiplos containers em um cluster pequeno, com simplicidade operacional acima de flexibilidade.
> **Pré-requisito:** Docker instalado em múltiplas máquinas Debian/Ubuntu.

Docker Swarm é um orquestrador de containers embutido no Docker — não precisa de componentes adicionais nem de uma grande mudança operacional se você já usa Docker. Este blueprint cobre um cluster Swarm de 3 ou 5 managers + múltiplos workers, com rede overlay, publicação de portas, secrets, volumes e procedimentos de manutenção.

## Diferenças contra Kubernetes/K3s

Swarm é **mais simples** — um comando (`docker swarm init`) já cria o cluster, Compose YAML funciona direto sem conversão, e o número de conceitos é menor. Mas é **menos flexível** — sem CNI de terceiros, sem role-based access control fino, sem recursos como HPA (horizontal pod autoscaling) ou service mesh. Para equipes pequenas ou clusters < 50 nós, essa simplicidade é uma vantagem.

## Topologia recomendada

```yaml
┌─────────────────────────────────────────┐
│  Load Balancer (HAProxy / DNS)          │
│  exemplo.local:80, :443                 │
└───────┬─────────────────────────────────┘
        │
    ┌───┴───┬──────────┬──────────┐
    │       │          │          │
[Manager-0] [Manager-1] [Manager-2]
(LEADER)    (REPLICA)   (REPLICA)
    │       │          │          │
    └───────┴──────────┴──────────┘
         Rede Overlay
    │
[Worker-0]  [Worker-1]  [Worker-2]
 (app)       (app)       (app)
```yaml

- **3 ou 5 managers**: quorum para tolerância a falhas. Managers também podem rodar workloads.
- **Múltiplos workers**: máquinas especializadas para aplicações, sem responsabilidade de consenso.
- **Rede overlay**: conecta todos os containers, independente do host.

## Próximas seções

1. [Arquitetura](architecture/) — managers, workers, raft, quorum.
2. [Managers e workers](managers-and-workers/) — instalação e entrada de nós.
3. [Rede e discovery](networking/) — overlay, ingress routing mesh, DNS.
4. [Secrets e configs](secrets-and-configs/) — gestão segura de dados de configuração.
5. [Dados persistentes](persistent-data/) — volumes, mounts, backup.
6. [Implantação de aplicações](application-deployment/) — services, tasks, constraints.
7. [Atualizações e rollbacks](updates-and-rollbacks/) — atualização gradual sem downtime.
8. [Backup e recuperação](backup-and-recovery/) — snapshot do estado do cluster.

## Antes de começar

- Docker >= 20.10 em todos os nós.
- Conectividade de rede entre hosts (UDP/TCP porta 2377 para consenso, 7946 para gossip, 4789 para overlay).
- Firewall aberto para essas portas entre os managers e entre managers e workers.
- Cuidado: não confunda `docker service` com `docker container` — services são o primitivo de orquestração em Swarm, containers são a instância real.

## Referências

- [Docker Swarm mode overview](https://docs.docker.com/engine/swarm/): documentação oficial.
- [Raft Consensus Algorithm](https://raft.io/): base teórica do consenso de managers.
