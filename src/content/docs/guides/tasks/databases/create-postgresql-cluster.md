---
title: Criar um cluster PostgreSQL
sidebar:
  order: 2
---

> **Pré-requisitos:** [operator CloudNativePG instalado](../install-cloudnative-pg-operator/), StorageClass disponível (veja [criar uma StorageClass](../../storage/create-storage-class/)).
> **Versões testadas:** CloudNativePG 1.30, PostgreSQL 17.

Um recurso `Cluster` do CloudNativePG declara quantas instâncias PostgreSQL rodam, qual armazenamento usam e como se comunicam entre si — o operator provisiona os Pods, configura replicação em streaming entre elas e promove uma réplica automaticamente se a primária falhar.

## Criar o cluster

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -p "Namespace do cluster: " PG_NAMESPACE
read -r -p "Nome do cluster: " PG_CLUSTER_NAME
read -r -p "Número de instâncias (1 = sem HA, 3 recomendado): " PG_INSTANCES
read -r -p "Tamanho do volume (ex.: 10Gi): " PG_STORAGE_SIZE
read -r -p "StorageClass a usar: " PG_STORAGE_CLASS

kubectl create namespace "${PG_NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f - <<EOF
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: ${PG_CLUSTER_NAME}
  namespace: ${PG_NAMESPACE}
spec:
  instances: ${PG_INSTANCES}
  storage:
    size: ${PG_STORAGE_SIZE}
    storageClass: ${PG_STORAGE_CLASS}
  postgresql:
    parameters:
      max_connections: "100"
EOF
```yaml

Em um cluster de nó único, `instances: 1` é a única opção realista — múltiplas instâncias não protegem contra a perda do único host físico, apenas do processo PostgreSQL isoladamente. Veja [decisões do blueprint](../../../../guides/blueprints/k3s-single-node-gitops/#decisões-adotadas) para o contexto dessa limitação.

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace "${PG_NAMESPACE}" get cluster "${PG_CLUSTER_NAME}"
kubectl --namespace "${PG_NAMESPACE}" get pods -l cnpg.io/cluster="${PG_CLUSTER_NAME}"
```yaml

A coluna `STATUS` do `Cluster` deve mostrar `Cluster in healthy state`, e os Pods devem estar `Running` com uma réplica marcada como `primary` no rótulo `cnpg.io/instanceRole`.

## Troubleshooting

Se os Pods ficarem `Pending`, confirme capacidade da `StorageClass` e do nó (veja [validar requisitos do host](../../host/validate-host-requirements/)). Se o cluster nunca sair de `Setting up primary`, revise `kubectl --namespace "${PG_NAMESPACE}" describe cluster "${PG_CLUSTER_NAME}"` para o evento específico.

## Rollback

```bash
kubectl --namespace "${PG_NAMESPACE}" delete cluster "${PG_CLUSTER_NAME}"
```yaml

:::danger
Excluir o `Cluster` remove os Pods e, conforme a política de retenção do volume (veja [PersistentVolumes na prática](../../../../learn/storage/persistent-volumes/)), pode remover também os dados. Confirme a `reclaimPolicy` da StorageClass antes de excluir um cluster com dados importantes.
:::

## Próximo passo

[Configurar credenciais de aplicação](../configure-application-credentials/).

## Fontes e leitura adicional

- [CloudNativePG — Quickstart](https://cloudnative-pg.io/documentation/current/quickstart/): fluxo oficial de criação de um primeiro cluster.
- [CloudNativePG — API Reference](https://cloudnative-pg.io/documentation/current/cloudnative-pg.v1/): referência completa do campo `spec` do recurso `Cluster`.
