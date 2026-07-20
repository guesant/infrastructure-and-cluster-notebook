---
title: Configurar credenciais de aplicação para PostgreSQL
description: Como criar um banco de dados e um usuário dedicados por aplicação no CloudNativePG, em vez de reutilizar a credencial administrativa do superusuário.
sidebar:
  order: 3
---

> **Pré-requisitos:** [cluster PostgreSQL criado](../create-postgresql-cluster/).
> **Versões testadas:** CloudNativePG 1.30.

O CloudNativePG cria automaticamente um Secret com a credencial do superusuário (`postgres`), mas uma aplicação não deveria usar essa credencial administrativa. Esta página cobre a criação de um banco e um usuário dedicados por aplicação.

## Criar um banco de dados declarativo

O CloudNativePG suporta um recurso `Database` para provisionar bancos sem executar SQL manualmente:

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -p "Namespace do cluster: " PG_NAMESPACE
read -r -p "Nome do cluster: " PG_CLUSTER_NAME
read -r -p "Nome do banco de dados da aplicação: " APP_DATABASE_NAME
read -r -p "Nome do usuário da aplicação: " APP_DATABASE_USER

kubectl apply -f - <<EOF
apiVersion: postgresql.cnpg.io/v1
kind: Database
metadata:
  name: ${APP_DATABASE_NAME}
  namespace: ${PG_NAMESPACE}
spec:
  cluster:
    name: ${PG_CLUSTER_NAME}
  name: ${APP_DATABASE_NAME}
  owner: ${APP_DATABASE_USER}
EOF
```

## Criar a credencial do usuário da aplicação

O CloudNativePG gera automaticamente um Secret com usuário e senha quando declarado via `managed.roles`:

```bash
kubectl --namespace "${PG_NAMESPACE}" patch cluster "${PG_CLUSTER_NAME}" --type=merge --patch "
spec:
  managed:
    roles:
      - name: ${APP_DATABASE_USER}
        ensure: present
        login: true
        passwordSecret:
          name: ${APP_DATABASE_USER}-credentials
"
```

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace "${PG_NAMESPACE}" get database "${APP_DATABASE_NAME}"
kubectl --namespace "${PG_NAMESPACE}" get secret "${APP_DATABASE_USER}-credentials"
```

O banco e o Secret devem existir. Não imprima o conteúdo do Secret no terminal para validação; referencie-o diretamente no manifesto da aplicação via `envFrom` ou `secretKeyRef`.

## Troubleshooting

Se o `Database` ficar sem sincronizar, confirme que o `owner` referenciado já existe como role (crie o role primeiro via `managed.roles`, depois o `Database`, se a ordem de criação causar erro).

## Rollback

```bash
kubectl --namespace "${PG_NAMESPACE}" delete database "${APP_DATABASE_NAME}"
```

Remover o `Database` não reverte a criação do role automaticamente; remova-o separadamente do `spec.managed.roles` do `Cluster` se necessário.

## Próximo passo

[Configurar backups do PostgreSQL](../configure-postgresql-backups/).

## Fontes e leitura adicional

- [CloudNativePG: Declarative database management](https://cloudnative-pg.io/documentation/current/declarative_database_management/): referência oficial do recurso `Database`.
- [CloudNativePG: Managed roles](https://cloudnative-pg.io/documentation/current/declarative_role_management/): documenta a criação declarativa de roles e credenciais.
