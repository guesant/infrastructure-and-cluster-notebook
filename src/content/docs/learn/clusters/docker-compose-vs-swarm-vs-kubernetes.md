---
title: Docker Compose vs. Swarm vs. Kubernetes
description: Compara as três ferramentas de orquestração de containers por escopo (um host, um pequeno cluster, produção escalável) e por trajetória de aprendizado.
sidebar:
  order: 6
---

> **Para quem é:** quem está começando com containers e não sabe qual ferramenta escolher.

Docker Compose, Docker Swarm e Kubernetes resolvem o mesmo problema geral (rodar múltiplos containers coordenados) em escopos diferentes: um único host para desenvolvimento, um pequeno cluster de poucos hosts, ou uma plataforma de produção escalável, respectivamente.

| Nível | Ferramenta | Ideal para | Escopo |
| --- | --- | --- | --- |
| Dev/local | Docker Compose | Um desenvolvedor, máquina local | Um host |
| Pequeno cluster | Docker Swarm | Equipe pequena, poucas dezenas de nós | Múltiplos hosts, um datacenter |
| Produção/cloud | Kubernetes (K3s, EKS, GKE) | Escalabilidade, multi-tenancy, automação | Múltiplos datacenters, escala pública |

## Docker Compose

Compose é uma ferramenta de desenvolvimento, não de produção: tudo roda na mesma máquina, coordenado por um único comando (`docker compose up`).

```yaml
services:
  web:
    image: nginx
    ports:
      - "80:80"
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: example
```

Use Compose no laptop, em CI/CD local, ou em ambientes pequenos que não precisam sobreviver à perda da única máquina onde rodam. Ele não oferece escalabilidade além de um host, alta disponibilidade, nem os conceitos de rede overlay e service discovery que Swarm e Kubernetes introduzem para coordenar múltiplos hosts.

## Docker Swarm

Swarm estende o modelo do Compose para múltiplos hosts coordenados por um quorum de managers, usando uma sintaxe próxima: `docker service create` no lugar de `docker compose up`.

```bash
docker service create --replicas 3 -p 80:8080 nginx
```

Swarm é uma escolha razoável para equipes pequenas que já conhecem Docker Compose, com clusters de poucas dezenas de nós e requisitos operacionais simples (staging, QA, ambientes internos). Ele não oferece autoscaling automático, RBAC granular, namespaces, nem service mesh: recursos que Kubernetes trata como parte do modelo central, não como extensões.

## Kubernetes (K3s)

Kubernetes declara o estado desejado em manifests YAML e reconcilia continuamente o cluster para esse estado, com conceitos que Compose e Swarm não têm: namespaces, RBAC granular, ingress controllers plugáveis e um driver CSI para armazenamento.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx
```

Kubernetes vale o investimento quando o cluster precisa crescer sem redesenho, quando automação (HPA, rollouts progressivos) e multi-tenancy são requisitos reais, ou quando o ambiente já se integra ao ecossistema cloud native (Prometheus, Grafana, Argo CD, cert-manager). K3s reduz especificamente o custo de operar Kubernetes em ambientes pequenos, sem abrir mão dessas capacidades.

## Trajetória típica

A progressão mais comum começa em Compose para desenvolvimento local, passa por um cluster pequeno (Swarm ou já Kubernetes) para os primeiros testes multi-host, e termina em Kubernetes de produção, self-hosted (K3s) ou gerenciado (EKS, GKE, AKS) conforme a escala exigir. Muitas equipes pulam Swarm inteiramente e vão direto de Compose para K3s: como o mercado de trabalho e o ecossistema de ferramentas giram em torno de Kubernetes, o tempo investido em aprendê-lo tende a ter retorno mais direto do que aprender Swarm primeiro.

## Recomendação

Para quem está começando agora, K3s costuma valer mais o investimento educacional do que Swarm, mesmo em um projeto pequeno, porque o conhecimento se transfere diretamente para qualquer cluster de produção depois. Para um projeto pessoal ou laboratório sem pretensão de produção, Compose ou Swarm continuam sendo escolhas razoáveis conforme a preferência. Para produção, Kubernetes (K3s ou uma oferta gerenciada) é o piso recomendado.

## Referências

- [Docker Compose: documentação oficial](https://docs.docker.com/compose/): guia oficial.
- [Docker Swarm: documentação oficial](https://docs.docker.com/engine/swarm/): guia oficial.
- [Kubernetes: documentação oficial](https://kubernetes.io/docs/): guia oficial.
- [K3s: documentação oficial](https://docs.k3s.io/): guia oficial do K3s.
