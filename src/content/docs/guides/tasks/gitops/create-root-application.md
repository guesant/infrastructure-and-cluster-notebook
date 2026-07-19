---
title: Criar a Application raiz
sidebar:
  order: 6
---

> **Pré-requisitos:** repositório GitOps [estruturado](../structure-gitops-repository/) e enviado ao Git; se privado, [conectado](../connect-git-repository/).
> **Versões testadas:** Argo CD (chart 10.1.3).

Aplicar a Application `root` é o único passo manual do bootstrap. A partir dela, o Argo CD descobre e reconcilia automaticamente as demais Applications listadas em `gitops/applications/` — nenhuma delas precisa ser aplicada individualmente.

## Aplicar a Application raiz

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API, na raiz da cópia local do repositório GitOps.

```bash
read -r -p \
  "Caminho da Application raiz [gitops/root/application.yaml]: " \
  ROOT_APPLICATION

ROOT_APPLICATION="${ROOT_APPLICATION:-gitops/root/application.yaml}"
kubectl apply -f "${ROOT_APPLICATION}"
```yaml

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace argocd get applications.argoproj.io
kubectl --namespace argocd describe application root
```yaml

A Application `root` deve aparecer com `SYNC STATUS` `Synced` e `HEALTH STATUS` `Healthy`; as Applications descobertas a partir dela devem aparecer na mesma lista pouco depois, conforme o Argo CD as reconcilia.

Os templates começam com `prune: false`: o Argo CD corrige recursos alterados quando `selfHeal` está habilitado, mas não exclui automaticamente do cluster um recurso removido do Git. Revise os diffs e o comportamento de cada Application antes de habilitar `prune`, pois a exclusão no repositório poderá resultar na exclusão correspondente no cluster.

## Troubleshooting

Se a Application `root` ficar `Unknown` ou `OutOfSync` sem nunca sincronizar, confirme a URL e a branch em `gitops/root/application.yaml` e, para repositórios privados, revise a [conexão do repositório](../connect-git-repository/). `kubectl --namespace argocd describe application root` mostra a mensagem de erro reportada pelo Argo CD na seção `Status.Conditions`.

## Rollback

```bash
kubectl --namespace argocd delete application root
```yaml

Remover a Application `root` não desfaz automaticamente o que as Applications descobertas por ela já sincronizaram no cluster; remova-as individualmente se for necessário desfazer também os recursos aplicados.

## Próximo passo

Escolha os [templates copiáveis](../../../blueprints/k3s-single-node-gitops/templates/) que correspondem aos módulos desejados e acompanhe a sincronização de cada Application.

## Fontes e leitura adicional

- [Cluster bootstrapping — Argo CD](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/): apresenta o padrão App-of-Apps e o papel da Application raiz.
- [Sincronização automatizada — Argo CD](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/): explica `selfHeal`, `prune` e os efeitos da reconciliação automática.
