#!/usr/bin/env bash
# Command runner do projeto: executa o comando informado dentro de um contêiner
# seguindo as regras (menor privilégio, imagem fixada, sem rede
# quando possível). Idempotente: dentro de um contêiner roda o comando
# diretamente. O modo de execução é detectado (bare/podman/docker) ou forçado
# via JAIL_MODE.
#
# Seguro por padrão: sem rede, sem capabilities, rootfs somente leitura e
# limites de recursos. Rede é opt-in.
#
# Uso:
#   JAIL_NETWORK=1 ./jail-exec.sh npm install
#   ./jail-exec.sh npm run build
#   JAIL_PUBLISH=4321 ./jail-exec.sh npm run dev -- --host 0.0.0.0
#   JAIL_MODE=docker ./jail-exec.sh npm run lint
#   ALLOW_RUN_COMMANDS_IN_HOST=1 ./jail-exec.sh npm run lint
#
# Variáveis:
#   JAIL_MODE     auto (padrão) | bare | podman | docker | bwrap — força o modo
#   JAIL_IMAGE    imagem a usar em podman/docker (padrão: node:22.17.0-bookworm-slim)
#   JAIL_NETWORK  vazio/none = sem rede (padrão); qualquer outro valor habilita
#   JAIL_PUBLISH  porta publicada em 127.0.0.1 (ex.: 4321); implica rede
#   ALLOW_RUN_COMMANDS_IN_HOST  não vazio = atalho para JAIL_MODE=bare
#
# Modo bwrap: sandbox de user namespaces (Bubblewrap) usando os binários do
# host — sem daemon, sem sudo e sem imagem. O comando precisa existir no host
# e a versão não é fixada; com JAIL_PUBLISH a rede do host é compartilhada e a
# porta já fica acessível localmente sem publicação.

set -euo pipefail

IMAGE="${JAIL_IMAGE:-docker.io/library/node:22.17.0-bookworm-slim}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ $# -eq 0 ]]; then
  printf 'Uso: %s COMANDO [ARGS...]\n' "$0" >&2
  exit 2
fi

in_container() {
  [[ -n "${container:-}" ]] || [[ -f /.dockerenv ]] || [[ -f /run/.containerenv ]]
}

mode="${JAIL_MODE:-auto}"
if [[ -n "${ALLOW_RUN_COMMANDS_IN_HOST:-}" ]]; then
  mode="bare"
fi

if [[ "$mode" == "auto" ]]; then
  if in_container; then
    mode="bare"
  elif command -v podman >/dev/null 2>&1; then
    mode="podman"
  elif command -v docker >/dev/null 2>&1; then
    mode="docker"
  elif command -v bwrap >/dev/null 2>&1; then
    mode="bwrap"
  else
    printf 'Erro: podman, docker e bwrap não encontrados. Use JAIL_MODE=bare (ou ALLOW_RUN_COMMANDS_IN_HOST=1) para executar no host.\n' >&2
    exit 1
  fi
fi

case "$mode" in
  bare)
    exec "$@"
    ;;
  podman | docker | bwrap)
    if ! command -v "$mode" >/dev/null 2>&1; then
      printf 'Erro: JAIL_MODE=%s, mas o binário "%s" não foi encontrado.\n' "$mode" "$mode" >&2
      exit 1
    fi
    ;;
  *)
    printf 'Erro: JAIL_MODE inválido: "%s" (use auto, bare, podman, docker ou bwrap).\n' "$mode" >&2
    exit 2
    ;;
esac

network="${JAIL_NETWORK:-none}"
if [[ -n "${JAIL_PUBLISH:-}" ]]; then
  network="bridge"
fi

if [[ "$mode" == "bwrap" ]]; then
  bwrap_args=(
    --die-with-parent
    --new-session
    --unshare-all
    --ro-bind /usr /usr
    --proc /proc
    --dev /dev
    --tmpfs /tmp
    --bind "$SCRIPT_DIR" /workspace
    --chdir /workspace
    --clearenv
    --setenv HOME /tmp
    --setenv PATH /usr/local/bin:/usr/bin:/bin
    --setenv npm_config_cache /tmp/.npm
    --setenv TERM "${TERM:-xterm}"
  )
  for dir in /bin /lib /lib64 /sbin; do
    if [[ -L "$dir" ]]; then
      bwrap_args+=(--symlink "usr${dir}" "$dir")
    elif [[ -d "$dir" ]]; then
      bwrap_args+=(--ro-bind "$dir" "$dir")
    fi
  done
  if [[ -n "$network" && "$network" != "none" ]]; then
    bwrap_args+=(--share-net)
    [[ -e /etc/resolv.conf ]] && bwrap_args+=(--ro-bind /etc/resolv.conf /etc/resolv.conf)
    [[ -d /etc/ssl ]] && bwrap_args+=(--ro-bind /etc/ssl /etc/ssl)
  fi
  exec bwrap "${bwrap_args[@]}" "$@"
fi

run_args=(
  run --rm
  --cap-drop=ALL
  --security-opt=no-new-privileges
  --read-only
  --tmpfs /tmp:rw,nosuid,size=1024m
  --pids-limit=1024
  --memory=4g
  -e HOME=/tmp
  -e npm_config_cache=/tmp/.npm
  --workdir /workspace
)

if [[ -n "${JAIL_PUBLISH:-}" ]]; then
  run_args+=(-p "127.0.0.1:${JAIL_PUBLISH}:${JAIL_PUBLISH}")
fi
if [[ -z "$network" || "$network" == "none" ]]; then
  run_args+=(--network=none)
fi
if [[ -t 0 && -t 1 ]]; then
  run_args+=(-it)
fi

if [[ "$mode" == "podman" ]]; then
  exec podman "${run_args[@]}" \
    --userns=keep-id \
    --mount "type=bind,src=${SCRIPT_DIR},dst=/workspace" \
    "$IMAGE" "$@"
fi

docker_cmd=(docker)
if ! docker info >/dev/null 2>&1; then
  printf 'Aviso: sem acesso ao socket do Docker; tentando com sudo.\n' >&2
  docker_cmd=(sudo docker)
fi
exec "${docker_cmd[@]}" "${run_args[@]}" \
  --user "$(id -u):$(id -g)" \
  --mount "type=bind,src=${SCRIPT_DIR},dst=/workspace" \
  "$IMAGE" "$@"
