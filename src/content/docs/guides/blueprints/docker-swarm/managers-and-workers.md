---
title: Managers e workers
sidebar:
  order: 2
---

> **Para quem é:** operadores iniciando um cluster Swarm ou adicionando nós.

## Passo 1: Inicializar o primeiro manager

No primeiro nó (será o manager líder):

```bash
docker swarm init --advertise-addr <IP_DO_MANAGER>
```yaml

Salve a saída — inclui o comando para adicionar workers e managers:

```yaml
docker swarm join --token <WORKER_TOKEN> <IP>:<PORT>
docker swarm join-token manager  # para pegar token de manager depois
```yaml

Verifique que Swarm foi iniciado:

```bash
docker info | grep Swarm
# Swarm: active
```yaml

## Passo 2: Adicionar managers adicionais (para quorum)

Em cada manager adicional:

```bash
# Obtenha o token do nó atual
docker swarm join-token manager

# No novo manager, execute:
docker swarm join --token <MANAGER_TOKEN> <IP>:<PORT>
```yaml

Verifique quorum:

```bash
docker node ls
# Deve listar todos os managers (STATUS reachable) e o líder (LEADER)
```yaml

## Passo 3: Adicionar workers

Em cada máquina worker:

```bash
docker swarm join --token <WORKER_TOKEN> <IP>:<PORT>
```yaml

Verifique:

```bash
docker node ls
# Workers aparecem com role "worker"
```yaml

## Promover/Rebaixar um nó

Promover worker para manager (cuidado: aumenta critério de quorum):

```bash
docker node promote <node_id>
```yaml

Rebaixar manager para worker:

```bash
docker node demote <node_id>
```yaml

## Remover um nó

Do nó a ser removido:

```bash
docker swarm leave
```yaml

Do manager, remover o nó:

```bash
docker node rm <node_id>
```yaml

Se o nó não responder (offline), force:

```bash
docker node rm --force <node_id>
```yaml

## Checklist de pós-instalação

```yaml
☐ Todos os managers passam em `docker node ls` com status reachable
☐ Quorum alcançável (número ímpar de managers: 3 ou 5)
☐ Workers conseguem se comunicar com overlay network
☐ Firewall entre managers permite porta 2377 (consenso)
☐ Firewall entre nós permite porta 7946 (gossip) e 4789 (overlay)
```yaml

## Referências

- [Swarm join-token](https://docs.docker.com/engine/reference/commandline/swarm_join-token/): recuperar tokens de entrada.
- [Node ls reference](https://docs.docker.com/engine/reference/commandline/node_ls/): listar nós e status.
