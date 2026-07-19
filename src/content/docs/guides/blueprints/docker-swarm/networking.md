---
title: Rede e discovery
sidebar:
  order: 3
---

> **Para quem é:** operadores entendendo como containers comunicam em um cluster Swarm.

## Rede Overlay

A rede overlay conecta containers entre hosts:

```bash
# Criar rede overlay
docker network create --driver overlay <nome>

# Conectar service à rede
docker service create --network <nome> --name <service> <imagem>
```yaml

Características:

- Containers no mesmo service convertem nomes em load balancing de DNS (VIP — Virtual IP).
- Cada container vê os demais pelo hostname do service (`curl http://service-name`).
- VXLAN encapsula tráfego entre hosts (UDP 4789).

## Ingress Routing Mesh

Publica ports direto:

```bash
docker service create --publish 80:8080 --name web nginx
```yaml

Efeito:

- Qualquer host responde na porta 80.
- Tráfego é roteado ao container (em qualquer host).

Desvantagem: não há forma de controlar exatamente qual host expõe a porta.

## Host Mode (bypass mesh)

Para operações que precisam de controle fino de rede:

```bash
docker service create \
  --publish mode=host,target=8080,published=8080 \
  --name <service> <imagem>
```yaml

Apenas hosts rodando o container expõem a porta. Útil para componentes que não escalam bem atrás de LB.

## DNS interno

Nomes de services são resolvidos automaticamente:

```bash
# Dentro de um container:
ping <service_name>
# Retorna o VIP (IP virtual), não um IP específico

curl http://outro_service:8000
# DNS resolve para VIP, balanceamento acontece automaticamente
```yaml

Services fora de uma rede overlay não comunicam diretamente — use a rede overlay.

## Troubleshooting

Verificar conectividade:

```bash
docker service ls
docker service ps <service>  # qual host rodas as tasks

# Dentro de um container:
docker exec <container_id> nslookup <service_name>
docker exec <container_id> ping <service_name>
```yaml

Se a rede overlay não funciona, verificar:

```bash
docker network inspect <overlay_name>
# Todos os hosts devem estar conectados
```yaml

## Referências

- [Overlay networks in Swarm](https://docs.docker.com/engine/swarm/networking/): desenho de rede.
- [Ingress load balancing](https://docs.docker.com/engine/swarm/ingress/): roteamento de portas publicadas.
