---
title: Implantação de aplicações
sidebar:
  order: 6
---

> **Para quem é:** operadores deployando serviços em Swarm.

Um **service** é o primitivo de orquestração em Swarm — descreve quantas réplicas rodar e em quais hosts.

## Criar um service

```bash
docker service create \
  --replicas 3 \
  --name web \
  --publish 80:8080 \
  --network mynet \
  nginx:latest
```yaml

Verifica:

```bash
docker service ls
docker service ps web  # listar tasks (instâncias) do service
```yaml

## Health checks

Swarm reinicia tasks que falham. Um health check básico:

```bash
docker service create \
  --name api \
  --health-cmd="curl http://localhost:8000/health" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  myapi:latest
```yaml

Swarm mata a task se 3 health checks falharem.

## Placement constraints

Controla em quais hosts um service roda:

```bash
docker service create \
  --constraint node.labels.disktype==ssd \
  --name cache \
  redis:latest
```yaml

Etiquetar um node:

```bash
docker node update --label-add disktype=ssd <node_id>
```yaml

## Update strategy

Controla como réplicas são atualizadas:

```bash
docker service create \
  --update-parallelism 1 \
  --update-delay 10s \
  --update-failure-action pause \
  --name web \
  nginx:v2
```yaml

- `update-parallelism`: quantos containers atualizar em paralelo (padrão: 1).
- `update-delay`: esperar entre atualizações.
- `update-failure-action`: `pause` (pausar se falhar) ou `continue` (continuar mesmo se falhar).

## Rolling update

```bash
docker service update --image nginx:v2 web
```yaml

Swarm atualiza as réplicas uma por uma (ou conforme `update-parallelism`).

## Rollback

Se a atualização falhar:

```bash
docker service rollback web
```yaml

Ou configure rollback automático:

```bash
docker service create \
  --rollback-parallelism 2 \
  --rollback-delay 5s \
  --name web \
  nginx:latest
```yaml

## Escala manual

```bash
docker service scale web=5
# Aumentar para 5 réplicas
```yaml

Não há autoscaling nativo em Swarm.

## Remover um service

```bash
docker service remove web
```yaml

Mata todas as tasks do serviço.

## Referências

- [Services in Swarm](https://docs.docker.com/engine/swarm/services/): criar e gerenciar services.
- [Rolling updates](https://docs.docker.com/engine/swarm/swarm-tutorial/rolling-update/): tutorial oficial.
