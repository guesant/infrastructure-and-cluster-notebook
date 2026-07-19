---
title: Application OutOfSync ou Degraded no Argo CD
sidebar:
  order: 4
---

> **Sintoma:** uma Application do Argo CD aparece como `OutOfSync` ou `Degraded`.
> **Versões testadas:** Argo CD (chart 10.1.3).

`OutOfSync` significa que o estado do cluster diverge do que está declarado no Git. `Degraded` significa que os recursos sincronizados não estão saudáveis, independentemente de estarem sincronizados. São problemas diferentes — trate cada um com o diagnóstico correspondente.

## Diagnóstico inicial

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API, ou a CLI do Argo CD.

```bash
kubectl --namespace argocd get applications.argoproj.io
kubectl --namespace argocd describe application <nome>
```yaml

`describe` mostra o diff entre o estado desejado e o observado, além de eventos recentes de sincronização.

## Se `OutOfSync`

Verifique se é uma divergência esperada (mudança manual não versionada, ou uma mudança no Git ainda não aplicada porque a sincronização automática está desabilitada):

```bash
argocd app diff <nome>
```yaml

Se a divergência for uma mudança manual indevida no cluster, o Argo CD a corrige automaticamente quando `selfHeal` está habilitado; caso contrário, sincronize manualmente:

```bash
argocd app sync <nome>
```yaml

Se a divergência for esperada (ex.: campo mutável gerenciado por um admission controller), ajuste `ignoreDifferences` na `Application` em vez de deixá-la permanentemente `OutOfSync`.

## Se `Degraded`

O problema está nos recursos já sincronizados, não na sincronização em si. Investigue o recurso reportado como não saudável:

```bash
kubectl --namespace <namespace-da-app> get pods
kubectl --namespace <namespace-da-app> describe pod <pod>
```yaml

Um `Deployment` com `Degraded` geralmente reflete Pods em `CrashLoopBackOff`, `ImagePullBackOff` ou falha de probe — trate como um problema normal de workload, não do Argo CD.

## Causas comuns

| Sintoma | Causa provável |
| --- | --- |
| `OutOfSync` permanente mesmo com `selfHeal` | `ignoreDifferences` ausente para um campo mutado por um controller externo (ex.: HPA, webhook) |
| `Degraded` logo após sync | Imagem inexistente, `CrashLoopBackOff`, ou recurso dependente (CRD, Secret) ainda não pronto |
| Sync falha com erro de CRD ausente | Ordem de instalação incorreta — instale o operator/CRD antes da Application que os usa |
| Application presa em `Progressing` | Um recurso com `health.lua` customizado nunca reporta saudável — revise a lógica de health check |

## Recuperação

Depois de corrigir a causa raiz, force uma nova sincronização:

```bash
argocd app sync <nome> --force
```yaml

`--force` substitui recursos existentes em vez de aplicar um patch — use com atenção em recursos que outros controllers também gerenciam.

## Fontes e leitura adicional

- [Sincronização automatizada — Argo CD](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/): explica `selfHeal`, `prune` e o comportamento de sincronização.
- [Diffing — Argo CD](https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/): documenta `ignoreDifferences` e as causas comuns de diffs falsos.
- [Health assessment — Argo CD](https://argo-cd.readthedocs.io/en/stable/operator-manual/health/): explica como o Argo CD determina o status de saúde de cada tipo de recurso.
