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
```

A saída desse comando inclui o token e o comando prontos para adicionar workers ao cluster;
salve-a, porque o token não é reimpresso automaticamente depois. Se precisar dele mais tarde,
recupere-o com `docker swarm join-token worker` (ou `manager`, para o token de manager) em
qualquer manager já ativo.

Verifique que Swarm foi iniciado:

```bash
docker info | grep Swarm
# Swarm: active
```

## Passo 2: Adicionar managers adicionais (para quorum)

Em cada manager adicional:

```bash
# Obtenha o token do nó atual
docker swarm join-token manager

# No novo manager, execute:
docker swarm join --token <MANAGER_TOKEN> <IP>:<PORT>
```

Verifique quorum:

```bash
docker node ls
# Deve listar todos os managers (STATUS reachable) e o líder (LEADER)
```

## Passo 3: Adicionar workers

Em cada máquina worker:

```bash
docker swarm join --token <WORKER_TOKEN> <IP>:<PORT>
```

Verifique:

```bash
docker node ls
# Workers aparecem com role "worker"
```

## Promover ou rebaixar um nó

```bash
docker node promote <node_id>
```

Promover um worker para manager o inclui no consenso Raft, o que muda o número total de managers
e, portanto, o critério de quorum do cluster: promover um segundo manager para um cluster que
tinha apenas um, por exemplo, faz o cluster passar a exigir os dois managers ativos para continuar
operando, já que dois é o total e nenhum deles sozinho forma maioria. Planeje promoções tendo em
mente o número ímpar recomendado (3 ou 5), não promova nós isoladamente sem considerar o efeito
no quorum resultante.

```bash
docker node demote <node_id>
```

Rebaixar um manager para worker tem o efeito oposto: ele sai do consenso Raft e passa a apenas
executar tarefas.

## Remover um nó

No nó a ser removido, saia do cluster:

```bash
docker swarm leave
```

Em seguida, em um manager, remova o registro desse nó:

```bash
docker node rm <node_id>
```

Se o nó estiver offline e não puder executar `docker swarm leave` (hardware perdido, por
exemplo), force a remoção a partir do manager:

```bash
docker node rm --force <node_id>
```

**Atenção:** `--force` remove o registro do nó sem confirmar que ele realmente saiu do cluster.
Se o nó removido à força na verdade ainda estiver ativo na rede (por exemplo, após uma partição
de rede temporária), ele pode continuar acreditando que faz parte do cluster e gerar um estado
inconsistente. Use `--force` apenas quando tiver certeza de que o nó está definitivamente fora de
operação, não apenas temporariamente inalcançável.

## Checklist de pós-instalação

- [ ] Todos os managers passam em `docker node ls` com status `Reachable`.
- [ ] O quorum é alcançável: número ímpar de managers (3 ou 5) ativos.
- [ ] Os workers conseguem se comunicar pela rede overlay.
- [ ] O firewall entre managers permite a porta 2377 (consenso).
- [ ] O firewall entre todos os nós permite as portas 7946 (gossip) e 4789 (overlay).

## Referências

- [Swarm join-token](https://docs.docker.com/engine/reference/commandline/swarm_join-token/): recuperar tokens de entrada.
- [Node ls reference](https://docs.docker.com/engine/reference/commandline/node_ls/): listar nós e status.
