---
title: Variáveis do blueprint
sidebar:
  order: 4
---

Referência única dos valores que precisam ser decididos antes ou durante a implantação. Cada task guide pede esses valores no momento em que são necessários; esta página existe para revisá-los juntos antes de começar.

| Variável | Onde é usada | Observação |
| --- | --- | --- |
| Hostname do nó | [Configurar o hostname](../../../guides/tasks/host/configure-hostname/) | Único no cluster, mesmo em nó único. |
| IP do nó | [Instalar o primeiro servidor](../../../guides/tasks/kubernetes/install-first-k3s-server/) | Usado em `node-ip` e `tls-san`. |
| Host/IP estável da API | [Instalar o primeiro servidor](../../../guides/tasks/kubernetes/install-first-k3s-server/) | Endereço que clientes e outros nós usarão para alcançar a API; incluído em `tls-san`. |
| Token do cluster | [Instalar o primeiro servidor](../../../guides/tasks/kubernetes/install-first-k3s-server/) | Gerado automaticamente pelo formulário; guarde em um gerenciador de segredos. |
| Versão do K3s | [Instalar o primeiro servidor](../../../guides/tasks/kubernetes/install-first-k3s-server/) | Fixe a versão testada; veja [convenções e versões](../../../reference/conventions/). |
| Versão da Gateway API | [Gateway API e Traefik](../../../guides/tasks/networking/configure-traefik-gateway-api/) | CRDs Standard. |
| Versão do cert-manager | [Instalar o cert-manager](../../../guides/tasks/certificates/install-cert-manager/) | Fixe a versão testada. |
| E-mail de contato ACME | [Criar um ClusterIssuer ACME](../../../guides/tasks/certificates/create-acme-clusterissuer/) | Usado pelo Let's Encrypt para avisos de expiração/problemas. |
| Credencial do provedor DNS | [Criar um ClusterIssuer ACME](../../../guides/tasks/certificates/create-acme-clusterissuer/) | Token de API com permissão de escrita na zona; nunca versionado. |
| Versão do chart Argo CD | [Instalar o Argo CD](../../../guides/tasks/gitops/install-argocd/) | Fixe a versão testada. |
| URL do repositório GitOps | [Estruturar o repositório GitOps](../../../guides/tasks/gitops/structure-gitops-repository/) | Substitui a URL de exemplo em todos os manifests. |
| Chave SSH do Argo CD | [Conectar o repositório Git](../../../guides/tasks/gitops/connect-git-repository/) | Somente para repositório privado; dedicada, não pessoal. |

## Checkpoint

Cada variável relevante ao escopo escolhido (nem todo cluster usa todos os módulos opcionais) está decidida e, quando sensível, registrada em um gerenciador de segredos, não em texto claro no repositório ou em anotações locais.

## Fontes e leitura adicional

- [Escopo, convenções e versões](../../../reference/conventions/): versões de referência usadas por padrão nos formulários deste notebook.
