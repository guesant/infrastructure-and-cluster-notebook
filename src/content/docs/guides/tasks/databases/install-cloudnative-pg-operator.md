---
title: Instalar o operator CloudNativePG
description: Como instalar o operator CloudNativePG, que gerencia provisionamento, failover, backup, recuperação e upgrades de clusters PostgreSQL declarados como recursos Kubernetes.
sidebar:
  order: 1
---

> **Pré-requisitos:** kubeconfig com acesso administrativo à API.
> **Versões testadas:** CloudNativePG 1.30, Kubernetes 1.36.

CloudNativePG é um operator que gerencia o ciclo de vida completo de clusters PostgreSQL declarados como recursos Kubernetes: provisionamento, failover, backup, recuperação e upgrades de versão menor. Instalar o operator não cria nenhum banco de dados; ele apenas ensina a API Kubernetes a entender o recurso `Cluster` usado por [criar um cluster PostgreSQL](../create-postgresql-cluster/).

## Instalar o operator

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -p "Versão do operator CloudNativePG: " CNPG_VERSION

kubectl apply --server-side=true \
  --filename "https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-${CNPG_VERSION}/releases/cnpg-${CNPG_VERSION}.yaml"
```

Fixe a versão exata em vez de usar `main` ou `latest`: o manifesto de release muda de URL a cada versão.

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace cnpg-system rollout status deployment/cnpg-controller-manager --timeout=180s
kubectl --namespace cnpg-system get pods
kubectl get crd clusters.postgresql.cnpg.io
```

O Deployment deve estar `Running` e o CRD `Cluster` deve existir antes de prosseguir.

## Troubleshooting

Se o `rollout status` expirar, verifique `kubectl --namespace cnpg-system describe pod`: falta de recursos no nó ou incompatibilidade entre a versão do operator e a versão do Kubernetes são as causas mais comuns.

## Rollback

```bash
kubectl delete --filename "https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-${CNPG_VERSION}/releases/cnpg-${CNPG_VERSION}.yaml"
```

Não remova o operator enquanto houver um `Cluster` PostgreSQL ativo gerenciado por ele: os Pods do banco continuariam existindo, mas sem reconciliação, failover ou backup automatizados.

## Próximo passo

[Criar um cluster PostgreSQL](../create-postgresql-cluster/).

## Fontes e leitura adicional

- [CloudNativePG: Installation and upgrades](https://cloudnative-pg.io/documentation/current/installation_upgrade/): referência oficial de instalação, upgrade e compatibilidade de versões.
- [CloudNativePG: Architecture](https://cloudnative-pg.io/documentation/current/architecture/): descreve o modelo de operator, réplicas e failover.
