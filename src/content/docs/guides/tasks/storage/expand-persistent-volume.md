---
title: Expandir um PersistentVolume
description: Como aumentar a capacidade de um PVC existente sem recriar o volume nem perder dados, e como reconhecer quando o Pod precisa reiniciar para concluir a expansão.
sidebar:
  order: 6
---

> **Pré-requisitos:** PVC existente usando uma StorageClass com `allowVolumeExpansion: true`.
> **Versões testadas:** Longhorn 1.12.0, Kubernetes 1.36.

Expandir um volume aumenta sua capacidade sem recriar o PVC nem perder dados: útil quando um workload cresce além do espaço originalmente alocado. A expansão só reduz capacidade em uma direção: não é possível encolher um volume por este caminho.

## Confirmar que a expansão é suportada

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl get storageclass "$(kubectl get pvc <nome> --namespace <namespace> -o jsonpath='{.spec.storageClassName}')" \
  -o jsonpath='{.allowVolumeExpansion}'
```

Deve retornar `true`. Se a classe não permitir expansão, siga [criar uma StorageClass](../create-storage-class/) com `allowVolumeExpansion: true` antes de prosseguir: uma classe existente não pode ser editada retroativamente para volumes já criados sem esse campo.

## Expandir o PVC

```bash
read -r -p "Namespace do PVC: " PVC_NAMESPACE
read -r -p "Nome do PVC: " PVC_NAME
read -r -p "Nova capacidade (ex.: 20Gi): " NEW_SIZE

kubectl patch pvc "${PVC_NAME}" --namespace "${PVC_NAMESPACE}" \
  --patch "{\"spec\": {\"resources\": {\"requests\": {\"storage\": \"${NEW_SIZE}\"}}}}"
```

## Validação

```bash
kubectl get pvc "${PVC_NAME}" --namespace "${PVC_NAMESPACE}"
kubectl describe pvc "${PVC_NAME}" --namespace "${PVC_NAMESPACE}"
```

O campo `CAPACITY` deve refletir o novo tamanho. Alguns filesystems exigem que o Pod seja reiniciado para que o crescimento seja visível dentro do container; confirme com `df --human` de dentro do Pod depois do patch.

## Troubleshooting

Se o PVC ficar preso em `FileSystemResizePending`, o volume já foi expandido no nível de bloco, mas o filesystem ainda não foi redimensionado: reinicie o Pod para acionar o redimensionamento do filesystem.

## Rollback

Não há redução de tamanho por este caminho. Para reduzir, é necessário criar um novo PVC menor e migrar os dados manualmente.

## Próximo passo

Registre a nova capacidade no inventário de [prontidão de backup](../../../../operations/checklists/backup-readiness/), já que o tamanho afeta o tempo de backup e restauração.

## Fontes e leitura adicional

- [Kubernetes: Expanding Persistent Volumes Claims](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#expanding-persistent-volumes-claims): referência oficial do processo de expansão.
