set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

compose_file := ".container/compose.yml"

default:
    @just --list

# Roda o compose com detecção de runtime: podman, docker ou sudo docker
# (mesma ordem de preferência do ./jail-exec.sh).
_compose *args:
    if command -v podman >/dev/null 2>&1; then \
        podman compose --file {{compose_file}} {{args}}; \
    elif docker info >/dev/null 2>&1; then \
        docker compose --file {{compose_file}} {{args}}; \
    else \
        echo "Aviso: sem acesso ao socket do Docker; tentando com sudo." >&2; \
        sudo docker compose --file {{compose_file}} {{args}}; \
    fi

# Sobe o serviço de desenvolvimento do compose em segundo plano
# (porta 4321 publicada em 127.0.0.1).
up:
    just _compose up --detach app

# Para e remove o contêiner do compose.
down:
    just _compose down

# Abre um shell interativo no serviço de desenvolvimento (sobe antes, se preciso).
shell: up
    just _compose exec app bash

# Sobe o servidor de dev do Astro: roda direto (bare) se já estivermos dentro
# de um contêiner (ex.: devcontainer, CI); caso contrário, via `compose exec`
# no serviço persistente (subindo-o primeiro, se preciso).
start:
    if [[ -n "${container:-}" || -f /.dockerenv || -f /run/.containerenv ]]; then \
        test -d node_modules || bun install; \
        bun run dev -- --host 0.0.0.0; \
    else \
        just up; \
        just _compose exec app bash -lc 'test -d node_modules || bun install; bun run dev -- --host 0.0.0.0'; \
    fi
