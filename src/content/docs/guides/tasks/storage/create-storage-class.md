---
title: Criar uma StorageClass do Longhorn
description: Como criar StorageClasses adicionais do Longhorn com número de réplicas e diskSelector diferentes da classe padrão, e como definir a classe padrão do cluster.
sidebar:
  order: 5
---

> **Pré-requisitos:** [Longhorn instalado](../install-longhorn/).
> **Versões testadas:** Longhorn 1.12.0.

O Longhorn já registra uma `StorageClass` padrão (`longhorn`) na instalação, com três réplicas. Esta página cobre a criação de classes adicionais com parâmetros diferentes: por exemplo, uma classe de réplica única para dados não críticos, ou uma classe direcionada a discos com uma tag específica.

## Criar uma StorageClass customizada

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
read -r -p "Nome da nova StorageClass: " STORAGE_CLASS_NAME
read -r -p "Número de réplicas: " REPLICA_COUNT

kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ${STORAGE_CLASS_NAME}
provisioner: driver.longhorn.io
allowVolumeExpansion: true
reclaimPolicy: Retain
parameters:
  numberOfReplicas: "${REPLICA_COUNT}"
  staleReplicaTimeout: "30"
EOF
```

`reclaimPolicy: Retain` evita exclusão automática de dados quando o PVC é removido; veja [PersistentVolumes na prática](../../../../learn/storage/persistent-volumes/) para os trade-offs entre `Retain` e `Delete`.

## Direcionar para discos com uma tag específica

Adicione o parâmetro `diskSelector` para direcionar volumes desta classe apenas a discos marcados com uma tag (veja [configurar um nó do Longhorn](../configure-longhorn-node/)):

```yaml
parameters:
  numberOfReplicas: "3"
  diskSelector: "ssd"
```

## Definir uma classe como padrão do cluster

No máximo uma `StorageClass` deve ser padrão por vez:

```bash
kubectl patch storageclass "${STORAGE_CLASS_NAME}" \
  --patch '{"metadata": {"annotations": {"storageclass.kubernetes.io/is-default-class": "true"}}}'
```

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl get storageclass
```

Confirme que apenas uma classe aparece marcada `(default)` e que os parâmetros da nova classe correspondem ao esperado (`kubectl describe storageclass "${STORAGE_CLASS_NAME}"`).

## Troubleshooting

Se um PVC criado com a nova classe ficar `Pending`, confirme que existe capacidade suficiente nos discos que atendem ao `diskSelector` (se usado): um seletor que não corresponde a nenhum disco elegível deixa o PVC pendente indefinidamente sem mensagem de erro óbvia.

## Rollback

```bash
kubectl delete storageclass "${STORAGE_CLASS_NAME}"
```

Não remova uma `StorageClass` ainda referenciada por PVCs existentes.

## Próximo passo

[Configurar backup de volume](../configure-volume-backup/).

## Fontes e leitura adicional

- [Kubernetes: Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/): referência oficial de parâmetros e classe padrão.
- [Longhorn: Storage Tags](https://longhorn.io/docs/1.12.0/nodes-and-volumes/nodes/storage-tags/): documenta `diskSelector` e `nodeSelector`.
