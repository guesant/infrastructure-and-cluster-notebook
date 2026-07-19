---
title: Docker Compose snippets
sidebar:
  order: 2
---

## Serviço básico

```yaml
services:
  app:
    image: nginx:latest
    ports:
      - "8080:80"
    environment:
      ENV_VAR: "value"
    restart: unless-stopped
```yaml

Serviço com porta publicada, env var, restart policy.

---

## Com volume

```yaml
services:
  app:
    image: myapp
    volumes:
      - ./data:/app/data          # bind mount
      - app_cache:/app/cache      # named volume
    volumes:
      app_cache:
```yaml

Bind mount (diretório host) e named volume (gerenciado pelo Docker).

---

## Com rede customizada

```yaml
services:
  web:
    image: nginx
    networks:
      - backend
  
  api:
    image: myapi
    networks:
      - backend

networks:
  backend:
    driver: bridge
```yaml

Services em rede customizada podem se comunicar pelo nome.

---

## Com healthcheck

```yaml
services:
  api:
    image: myapi:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```yaml

Container reinicia se health check falhar 3 vezes.

---

## Com depends_on

```yaml
services:
  web:
    image: nginx
    depends_on:
      - api
  
  api:
    image: myapi
    depends_on:
      - db
  
  db:
    image: postgres
```yaml

Define ordem de startup (web depende de api, que depende de db).

---

## Variáveis de ambiente

```yaml
services:
  app:
    image: myapp
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DEBUG=${DEBUG:-false}
    env_file: .env
```yaml

Environment inline, com defaults, ou desde arquivo `.env`.

---

## Build local

```yaml
services:
  myapp:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VERSION: 1.0
    image: myapp:latest
```yaml

Build imagem local em vez de pull.

---

## Override para dev

```yaml
# docker-compose.yml
services:
  app:
    image: myapp:prod
    restart: always

# docker-compose.override.yml (automático em dev)
services:
  app:
    build: .
    restart: no
    volumes:
      - .:/app
```yaml

Override automático em dev (volumes, rebuild, etc).
