---
title: Acessar o Argo CD
description: Como obter a senha inicial do Argo CD via port-forward, trocá-la pela CLI e remover o secret administrativo temporário antes de qualquer outro uso.
sidebar:
  order: 3
---

> **Pré-requisitos:** [Argo CD instalado](../install-argocd/), `KUBECONFIG` válido.
> **Versões testadas:** Argo CD (chart 10.1.3).

O chart usado na instalação não expõe o Argo CD publicamente nem cria um Ingress: o primeiro acesso é sempre por `port-forward`, e a senha inicial precisa ser trocada antes de qualquer outro uso. Esta página cobre esse primeiro acesso; publicar o Argo CD por um `HTTPRoute` é uma decisão separada, tratada em [Gateway API e Traefik](../../networking/configure-traefik-gateway-api/).

## Encaminhar o servidor localmente

> **Executar em:** estação administrativa com `KUBECONFIG` e acesso à API.

```bash
read -r -p "Porta local para o Argo CD [8080]: " LOCAL_PORT
LOCAL_PORT="${LOCAL_PORT:-8080}"

kubectl --namespace argocd \
  port-forward service/argocd-server "${LOCAL_PORT}:443"
```

Acesse `https://127.0.0.1:PORTA_LOCAL`, substituindo `PORTA_LOCAL` pelo valor informado. O certificado inicial é autoassinado; o aviso do navegador é esperado nesta etapa.

## Obter a senha inicial

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace argocd \
  get secret argocd-initial-admin-secret \
  --output jsonpath='{.data.password}' \
  | base64 --decode
printf '\n'
```

## Trocar a senha inicial

Com a CLI do Argo CD instalada e o `port-forward` da seção anterior ativo em outro terminal:

> **Executar em:** estação administrativa com a CLI e o port-forward ativos.

```bash
read -r -p "Porta local usada pelo port-forward do Argo CD [8080]: " LOCAL_PORT
LOCAL_PORT="${LOCAL_PORT:-8080}"

argocd login "127.0.0.1:${LOCAL_PORT}" --username admin --insecure
argocd account update-password
```

Depois de trocar a senha, remova o secret inicial:

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
kubectl --namespace argocd delete secret argocd-initial-admin-secret
```

## Validação

> **Executar em:** estação administrativa com a CLI e o port-forward ativos.

```bash
argocd account get-user-info
```

Deve retornar o usuário `admin` autenticado com a nova senha. Se o login com a senha antiga ainda funcionar depois da troca, confirme que o secret inicial foi realmente removido e que não há uma segunda sessão de CLI usando um token antigo.

## Troubleshooting

Um `argocd login` que falha com erro de certificado sem `--insecure` é esperado nesta etapa: o Argo CD ainda usa o certificado autoassinado padrão. Trate a emissão de um certificado confiável como parte da publicação pública (via cert-manager), não do primeiro acesso administrativo.

## Rollback

Não aplicável. Se a senha for perdida, gere uma nova a partir de uma conta com acesso `kubectl` ao namespace `argocd` reiniciando o processo de senha inicial: siga a [documentação oficial de recuperação de senha do admin](https://argo-cd.readthedocs.io/en/stable/faq/#i-forgot-the-admin-password-how-do-i-reset-it).

## Próximo passo

[Estruturar o repositório GitOps](../structure-gitops-repository/).

## Fontes e leitura adicional

- [Argo CD: Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/): fluxo oficial de instalação, acesso inicial e criação de uma aplicação.
- [Argo CD: Gestão de usuários](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/): orienta sobre a conta `admin`, usuários locais e integração com provedores de identidade.
