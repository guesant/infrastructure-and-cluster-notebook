---
title: Estruturar o repositório GitOps
sidebar:
  order: 4
---

> **Pré-requisitos:** [Argo CD instalado e acessível](../access-argocd/), um repositório Git para hospedar a configuração do cluster.
> **Versões testadas:** Argo CD (chart 10.1.3).

O modelo GitOps deste notebook usa o padrão App-of-Apps: uma `Application` chamada `root` observa o diretório `gitops/applications/`, e cada arquivo YAML desse diretório define uma `Application` independente para uma funcionalidade que o usuário decidiu instalar. O Argo CD ainda não gerencia nada até que o repositório exista com essa estrutura e a Application `root` seja aplicada — este último passo fica em [Criar a Application raiz](../create-root-application/).

```mermaid
flowchart TD
    Argo["Argo CD"] -->|"reconcilia"| Root["Application root"]
    Root -->|"lê no Git"| Applications["gitops/applications/"]

    Applications --> GatewayApp["Application gateway-resources"]
    Applications --> MonitoringApp["Application monitoring"]
    Applications --> RancherApp["Application rancher"]
    Applications --> CNPGOperatorApp["Application cloudnative-pg-operator"]
    Applications --> CNPGDatabaseApp["Application cloudnative-pg-database-example"]
    Applications --> InfisicalOperatorApp["Application infisical-secrets-operator"]
    Applications --> InfisicalSyncApp["Application infisical-secrets-example"]

    GatewayApp -->|"lê no Git"| GatewayChart["apps/system/gateway-resources/"]
    MonitoringApp -->|"lê no Git"| MonitoringChart["apps/monitoring/kube-prometheus-stack/"]
    RancherApp -->|"lê no Git"| RancherChart["apps/management/rancher/"]
    CNPGOperatorApp -->|"instala"| CNPGOperator["operator CloudNativePG"]
    CNPGDatabaseApp -->|"lê no Git"| CNPGManifests["apps/data/cloudnative-pg-example/"]
    CNPGOperator -->|"reconcilia"| CNPGManifests
    InfisicalOperatorApp -->|"instala"| InfisicalOperator["Infisical Secrets Operator"]
    InfisicalSyncApp -->|"lê no Git"| InfisicalManifests["apps/security/infisical-secrets/"]
    InfisicalOperator -->|"reconcilia"| InfisicalManifests

    GatewayChart --> Cluster["Recursos no cluster"]
    MonitoringChart --> Cluster
    RancherChart --> Cluster
    CNPGManifests --> Cluster
    InfisicalManifests --> Cluster
```yaml

O termo `root` não indica um tipo especial de repositório no Argo CD — é apenas o nome da Application de bootstrap. Seu manifesto aponta para `gitops/applications/`; as Applications encontradas nesse diretório passam a observar seus próprios caminhos em `gitops/apps/`. Como os manifests são independentes, mantenha somente os arquivos das aplicações que deseja usar.

## Preparar o conteúdo do repositório

1. Crie um repositório Git para a configuração do cluster ou escolha um repositório existente.
2. Copie [`templates/gitops`](https://github.com/guesant/infrastructure-and-cluster-notebook/tree/main/templates/gitops) para o diretório `gitops/` desse repositório — veja os [templates copiáveis](../../../blueprints/k3s-single-node-gitops/templates/) para o que cada um oferece.
3. Remova de `gitops/applications/` as Applications que não deseja instalar e remova também os respectivos diretórios em `gitops/apps/`.
4. Substitua `https://github.com/example/cluster-config.git` em `gitops/root/application.yaml` e nas Applications mantidas pela URL real do repositório. Revise também os domínios, versões, namespaces e valores dos charts.
5. Valide, faça commit e envie a estrutura para a branch indicada por `targetRevision`, que nos exemplos é `main`.

## Validação

> **Executar em:** cópia local do repositório GitOps.

```bash
grep -r "example/cluster-config" gitops/ || printf 'Nenhuma URL de exemplo restante.\n'
```yaml

Nenhuma ocorrência deve sobrar — cada referência ao repositório de exemplo precisa ter sido substituída pela URL real antes do bootstrap.

## Troubleshooting

Se o Argo CD relatar `repository not found` depois do bootstrap, confirme que a URL em `gitops/root/application.yaml` corresponde exatamente ao repositório e à branch enviados, incluindo maiúsculas/minúsculas e a extensão `.git` quando aplicável.

## Próximo passo

Se o repositório for privado, siga [Conectar o repositório Git](../connect-git-repository/). Se for público, siga direto para [Criar a Application raiz](../create-root-application/).

## Fontes e leitura adicional

- [Cluster bootstrapping — Argo CD](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/): apresenta o padrão App-of-Apps, suas alternativas e cuidados de administração.
- [Especificação de `Application` — Argo CD](https://argo-cd.readthedocs.io/en/stable/user-guide/application-specification/): referência dos campos usados para origem, destino e política de sincronização.
- [Princípios do OpenGitOps](https://opengitops.dev/): descreve os princípios declarativo, versionado, aplicado automaticamente e continuamente reconciliado.
