---
title: Rede e discovery
sidebar:
  order: 3
---

> **Para quem é:** operadores entendendo como containers comunicam em um cluster Swarm.

## Rede overlay

A rede overlay conecta containers entre hosts diferentes como se estivessem na mesma rede local,
encapsulando o tráfego real em VXLAN (UDP 4789) para atravessar a rede física:

```bash
# Criar rede overlay
docker network create --driver overlay <nome>

# Conectar service à rede
docker service create --network <nome> --name <service> <imagem>
```

Dentro dessa rede, o nome do service funciona como um hostname resolvível: containers no mesmo
service convertem esse nome em um VIP (Virtual IP) por meio do DNS interno do Swarm, e cada
container enxerga os demais chamando diretamente `curl http://service-name`, sem precisar saber
em qual host físico cada réplica está rodando.

## Ingress routing mesh

O ingress routing mesh publica portas diretamente nos hosts:

```bash
docker service create --publish 80:8080 --name web nginx
```

Com essa publicação, qualquer host do cluster (não só os que executam o container `web`) responde
na porta 80 e roteia a requisição internamente até um container que a atenda. Isso simplifica a
configuração de um load balancer externo, que pode apontar para qualquer host do cluster
indistintamente, mas tem uma desvantagem: não há como controlar exatamente qual host expõe a
porta, já que todos expõem por padrão.

## Host mode (bypass mesh)

Quando esse controle fino é necessário, o modo host contorna o ingress routing mesh:

```bash
docker service create \
  --publish mode=host,target=8080,published=8080 \
  --name <service> <imagem>
```

Nesse modo, apenas os hosts que efetivamente executam o container expõem a porta; os demais não
respondem nela. É útil para componentes que não escalam bem atrás de um balanceamento
transparente, como serviços com estado que precisam de afinidade de conexão a um host específico.

## DNS interno

Os nomes de service são resolvidos automaticamente dentro da rede overlay:

```bash
# Dentro de um container:
ping <service_name>
# Retorna o VIP (IP virtual), não um IP de container específico

curl http://outro_service:8000
# DNS resolve para o VIP; o balanceamento entre réplicas acontece nesse ponto
```

Essa resolução só funciona para services conectados à mesma rede overlay; um service fora dela
não é alcançável por nome, e a rede overlay é o único mecanismo de descoberta disponível nesse
caso.

## Troubleshooting

Verificar conectividade:

```bash
docker service ls
docker service ps <service>  # qual host rodas as tasks

# Dentro de um container:
docker exec <container_id> nslookup <service_name>
docker exec <container_id> ping <service_name>
```

Se a rede overlay não funciona, verificar:

```bash
docker network inspect <overlay_name>
# Todos os hosts devem estar conectados
```

## Referências

- [Overlay networks in Swarm](https://docs.docker.com/engine/swarm/networking/): desenho de rede.
- [Ingress load balancing](https://docs.docker.com/engine/swarm/ingress/): roteamento de portas publicadas.
