---
title: Implementação
sidebar:
  order: 5
---

Esta página detalha a sequência de implantação resumida em [visão geral do blueprint](../k3s-single-node-gitops/), com o checkpoint de cada etapa. Não repete os comandos; cada linha aponta para o task guide canônico.

## 1. Host

Siga [preparar um servidor Debian](../../../guides/tasks/host/prepare-debian-server/), que por sua vez encadeia hostname, DNS, sincronização de horário, firewall, hardening de SSH, journal persistente, desabilitação de serviços desnecessários, atualizações automáticas e validação de requisitos.

**Checkpoint:** [validar requisitos do host](../../../guides/tasks/host/validate-host-requirements/) não reporta pendência.

## 2. Cluster K3s

[Instalar o primeiro servidor K3s](../../../guides/tasks/kubernetes/install-first-k3s-server/).

**Checkpoint:** `k3s kubectl get nodes` mostra o nó `Ready`.

## 3. Acesso administrativo

[Configurar o acesso remoto (kubeconfig)](../../../guides/tasks/kubernetes/configure-kubeconfig/) e [validar o cluster](../../../guides/tasks/kubernetes/validate-k3s-cluster/).

**Checkpoint:** a checklist de [validar o cluster](../../../guides/tasks/kubernetes/validate-k3s-cluster/#checklist-resumido) está toda marcada.

## 4. Rede e exposição

[Gateway API e Traefik](../../../guides/tasks/networking/configure-traefik-gateway-api/).

**Checkpoint:** os CRDs da Gateway API existem e o Deployment do Traefik está `Running` com o provider `kubernetesGateway` habilitado.

## 5. Certificados

[Instalar o cert-manager](../../../guides/tasks/certificates/install-cert-manager/) e [criar um ClusterIssuer ACME](../../../guides/tasks/certificates/create-acme-clusterissuer/).

**Checkpoint:** o `ClusterIssuer` aparece com `READY: True`.

## 6. GitOps

[Instalar o Argo CD](../../../guides/tasks/gitops/install-argocd/) e seguir o [bootstrap GitOps](../../../guides/tasks/gitops/bootstrap-gitops/) (acesso, estruturação do repositório, conexão quando privado, Application raiz).

**Checkpoint:** a Application `root` e as Applications escolhidas aparecem `Synced`/`Healthy`.

## 7. Módulos opcionais

Selecione entre os [templates copiáveis](../k3s-single-node-gitops/templates/) apenas os módulos necessários: armazenamento, observabilidade, segredos, banco de dados. Cada módulo é uma Application independente; habilitar um não obriga a habilitar os demais.

**Checkpoint:** cada Application habilitada está `Synced`/`Healthy` e sua validação específica (na página do respectivo task guide) foi executada.

## Fontes e leitura adicional

- [K3s: Quick-Start Guide](https://docs.k3s.io/quick-start): fluxo oficial de instalação usado como base desta sequência.
