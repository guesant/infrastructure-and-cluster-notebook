---
title: Containers (Docker)
sidebar:
  order: 10
---

## Listar containers

```bash
# Apenas rodando
docker ps

# Todos (inclusive parados)
docker ps -a

# Últimos N
docker ps -n 5

# Com tamanho
docker ps -s
```yaml

**Quando usar:** verificar que container está rodando, encontrar parado.

**Considerações:**

- `ps`: mostra containers.
- `ps -a`: inclui exited.
- `STATUS`: Up, Exited, Paused.

**Relacionado:**

- [Ver logs de container](#ver-logs-de-um-container)
- [Executar comando em container](#executar-comando-em-um-container)

---

## Ver logs de um container

```bash
# Últimos logs
docker logs <container>

# Últimas 100 linhas
docker logs --tail 100 <container>

# Follow (tail -f)
docker logs -f <container>

# Com timestamps
docker logs -t <container>
```yaml

**Quando usar:** debugar aplicação, ver erros.

**Considerações:**

- `-f`: follow (live tail).
- `-t`: mostrar timestamps.
- `--tail N`: últimas N linhas.

**Relacionado:**

- [Listar containers](#listar-containers)
- [Executar comando](#executar-comando-em-um-container)

---

## Executar comando em um container

```bash
# Shell interativo
docker exec -it <container> /bin/bash

# Comando único
docker exec <container> env

# Como usuário específico
docker exec -u www-data <container> whoami
```yaml

**Quando usar:** debugar dentro do container, inspecionar estado.

**Considerações:**

- `-it`: interactive + TTY (necessário para shell).
- Container precisa estar rodando.
- `/bin/sh` é mais portável que `/bin/bash` (alpine, etc).

**Relacionado:**

- [Ver logs](#ver-logs-de-um-container)

---

## Inspecionar container

```bash
# Detalhes completos (JSON)
docker inspect <container>

# Só IP
docker inspect --format='{{.NetworkSettings.IPAddress}}' <container>

# Variáveis de ambiente
docker inspect --format='{{json .Config.Env}}' <container> | jq .
```yaml

**Quando usar:** descobrir configuração, rede, volumes.

**Considerações:**

- `inspect`: retorna JSON.
- `--format`: filtrar campos específicos.
- Útil para automação.

**Relacionado:**

- [Listar containers](#listar-containers)

---

## Listar imagens

```bash
# Todas as imagens
docker images

# Com tamanho
docker images --digests

# Dangling images (sem tag)
docker images -f dangling=true
```yaml

**Quando usar:** verificar que imagens estão disponíveis, limpeza.

**Considerações:**

- `REPOSITORY:TAG`: nome completo.
- `SIZE`: tamanho descompactado.
- Imagens dangling são intermediárias não tagueadas.

**Relacionado:**

- [Remover imagem](#remover-imagem)

---

## Remover container/imagem

```bash
# Parar e remover container
docker stop <container>
docker rm <container>

# Ou em um comando
docker rm -f <container>

# Remover imagem
docker rmi <image>

# Remover imagens dangling
docker image prune
```yaml

**Quando usar:** limpeza, liberar espaço, remover falhas.

**Considerações:**

- `-f`: force (mata container se rodando).
- `image prune`: limpa imagens não usadas.
- `container prune`: limpa containers parados.

**Relacionado:**

- [Listar containers](#listar-containers)
- [Listar imagens](#listar-imagens)

---

## Build de imagem

```bash
# Build simples
docker build -t myapp:1.0 .

# Com Dockerfile customizado
docker build -f Dockerfile.dev -t myapp:dev .

# Com argumentos
docker build --build-arg VERSION=1.0 -t myapp:1.0 .
```yaml

**Quando usar:** criar imagem customizada.

**Considerações:**

- `.`: context (diretório com Dockerfile).
- `-t`: tag.
- `-f`: Dockerfile alternativo.
- Build layers são cacheadas (melhorar se mudar deps antes de code).

**Relacionado:**

- [Listar imagens](#listar-imagens)
- [Push de imagem](#push-para-registry)

---

## Push para registry

```bash
# Fazer login (uma vez)
docker login

# Tag com registry
docker tag myapp:1.0 myregistry/myapp:1.0

# Push
docker push myregistry/myapp:1.0

# Logout
docker logout
```yaml

**Quando usar:** subir imagem para registry (Docker Hub, ECR, etc).

**Considerações:**

- `docker login`: salva credenciais em `~/.docker/config.json`.
- Tag deve incluir registry.
- Credentials sensíveis (use access tokens, não senha).

**Relacionado:**

- [Build de imagem](#build-de-imagem)
