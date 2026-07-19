---
title: Conectar o repositório Git
sidebar:
  order: 5
---

import ScriptHelper from '../../../../../components/ScriptHelper.astro';
import registerGitopsRepoScript from '../../../../../scripts/register-gitops-repo.sh?raw';

> **Pré-requisitos:** CLI do Argo CD autenticada (veja [acessar o Argo CD](../access-argocd/)), repositório GitOps [estruturado](../structure-gitops-repository/), repositório privado por SSH.
> **Versões testadas:** Argo CD CLI 3.x.

Um repositório público normalmente pode ser lido diretamente pela URL informada nas Applications, sem credencial cadastrada. Esta página é necessária apenas para repositórios privados. Registre uma chave de leitura dedicada ao Argo CD — não reutilize uma chave SSH administrativa pessoal, para poder revogar o acesso do Argo CD sem afetar outros usos da chave.

## Registrar a credencial

> **Executar em:** estação administrativa com a CLI do Argo CD autenticada e acesso à chave de leitura do repositório.

<ScriptHelper
  script={registerGitopsRepoScript}
  fields={[
    { var: 'GITOPS_REPO_URL', label: 'URL SSH do repositório GitOps' },
    { var: 'GITOPS_SSH_KEY', label: 'Caminho da chave privada (Enter para usar ~/.ssh/argocd_gitops)' },
  ]}
/>

A chave precisa ter permissão de leitura no repositório (deploy key, no GitHub) antes deste comando — cadastre-a na plataforma Git primeiro.

## Validação

> **Executar em:** estação administrativa com a CLI do Argo CD autenticada.

```bash
argocd repo list
argocd repo get "${GITOPS_REPO_URL}"
```yaml

O repositório deve aparecer com status de conexão `Successful`. Um status diferente costuma indicar chave sem permissão de leitura no provedor Git ou URL SSH digitada incorretamente (formato `git@host:organização/repositório.git`).

## Troubleshooting

Se `argocd repo get` retornar erro de host desconhecido (`unknown host key`), o servidor Argo CD ainda não confia na chave pública do provedor Git. Revise a configuração de `known hosts` do Argo CD antes de repetir o registro.

## Rollback

```bash
argocd repo rm "${GITOPS_REPO_URL}"
```yaml

## Próximo passo

[Criar a Application raiz](../create-root-application/).

## Fontes e leitura adicional

- [Repositórios privados — Argo CD](https://argo-cd.readthedocs.io/en/stable/user-guide/private-repositories/): documenta credenciais HTTPS e SSH, chaves de deploy e verificação do servidor.
