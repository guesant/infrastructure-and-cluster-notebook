---
title: Pod Pending
sidebar:
  order: 2
---

> **Sintoma:** um Pod permanece em `Pending` sem ser agendado.
> **Versões testadas:** Kubernetes 1.36.

`Pending` significa que o scheduler ainda não encontrou (ou não pôde usar) um nó compatível com os requisitos do Pod. A causa está quase sempre nos eventos do Pod, não nos logs de um container que ainda nem iniciou.

## Diagnóstico inicial

> **Executar em:** estação administrativa com kubeconfig.

```bash
kubectl --namespace <namespace> describe pod <pod>
```yaml

A seção `Events` no final da saída normalmente nomeia a causa diretamente: `Insufficient cpu`, `Insufficient memory`, `node(s) had taint`, `didn't find available persistent volumes`, entre outras.

## Causas comuns em cluster single-node

Como há apenas um nó, "nenhum nó disponível" quase sempre significa que o único nó não atende a algum requisito do Pod:

| Causa | Verificação |
| --- | --- |
| `requests` maiores que a capacidade livre do nó | `kubectl describe node` — seção `Allocated resources` |
| Taint no nó sem toleration no Pod | `kubectl describe node` — campo `Taints` |
| `nodeSelector`/`affinity` que não corresponde ao único nó | Comparar labels do nó com o seletor do Pod |
| PVC pendente (sem StorageClass ou sem capacidade) | `kubectl get pvc --namespace <namespace>` |
| `PodDisruptionBudget` ou `ResourceQuota` do namespace | `kubectl get resourcequota --namespace <namespace>` |

## Verificar capacidade do nó

```bash
kubectl describe node <nome-do-nó> | grep -A5 "Allocated resources"
```yaml

Se `requests.cpu`/`requests.memory` já estão perto de 100% alocados, o novo Pod não cabe mesmo que o nó tenha uso real baixo — `requests` reservam capacidade, não medem consumo atual.

## Verificar volumes pendentes

```bash
kubectl get pvc --namespace <namespace>
kubectl describe pvc <nome> --namespace <namespace>
```yaml

Um PVC `Pending` por falta de `StorageClass` padrão é esperado neste notebook — a instalação do primeiro servidor desabilita `local-storage` intencionalmente (veja [decisões do blueprint](../../../guides/blueprints/k3s-single-node-gitops/#decisões-adotadas)). Instale o [Longhorn](../../../guides/tasks/storage/install-longhorn/) ou revise a decisão de armazenamento.

## Recuperação

Depois de identificar a causa pelo `describe`, corrija o requisito correspondente — reduza `requests`, remova um taint incompatível, ajuste o `nodeSelector`, ou resolva o PVC pendente. Reaplicar o mesmo manifesto sem corrigir a causa apenas reproduz o mesmo `Pending`.

## Fontes e leitura adicional

- [Kubernetes — Pod Scheduling Readiness](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-scheduling-readiness/): referência do ciclo de agendamento de um Pod.
- [Kubernetes — Assign Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/): documenta `nodeSelector`, afinidade e taints/tolerations.
