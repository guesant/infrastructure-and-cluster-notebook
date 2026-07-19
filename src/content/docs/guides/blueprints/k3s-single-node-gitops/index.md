---
title: Cluster K3s single-node com GitOps
description: Arquitetura completa e opinativa para um cluster K3s de nó único, exposto por Gateway API e Traefik, com certificados automatizados e aplicações administradas via Argo CD.
sidebar:
  order: 1
---

> **Pré-requisitos:** veja [pré-requisitos](../k3s-single-node-gitops/prerequisites/).
> **Versões testadas:** Debian 12 (bookworm), K3s v1.36.1+k3s1, cert-manager v1.21.0, Argo CD (chart 10.1.3), Gateway API v1.5.1.

## Objetivo e cenário atendido

Este blueprint entrega um cluster Kubernetes funcional em uma única máquina — física ou virtual —, com publicação de serviços via Gateway API, certificados TLS emitidos e renovados automaticamente, e aplicações administradas declarativamente a partir de um repositório Git. É o caminho indicado para laboratórios pessoais, homelabs e ambientes de baixo custo que ainda assim querem operar próximo de um padrão usado em produção, com trade-offs explícitos.

Não é o blueprint indicado para quem precisa de alta disponibilidade do control plane ou tolerância à perda de um host físico — veja [limitações e pontos únicos de falha](../k3s-single-node-gitops/limitations/) antes de adotá-lo em um cenário que não tolera indisponibilidade.

## Arquitetura

```mermaid
flowchart TB
    accTitle: Arquitetura do cluster K3s single-node com GitOps
    accDescr: Um único host Debian executa K3s, Traefik, cert-manager e Argo CD. O Argo CD lê o repositório Git e reconcilia as Applications no mesmo cluster onde ele próprio roda.

    Admin["Estação administrativa<br/>kubectl, Helm, argocd CLI"]
    Git["Repositório Git<br/>gitops/"]

    subgraph Host["Host único (Debian)"]
        subgraph K3s["K3s (server + agent no mesmo nó)"]
            API["API do Kubernetes"]
            Etcd[("etcd embarcado")]
            Traefik["Traefik<br/>Gateway API provider"]
            CertManager["cert-manager"]
            ArgoCD["Argo CD"]
            Workloads["Pods das aplicações"]
        end
    end

    Admin -->|"kubectl / Helm"| API
    ArgoCD -->|"observa"| Git
    ArgoCD -->|"aplica manifests"| API
    API <--> Etcd
    Traefik -->|"encaminha HTTP/HTTPS"| Workloads
    CertManager -->|"grava Secret TLS"| Traefik
    Cliente["Cliente externo"] -->|"HTTPS"| Traefik
```yaml

O K3s roda com `cluster-init: true` mesmo em nó único, o que já deixa o control plane pronto para receber servidores adicionais no futuro sem reinstalação (veja [Fase 5 — multinó](../../../../../.todo/phase-5-multinode.md), fora do escopo deste blueprint). O mesmo host executa control plane, workloads, ingress e o próprio Argo CD — não há isolamento de papéis entre essas funções.

## Decisões adotadas

- **Sistema operacional:** Debian 12 (bookworm), instalação mínima. Motivo: pacote enxuto, ciclo de atualização de segurança previsível via `unattended-upgrades`, ampla compatibilidade com o instalador do K3s.
- **Firewall:** UFW por padrão (veja [firewall com UFW](../../../guides/tasks/host/configure-ufw/)); firewalld é uma alternativa documentada, não uma segunda camada simultânea.
- **CNI:** Flannel, empacotado com o K3s. Nenhuma decisão adicional de rede de Pods é necessária para nó único.
- **Ingress e Gateway:** Gateway API com Traefik como controller, em vez do Ingress-NGINX ou do provider de Ingress clássico do Traefik. Motivo: a Gateway API separa claramente Gateway (infraestrutura) de HTTPRoute (aplicação) e é o caminho que a comunidade Kubernetes está consolidando para expor serviços.
- **Certificados:** cert-manager com ACME e desafio DNS-01. Motivo: permite certificados wildcard e não exige que o serviço já esteja publicamente acessível durante a emissão.
- **Armazenamento:** decisão explicitamente fora deste blueprint — `local-storage` é desabilitado na instalação do primeiro servidor. Se os workloads precisarem de volumes persistentes, o [Longhorn](../../../guides/tasks/storage/install-longhorn/) é a opção coberta pelo notebook, mas sua adoção é decidida por cluster, não imposta por este blueprint.
- **Entrega contínua:** Argo CD com padrão App-of-Apps, rodando no mesmo cluster que gerencia. Motivo: elimina a necessidade de um cluster de gerenciamento separado, ao custo de o Argo CD depender do cluster que ele mesmo reconcilia.
- **Segredos:** o token do K3s e a chave privada ACME ficam armazenados no cluster; segredos de aplicação não são resolvidos por este blueprint mínimo — veja [Infisical](../../../guides/tasks/secrets/install-infisical/) como opção quando o caminho principal estiver validado.

