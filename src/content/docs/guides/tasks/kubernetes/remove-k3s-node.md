---
title: Remover um nó do K3s
description: Como esvaziar (cordon e drain) um nó K3s antes de remover seu registro da API, evitando derrubar Pods sem controle.
sidebar:
  order: 9
---

import ScriptHelper from '../../../../../components/ScriptHelper.astro';
import cordonAndDrainScript from '../../../../../scripts/cordon-and-drain-node.sh?raw';
import removeNodeScript from '../../../../../scripts/remove-node-from-cluster.sh?raw';

> **Pré-requisitos:** kubeconfig administrativo, acesso root ao nó que será removido.
> **Versões testadas:** K3s v1.36.1+k3s1.

Remover um nó do cluster tem dois momentos distintos: esvaziar os workloads que rodam nele (`cordon` + `drain`) e, só depois, remover o registro do nó da API. Fazer a remoção antes de esvaziar o nó derruba os Pods sem controle, em vez de deixar o scheduler recriá-los em outro nó primeiro.

## Esvaziar o nó

`cordon` impede que novos Pods sejam agendados no nó; `drain` remove os Pods existentes, respeitando PodDisruptionBudgets:

<ScriptHelper
  runWhere="estação administrativa com kubeconfig"
  script={cordonAndDrainScript}
  fields={[
    { var: 'K3S_NODE_NAME', label: 'Nome do nó a remover' },
  ]}
/>

`--ignore-daemonsets` permite que Pods de DaemonSet continuem rodando durante o drain (eles são removidos automaticamente quando o nó sai do cluster). `--delete-emptydir-data` autoriza remover Pods com volumes `emptyDir`, cujo conteúdo não sobrevive à remoção de qualquer forma.

Se o `drain` travar aguardando um PodDisruptionBudget, revise a aplicação afetada antes de forçar a remoção: um PDB bloqueando o drain normalmente está protegendo a disponibilidade mínima configurada, não travando por engano.

## Remover o registro do nó

Depois que o `drain` terminar sem Pods restantes:

<ScriptHelper
  runWhere="estação administrativa com kubeconfig"
  script={removeNodeScript}
  fields={[
    { var: 'K3S_NODE_NAME', label: 'Nome do nó a remover' },
  ]}
/>

`kubectl delete node` remove apenas o registro na API; não desinstala o K3s do host removido. Se a máquina continuar ligada e o serviço K3s ativo, siga com [desinstalar o K3s](../uninstall-k3s/) nela, ou ela tentará se re-registrar automaticamente.

## Validação

> **Executar em:** estação administrativa.

```bash
kubectl get nodes
```

O nó removido não deve mais aparecer na lista. Confirme também que os Pods que rodavam nele foram reagendados nos nós restantes (`kubectl get pods --all-namespaces -o wide`).

## Troubleshooting

Se o nó reaparecer sozinho pouco depois da remoção, o serviço K3s ainda está rodando na máquina removida e se re-registrando pela API. Pare e desinstale o K3s nela antes de considerar a remoção concluída.

## Rollback

Remover um nó não é reversível de forma automática: para reintroduzi-lo, siga [adicionar um servidor](../join-k3s-server/) ou [adicionar um agente](../join-k3s-agent/) novamente, como se fosse um nó novo.

## Próximo passo

Se o nó removido não vai mais participar do cluster, siga [desinstalar o K3s](../uninstall-k3s/) nele para limpar o host.

## Fontes e leitura adicional

- [Kubernetes: Safely Drain a Node](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/): referência oficial de `cordon`, `drain` e PodDisruptionBudgets.
- [K3s: Remove a Node](https://docs.k3s.io/cluster-access#remove-a-node-from-the-cluster): confirma o comportamento de `kubectl delete node` em clusters K3s.
