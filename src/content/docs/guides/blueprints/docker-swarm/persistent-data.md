---
title: Dados persistentes
sidebar:
  order: 5
---

> **Para quem é:** operadores armazenando dados de aplicação em Swarm.

Docker Swarm não oferece orquestração nativa de volumes entre hosts. Volumes são locais ao host do container — se o container é remarcado para outro host, o volume fica para trás.

## Local volumes

Padrão — cada host tem sua cópia local:

```bash
docker service create \
  --mount type=volume,source=mydata,target=/data \
  --name app \
  <imagem>
```yaml

Adequado para **staging/dev** ou quando a aplicação replica dados (ex.: banco de dados distribuído, cache).

**Inadequado** para um banco de dados centralizado ou dados únicos — perda do host = perda dos dados.

## Volume driver externo

Conecta um backend compartilhado (NFS, iSCSI, plugin de nuvem):

```bash
# Criar volume via driver externo
docker volume create --driver nfs --opt addr=<nfs_server> <nome>

docker service create \
  --mount type=volume,source=<nome>,target=/data \
  --name db \
  <imagem>
```yaml

Permite que um container seja reagendado em qualquer host e ainda acesse os mesmos dados.

## Constraints de placement

Fixa um container em hosts específicos (workaround para volumes locais):

```bash
docker service create \
  --constraint node.hostname==db-host-1 \
  --mount type=volume,source=db_data,target=/data \
  --name db \
  postgres
```yaml

Desvantagem: se `db-host-1` cai, o serviço fica indisponível.

## Backup manual

Não há integração nativa com snapshot de volumes. Backup é responsabilidade da aplicação:

```bash
# Dentro da aplicação ou em um container auxiliar:
pg_dump | gzip > /backup/db.sql.gz

# Sincronizar /backup para storage externo (rsync, S3, etc.)
```yaml

## Checklist

```yaml
☐ Se aplicação precisa persitência: usar volume driver externo ou constraints
☐ Se múltiplas réplicas do app: são data-sharing aware? (ex.: raft, quorum)
☐ Procedimento de backup documentado e testado
☐ RTO/RPO definido (quanto tempo sem dados, quanto tempo para recuperar)
```yaml

## Referências

- [Volumes in Docker](https://docs.docker.com/storage/volumes/): tipos de volumes.
- [Volume drivers](https://docs.docker.com/engine/extend/plugins_volume/): plugins para backends compartilhados.
