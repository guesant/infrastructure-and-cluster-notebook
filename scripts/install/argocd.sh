#!/usr/bin/env bash

set -euo pipefail

CHANNEL="stable" # stable | latest

ARCH="$(uname -m)"

case "$ARCH" in
    x86_64)
        ARGOCD_ARCH="amd64"
        ;;
    aarch64|arm64)
        ARGOCD_ARCH="arm64"
        ;;
    *)
        echo "Arquitetura não suportada: $ARCH"
        exit 1
        ;;
esac

case "$CHANNEL" in
    stable)
        VERSION="$(curl -fsSL https://raw.githubusercontent.com/argoproj/argo-cd/stable/VERSION)"
        VERSION="v${VERSION}"
        ;;
    latest)
        VERSION="$(curl -fsSL https://api.github.com/repos/argoproj/argo-cd/releases/latest | sed -n 's/.*"tag_name": "\(v[^"]*\)".*/\1/p')"
        ;;
    *)
        echo "CHANNEL inválido: ${CHANNEL}"
        exit 1
        ;;
esac

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "==> Instalando Argo CD CLI ${VERSION} (${ARGOCD_ARCH})..."

curl -fsSLo "${TMP_DIR}/argocd" \
    "https://github.com/argoproj/argo-cd/releases/download/${VERSION}/argocd-linux-${ARGOCD_ARCH}"

sudo install -o root -g root -m 0555 \
    "${TMP_DIR}/argocd" \
    /usr/local/bin/argocd

echo
argocd version --client
echo

echo "==> Argo CD CLI instalado com sucesso."
