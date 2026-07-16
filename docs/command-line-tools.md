# Ferramentas de linha de comando

[Voltar ao guia principal](../README.md)

As ferramentas desta seção são clientes administrativos. Elas podem ser instaladas em um manager ou em uma estação externa; pertencer ao cluster não é requisito. Para operar recursos remotamente, a máquina precisa alcançar a API correspondente e possuir credenciais com as permissões necessárias.

Os scripts deste repositório instalam binários em `/usr/local/bin` e usam `sudo` quando necessário. Revise o conteúdo antes de executar um script remoto. Para maior controle, clone o repositório e execute o arquivo localmente.

## kubectl

`kubectl` é o cliente principal da API Kubernetes. Ele cria, consulta, altera e remove objetos, acompanha logs e eventos e auxilia no diagnóstico de workloads. O comando lê o kubeconfig para decidir com qual cluster e identidade trabalhar; portanto, confira o contexto antes de qualquer alteração. O `kubectl` não acessa diretamente o banco do K3s nem os containers: suas operações passam pela API e pelas regras de autorização do Kubernetes. Referência: [introdução ao kubectl](https://kubernetes.io/docs/reference/kubectl/introduction/).

O instalador baixa a versão estável indicada por `dl.k8s.io` e valida o SHA-256:

> **Executar em:** máquina onde a CLI será instalada.

```bash
curl -sfL \
  https://raw.githubusercontent.com/guesant/cluster-management-notes/refs/heads/main/scripts/install/kubectl.sh \
  | bash -
```

## Helm

Helm é um gerenciador de pacotes para Kubernetes. Um **chart** reúne templates de manifests, valores padrão e metadados; um arquivo `values.yaml` ou opções `--set` personalizam esses templates; uma **release** é uma instalação identificada desse chart em um cluster. `helm upgrade --install` cria a release quando ela não existe ou gera uma nova revisão quando existe, permitindo consultar o histórico e realizar rollback.

Helm renderiza manifests e os envia à API Kubernetes usando o kubeconfig, mas não mantém um controller próprio reconciliando continuamente a release. Depois da instalação, uma alteração manual no cluster não é corrigida por Helm até uma nova operação; essa é uma diferença importante em relação ao Argo CD. Referência: [introdução ao Helm](https://helm.sh/docs/intro/introduction/).

O instalador usa o script oficial da linha Helm 3:

> **Executar em:** máquina onde a CLI será instalada.

```bash
curl -sfL \
  https://raw.githubusercontent.com/guesant/cluster-management-notes/refs/heads/main/scripts/install/helm.sh \
  | bash -
```

## Argo CD CLI

`argocd` é o cliente da API do Argo CD. Ele permite autenticar no servidor Argo CD, cadastrar repositórios, consultar diferenças e controlar sincronizações. Não substitui `kubectl`: a CLI `argocd` opera os conceitos do Argo CD, enquanto `kubectl` opera qualquer recurso exposto pela API Kubernetes, inclusive os CRDs `Application`.

O instalador baixa a versão do canal `stable` para `amd64` ou `arm64`:

> **Executar em:** máquina onde a CLI será instalada.

```bash
curl -sfL \
  https://raw.githubusercontent.com/guesant/cluster-management-notes/refs/heads/main/scripts/install/argocd.sh \
  | bash -
```

## longhornctl

`longhornctl` auxilia na preparação e no diagnóstico do Longhorn, principalmente por meio dos testes de preflight usados neste guia. Ele não monta volumes para as aplicações e não substitui a interface CSI; os Pods continuam solicitando armazenamento por PVCs Kubernetes.

Fixe a CLI na mesma versão do chart Longhorn:

> **Executar em:** máquina onde a CLI será instalada; não precisa ser um nó do cluster.

```bash
read -r -p "Versão do longhornctl [v1.12.0]: " LONGHORNCTL_VERSION
LONGHORNCTL_VERSION="${LONGHORNCTL_VERSION:-v1.12.0}"

curl -sfL \
  https://raw.githubusercontent.com/guesant/cluster-management-notes/refs/heads/main/scripts/install/longhornctl.sh \
  | LONGHORNCTL_VERSION="${LONGHORNCTL_VERSION}" bash -
```

Depois de instalar as ferramentas, valide as versões:

> **Executar em:** máquina onde as CLIs foram instaladas.

```bash
kubectl version --client
helm version
argocd version --client
longhornctl version
```
