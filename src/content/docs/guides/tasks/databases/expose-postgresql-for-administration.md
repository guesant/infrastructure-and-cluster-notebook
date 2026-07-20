---
title: Expor o PostgreSQL para administração
description: Como acessar um cluster PostgreSQL do CloudNativePG temporariamente via port-forward para administração pontual, sem expor o banco permanentemente.
sidebar:
  order: 4
---

> **Pré-requisitos:** [cluster PostgreSQL criado](../create-postgresql-cluster/).
> **Versões testadas:** CloudNativePG 1.30.

Um cluster PostgreSQL do CloudNativePG não é exposto externamente por padrão: apenas Services internos ao cluster (`-rw` para leitura/escrita, `-ro` para leitura em réplicas, `-r` para qualquer instância). Esta página cobre o acesso administrativo temporário via port-forward, a forma recomendada para administração pontual sem expor o banco permanentemente.

## Port-forward para acesso administrativo

> **Executar em:** estação administrativa com `KUBECONFIG` e acesso à API.

```bash
read -r -p "Namespace do cluster: " PG_NAMESPACE
read -r -p "Nome do cluster: " PG_CLUSTER_NAME
read -r -p "Porta local [5432]: " LOCAL_PORT
LOCAL_PORT="${LOCAL_PORT:-5432}"

kubectl --namespace "${PG_NAMESPACE}" \
  port-forward "service/${PG_CLUSTER_NAME}-rw" "${LOCAL_PORT}:5432"
```

Enquanto o comando roda, conecte-se em `127.0.0.1:${LOCAL_PORT}` com qualquer cliente PostgreSQL; veja [acessar o PostgreSQL com um cliente gráfico](../access-postgresql-with-gui-client/).

## Obter a credencial do superusuário

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace "${PG_NAMESPACE}" get secret "${PG_CLUSTER_NAME}-superuser" \
  --output jsonpath='{.data.password}' | base64 --decode
printf '\n'
```

Use a credencial de superusuário apenas para administração; aplicações devem usar a credencial dedicada de [configurar credenciais de aplicação](../configure-application-credentials/).

## Publicação permanente (não recomendada por padrão)

Se um cliente externo precisar de acesso contínuo, não apenas administrativo pontual, avalie os riscos antes de publicar o banco diretamente. O padrão de `HTTPRoute` com TLS terminado no Gateway não se aplica aqui: é uma solução para tráfego HTTP, e o PostgreSQL fala um protocolo próprio. Uma publicação permanente exigiria um `Gateway` com listener TCP dedicado ou uma solução de tunelamento, ambas fora do escopo desta página.

## Validação

```bash
psql "postgresql://postgres@127.0.0.1:${LOCAL_PORT}/postgres" -c 'SELECT 1;'
```

Deve retornar `1` sem erro de conexão.

## Troubleshooting

Se a conexão falhar com `password authentication failed`, confirme que está usando a credencial do Secret correspondente ao cluster e usuário corretos: cada cluster tem um Secret de superusuário próprio.

## Rollback

Encerrar o `port-forward` (Ctrl+C) remove o único caminho de acesso externo criado por este procedimento; nenhum estado adicional precisa ser desfeito.

## Próximo passo

[Configurar backups do PostgreSQL](../configure-postgresql-backups/).

## Fontes e leitura adicional

- [CloudNativePG: Service management](https://cloudnative-pg.io/documentation/current/service_management/): documenta os Services `-rw`, `-ro` e `-r` criados automaticamente.
