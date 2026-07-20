---
title: Implantação de aplicações
sidebar:
  order: 6
---

> **Para quem é:** operadores deployando serviços em Swarm.

Um **service** é o primitivo de orquestração em Swarm: a declaração de quantas réplicas de uma
imagem rodar e em quais condições, que o Swarm mantém satisfeita reagendando tarefas sempre que a
realidade diverge dela.

## Criar um service

```bash
docker service create \
  --replicas 3 \
  --name web \
  --publish 80:8080 \
  --network mynet \
  nginx:latest
```

Verifica:

```bash
docker service ls
docker service ps web  # listar tasks (instâncias) do service
```

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
```

Swarm mata a task se 3 health checks falharem.

## Placement constraints

Controla em quais hosts um service roda:

```bash
docker service create \
  --constraint node.labels.disktype==ssd \
  --name cache \
  redis:latest
```

Etiquetar um node:

```bash
docker node update --label-add disktype=ssd <node_id>
```

## Update strategy

Controla como réplicas são atualizadas:

```bash
docker service create \
  --update-parallelism 1 \
  --update-delay 10s \
  --update-failure-action pause \
  --name web \
  nginx:v2
```

- `update-parallelism`: quantos containers atualizar em paralelo (padrão: 1).
- `update-delay`: esperar entre atualizações.
- `update-failure-action`: `pause` (pausar se falhar) ou `continue` (continuar mesmo se falhar).

## Rolling update

```bash
docker service update --image nginx:v2 web
```

Swarm atualiza as réplicas uma por uma (ou conforme `update-parallelism`).

## Rollback

```bash
docker service rollback web
```

Esse comando reverte o service para a configuração anterior à última atualização, incluindo a
imagem. O processo completo de rolling update, monitoramento e rollback (manual ou automático via
`--rollback-parallelism`) está descrito em
[Atualizações e rollbacks](../updates-and-rollbacks/).

## Escala manual

```bash
docker service scale web=5
```

Esse comando ajusta o número de réplicas para 5, criando ou removendo tasks conforme necessário
para chegar nesse total. Não há autoscaling nativo em Swarm: qualquer mudança na contagem de
réplicas é uma decisão manual do operador ou de uma automação externa que chame este comando.

## Remover um service

```bash
docker service remove web
```

**Atenção:** este comando é destrutivo e imediato. Ele encerra todas as tasks (containers) do
service sem período de espera nem confirmação, e a definição do service (réplicas, constraints,
secrets associados) é perdida junto, não apenas os containers em execução. Volumes locais
associados às tasks removidas não são apagados automaticamente pelo Docker, mas os dados deixam
de estar acessíveis por meio do service.

## Referências

- [Services in Swarm](https://docs.docker.com/engine/swarm/services/): criar e gerenciar services.
- [Rolling updates](https://docs.docker.com/engine/swarm/swarm-tutorial/rolling-update/): tutorial oficial.
