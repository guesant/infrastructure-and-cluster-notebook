---
title: Criar um ClusterIssuer ACME
description: Como configurar um ClusterIssuer do cert-manager com ACME e desafio DNS-01, incluindo a credencial do provedor DNS e a validação em staging antes de produção.
sidebar:
  order: 2
---

> **Pré-requisitos:** [cert-manager instalado](../install-cert-manager/), credencial de API do provedor DNS com permissão para criar/remover registros TXT na zona alvo.
> **Versões testadas:** cert-manager v1.21.0.

Um `ClusterIssuer` declara como o cert-manager deve emitir certificados para o cluster inteiro, em vez de um único namespace. Esta página usa ACME com desafio DNS-01, que permite emitir certificados wildcard e não exige que o serviço já esteja publicamente acessível: a validação acontece criando um registro DNS temporário, não recebendo uma requisição HTTP.

O exemplo usa Cloudflare como provedor DNS; o cert-manager suporta outros provedores nativamente ou por webhook. Ajuste `solvers` conforme o provedor real do ambiente.

## Guardar a credencial do provedor DNS

A credencial concede permissão de escrita na zona DNS e não deve ser versionada em texto claro:

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -s -p "Token de API do provedor DNS: " DNS_PROVIDER_TOKEN
printf '\n'

kubectl --namespace cert-manager create secret generic dns-provider-credentials \
  --from-literal=api-token="${DNS_PROVIDER_TOKEN}"
```

## Criar o ClusterIssuer

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -p "E-mail de contato ACME: " ACME_CONTACT_EMAIL

kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-dns01
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ${ACME_CONTACT_EMAIL}
    privateKeySecretRef:
      name: letsencrypt-dns01-account-key
    solvers:
      - dns01:
          cloudflare:
            apiTokenSecretRef:
              name: dns-provider-credentials
              key: api-token
EOF
```

Use o servidor de staging (`https://acme-staging-v02.api.letsencrypt.org/directory`) enquanto valida a configuração: o ambiente de produção do Let's Encrypt aplica limites de taxa por domínio que uma tentativa malsucedida repetida pode esgotar.

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl get clusterissuer letsencrypt-dns01
kubectl describe clusterissuer letsencrypt-dns01
```

`READY` deve ser `True`. Se não estiver, o `describe` mostra a condição e a mensagem de erro reportada pelo cert-manager, geralmente relacionada a credencial inválida ou zona DNS incorreta.

Para confirmar o fluxo completo, emita um certificado de teste referenciando este `ClusterIssuer` e remova-o depois de validar (veja [diagnosticar uma emissão](../install-cert-manager/#diagnosticar-uma-emissão)).

## Troubleshooting

Se o `Challenge` ficar preso em `pending`, confirme a propagação do registro TXT pelos resolvers configurados em `DNS01_RECURSIVE_NAMESERVERS` na instalação do cert-manager; um resolver desatualizado pode não enxergar o registro recém-criado antes do timeout padrão.

## Rollback

```bash
kubectl delete clusterissuer letsencrypt-dns01
kubectl --namespace cert-manager delete secret dns-provider-credentials
```

Remover o `ClusterIssuer` não revoga certificados já emitidos por ele; eles continuam válidos até o vencimento, mas deixam de ser renovados automaticamente.

## Próximo passo

Referencie este `ClusterIssuer` em um `Gateway` com listener TLS (veja [Gateway API e Traefik](../../networking/configure-traefik-gateway-api/)) para automatizar a emissão de certificados para os serviços publicados.

## Fontes e leitura adicional

- [Desafio ACME DNS-01](https://cert-manager.io/docs/configuration/acme/dns01/): referência oficial dos provedores suportados e da configuração do solver.
- [ACME Issuer](https://cert-manager.io/docs/configuration/acme/): explica `server`, `email`, `privateKeySecretRef` e o ciclo de vida da conta ACME.
- [Let's Encrypt: Rate Limits](https://letsencrypt.org/docs/rate-limits/): documenta os limites de emissão e a razão para validar no ambiente de staging primeiro.
