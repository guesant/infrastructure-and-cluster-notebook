---
title: Secrets e configs
sidebar:
  order: 4
---

> **Para quem é:** operadores gerenciando dados sensíveis e de configuração em Swarm.

Docker oferece dois primitivos para dados que não devem ser hardcoded em imagens:

- **Secrets**: dados sensíveis (senhas, tokens, chaves), criptografados em repouso.
- **Configs**: dados de configuração não sensíveis (versões, endpoints), em texto claro.

Ambos são gerenciados pelo manager e distribuídos aos containers via volume em memória (`/run/secrets/` ou `/run/configs/`).

## Criar um secret

```bash
# De um arquivo
docker secret create <nome> <arquivo>

# De stdin
echo "senha123" | docker secret create db_password -

# Listar
docker secret ls
```

## Usar secret em um service

```bash
docker service create \
  --secret db_password \
  --name app \
  <imagem>
```

Dentro do container:

```bash
cat /run/secrets/db_password
```

## Criar uma config

Igual a secret, mas não criptografada:

```bash
docker config create nginx.conf <arquivo>

docker service create \
  --config source=nginx.conf,target=/etc/nginx/nginx.conf \
  --name web \
  nginx
```

## Renovação de secrets

**Não há rotação automática**. Para atualizar:

```bash
# Criar novo secret
docker secret create db_password_v2 <novo_arquivo>

# Atualizar service (força redeploy)
docker service update \
  --secret-remove db_password \
  --secret-add db_password_v2 \
  <service>
```

Containers antigos usam secret antigo até serem redeployados.

## Limitações

- Secrets são criptografados apenas em repouso, no armazenamento Raft do manager; entre manager e
  worker e dentro do container, não há camada de proteção adicional além do TLS mútuo já usado
  pela comunicação interna do Swarm.
- Um container tem acesso a todos os secrets atribuídos ao service, sem RBAC fino por secret
  individual.
- Não há log de auditoria nativo: o Swarm não registra quem acessou qual secret nem quando.

Para operações que exigem auditoria, rotação automática ou RBAC granular, considere um
[secret store externo](../../../../learn/secrets-management/overview/).

## Referências

- [Manage sensitive data in Swarm](https://docs.docker.com/engine/swarm/secrets/): documentação oficial.
- [Configs reference](https://docs.docker.com/engine/swarm/configs/): gerenciamento de configs.
