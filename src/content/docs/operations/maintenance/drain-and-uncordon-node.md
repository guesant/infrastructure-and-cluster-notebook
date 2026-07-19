---
title: Drenar e reintegrar um nó para manutenção
sidebar:
  order: 3
---

import ScriptHelper from '../../../../components/ScriptHelper.astro';
import cordonAndDrainScript from '../../../../scripts/cordon-and-drain-node.sh?raw';

> **Pré-requisitos:** kubeconfig administrativo.
> **Versões testadas:** K3s v1.36.1+k3s1.

Esta página cobre a manutenção temporária de um nó que continuará no cluster — reiniciar o host, aplicar uma atualização de kernel, trocar hardware. Para remover um nó permanentemente do cluster, veja [remover um nó do K3s](../../../guides/tasks/kubernetes/remove-k3s-node/) em vez desta página.

Em um cluster de nó único, drenar o único nó esvazia todos os workloads sem ter para onde reagendá-los — eles ficam `Pending` até o nó voltar e ser reintegrado. Planeje essa janela como indisponibilidade total, não como uma manutenção transparente.

## Drenar o nó

<ScriptHelper
  runWhere="estação administrativa com kubeconfig"
  script={cordonAndDrainScript}
  fields={[
    { var: 'K3S_NODE_NAME', label: 'Nome do nó em manutenção' },
  ]}
/>

## Executar a manutenção

Com o nó drenado, execute a manutenção planejada (reinício, atualização de pacotes, troca de disco). Nenhum novo Pod é agendado nele enquanto permanecer `cordoned`.

## Reintegrar o nó

Depois que a manutenção terminar e o nó estiver saudável novamente:

> **Executar em:** estação administrativa com kubeconfig.

```bash
kubectl uncordon "${K3S_NODE_NAME}"
```yaml

## Validação

> **Executar em:** estação administrativa.

```bash
kubectl get node "${K3S_NODE_NAME}"
kubectl get pods --all-namespaces -o wide | grep "${K3S_NODE_NAME}"
```yaml

O nó deve voltar a `Ready` sem `SchedulingDisabled`, e os workloads que estavam pendentes devem ser reagendados nele em pouco tempo.

## Troubleshooting

Se `uncordon` não fizer os Pods pendentes serem agendados, verifique se há taints residuais ou se o nó ainda reporta pressão de recursos (`kubectl describe node`) — `uncordon` só reabre o agendamento, não força a reconciliação imediata de Pods já em `Pending` por outro motivo.

## Rollback

```bash
kubectl cordon "${K3S_NODE_NAME}"
```yaml

## Próximo passo

Registre a manutenção no [runbook de manutenção](../maintenance-runbook/).

## Fontes e leitura adicional

- [Kubernetes — Safely Drain a Node](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/): referência oficial de `cordon`, `drain` e `uncordon`.