## Limitações e pontos únicos de falha

Resumo — veja a página completa em [limitações e pontos únicos de falha](../k3s-single-node-gitops/limitations/):

- O host é um ponto único de falha para control plane, workloads, ingress e o próprio Argo CD.
- Uma falha de disco sem backup externo do snapshot do etcd e dos volumes é perda de dados irrecuperável.
- Não há tolerância a manutenção do host sem indisponibilidade do cluster inteiro.

## Sequência de implantação

1. [Preparar um servidor Debian](../../../guides/tasks/host/prepare-debian-server/) (hostname, DNS, horário, firewall, SSH, journal, atualizações, validação de requisitos).
2. [Instalar o primeiro servidor K3s](../../../guides/tasks/kubernetes/install-first-k3s-server/).
3. [Configurar o acesso administrativo (kubeconfig)](../../../guides/tasks/kubernetes/configure-kubeconfig/) e [validar o cluster](../../../guides/tasks/kubernetes/validate-k3s-cluster/).
4. [Gateway API e Traefik](../../../guides/tasks/networking/configure-traefik-gateway-api/).
5. [Instalar o cert-manager](../../../guides/tasks/certificates/install-cert-manager/) e [criar um ClusterIssuer ACME](../../../guides/tasks/certificates/create-acme-clusterissuer/).
6. [Instalar o Argo CD](../../../guides/tasks/gitops/install-argocd/) e seguir o [bootstrap GitOps](../../../guides/tasks/gitops/bootstrap-gitops/).
7. Selecionar, entre os [templates copiáveis](../k3s-single-node-gitops/templates/), somente os módulos necessários (armazenamento, observabilidade, segredos, banco de dados).

Detalhes de cada etapa, incluindo os checkpoints intermediários, estão em [implementação](../k3s-single-node-gitops/implementation/).

## Validação

Veja [validação](../k3s-single-node-gitops/validation/) para a checklist completa depois do bootstrap.

## Troubleshooting

Cada task guide referenciado na sequência de implantação tem sua própria seção de troubleshooting específica do componente. Para problemas que envolvem a interação entre componentes (ex.: certificado emitido mas Gateway não aceita o Secret), comece revisando o diagrama de arquitetura acima para identificar qual relação está quebrada antes de investigar cada componente isoladamente.

## Rollback

Não há rollback único para o blueprint inteiro — cada task guide documenta o rollback do componente correspondente. Para desfazer o cluster completo, veja [desinstalar o K3s](../../../guides/tasks/kubernetes/uninstall-k3s/), executado por último, depois de remover os componentes de plataforma instalados sobre ele.

## Operação, backup e recuperação

Veja [operação](../k3s-single-node-gitops/operations/) e [backup e recuperação](../k3s-single-node-gitops/backup-and-recovery/).

## Próximo passo

Depois do cluster-base funcionando, revise o [guia de operação contínua](../../../operations/checklists/cluster-operational-checklist/) para definir responsáveis, cadências e política de versões.

## Fontes e leitura adicional

- [K3s — Quick-Start Guide](https://docs.k3s.io/quick-start): instalação oficial do K3s usada como base deste blueprint.
- [Cluster bootstrapping — Argo CD](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/): padrão App-of-Apps adotado na etapa de GitOps.
- [Introdução à Gateway API](https://gateway-api.sigs.k8s.io/docs/introduction/): base da decisão de exposição de serviços deste blueprint.
