---
title: Acessar o PostgreSQL com um cliente gráfico
sidebar:
  order: 7
---

> **Pré-requisitos:** [PostgreSQL exposto para administração](../expose-postgresql-for-administration/) via port-forward.
> **Versões testadas:** CloudNativePG 1.30, PostgreSQL 17.

Com o port-forward de [expor o PostgreSQL para administração](../expose-postgresql-for-administration/) ativo, qualquer cliente gráfico PostgreSQL pode se conectar em `127.0.0.1` na porta encaminhada. Esta página lista a string de conexão comum e ressalvas específicas de alguns clientes populares.

## Dados de conexão

| Campo | Valor |
| --- | --- |
| Host | `127.0.0.1` |
| Porta | a porta local escolhida no port-forward (padrão `5432`) |
| Usuário | `postgres` (administrativo) ou o usuário de aplicação |
| Senha | obtida do Secret correspondente (veja [expor o PostgreSQL](../expose-postgresql-for-administration/)) |
| Banco de dados | `postgres` ou o banco criado em [configurar credenciais de aplicação](../configure-application-credentials/) |
| SSL/TLS | `prefer` ou `require`, conforme configuração do cluster |

## DBeaver, DataGrip, HeidiSQL, pgAdmin, Beekeeper Studio

Todos aceitam os mesmos dados de conexão acima em um driver "PostgreSQL". Nenhuma configuração adicional é necessária além do host/porta apontarem para o `port-forward` ativo — mantenha o comando de port-forward rodando durante toda a sessão do cliente.

Ressalvas específicas:

- **DBeaver/DataGrip**: se o SSL mode padrão do driver for `verify-full`, a conexão pode falhar contra o certificado interno do cluster; use `prefer` para administração local via port-forward.
- **pgAdmin**: ao rodar como container, use `host.docker.internal` (ou o IP do host, em Linux) em vez de `127.0.0.1`, que dentro do container do pgAdmin não aponta para o processo de port-forward rodando no host.
- **Beekeeper Studio**: suporta importar a string de conexão diretamente no formato `postgresql://usuario:senha@127.0.0.1:5432/banco`.

## Validação

Execute uma consulta simples depois de conectar:

```sql
SELECT version();
```yaml

## Troubleshooting

Se a conexão falhar com "connection refused", confirme que o comando de `port-forward` ainda está rodando em outro terminal — ele não persiste em background por padrão.

## Fontes e leitura adicional

- [CloudNativePG — Service management](https://cloudnative-pg.io/documentation/current/service_management/): referência dos Services usados para conexão.
- [PostgreSQL — libpq connection strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING): documenta o formato de string de conexão usado por clientes compatíveis com libpq.
