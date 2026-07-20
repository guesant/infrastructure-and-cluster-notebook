---
title: Kubernetes gerenciado vs. self-hosted
description: Compara Kubernetes gerenciado (EKS, GKE, AKS) com self-hosted (K3s, RKE2) por responsabilidade operacional, custo e portabilidade.
sidebar:
  order: 12
---

> **Para quem é:** organizações escolhendo entre Kubernetes gerenciado (na nuvem) e self-hosted (on-premises ou em VMs).

A API do Kubernetes é a mesma nos dois modelos, mas a experiência operacional muda de forma radical conforme quem assume o control plane.

## Kubernetes gerenciado

Provedores como AWS EKS, Google GKE, Azure AKS, DigitalOcean Kubernetes e Linode Kubernetes Engine operam o control plane (API Server, etcd, controllers), aplicam patches e upgrades, e normalmente já entregam alta disponibilidade multi-zona por padrão. O operador continua responsável pelos worker nodes (às vezes nem isso, em modelos serverless como o Fargate da AWS), pelas aplicações e pela segurança dentro delas. Veja [visão geral do EKS](../eks-overview/) para o detalhamento de um provedor específico.

## Self-hosted (K3s, RKE2)

Em um cluster self-hosted, a equipe é responsável por tudo: a infraestrutura (VMs, rede, storage), o control plane (os próprios servidores K3s ou RKE2), o datastore (etcd embarcado ou externo, veja [etcd embarcado versus datastore externo](../embedded-vs-external-datastore/)) e os patches e upgrades. Em troca, a equipe controla diretamente o custo (paga pela VM, não por uma taxa de control plane), evita o lock-in de um provedor específico, e ajusta a configuração exatamente ao que o ambiente exige.

## Custo

O modelo gerenciado soma uma taxa fixa pelo control plane ao custo dos nós; o modelo self-hosted paga apenas pelos nós, mas assume o custo de operação (tempo de trabalho) de manter o control plane no ar. A comparação financeira exata depende do provedor, da região e do tamanho do cluster, e muda com frequência: use a calculadora de preços oficial de cada provedor (por exemplo, a [calculadora do EKS](https://aws.amazon.com/eks/pricing/)) para uma estimativa atual, em vez de um número fixo. Como referência de ordem de grandeza, a taxa do control plane gerenciado costuma representar uma fração significativa do custo total em clusters pequenos (poucos nós), e proporcionalmente menor à medida que o cluster cresce.

## Comparação

| Critério | Gerenciado | Self-hosted |
| --- | --- | --- |
| Setup | Minutos, via console | Minutos, via script de instalação |
| Esforço operacional | Baixo | Médio a alto |
| Custo | Maior (control plane + nós) | Menor (só os nós, mais tempo de operação) |
| Lock-in | Preso ao provedor de nuvem | Nenhum |
| Portabilidade multi-nuvem | Não | Sim |
| Compliance | Certificações nativas do provedor | Sob controle e responsabilidade da equipe |
| Escala | Praticamente ilimitada pelo provedor | Limitada pela infraestrutura própria |
| Alta disponibilidade | Automática, por padrão | Manual (veja [alta disponibilidade avançada](../advanced-ha/)) |
| Especialização exigida da equipe | Baixa | Média a alta |

## Quando o modelo gerenciado é a escolha certa

Quando a organização já opera na nuvem do provedor em questão, quer delegar a operação do control plane por não ter um especialista em Kubernetes dedicado, precisa de um SLA formal de alta disponibilidade, ou tem uma equipe pequena demais para assumir a operação completa de um cluster. Não é a escolha certa quando portabilidade entre nuvens é um requisito, o orçamento é apertado, o ambiente é inteiramente on-premises, ou a exigência de compliance não se encaixa nas certificações que o provedor de nuvem oferece.

## Quando self-hosted é a escolha certa

Quando o ambiente é on-premises ou precisa ser portável entre múltiplos provedores, quando controlar cada detalhe da configuração é uma prioridade, quando o orçamento favorece pagar apenas pela infraestrutura, ou quando a equipe já tem experiência operacional suficiente para assumir o control plane. Não é a escolha certa quando o objetivo é overhead operacional zero, quando a exigência de compliance já é melhor atendida por um provedor de nuvem específico, ou em escalas muito além do que a infraestrutura própria comporta com conforto.

## Padrão híbrido

Uma combinação comum usa K3s local para desenvolvimento e testes, RKE2 self-hosted para staging em VMs dedicadas, e um provedor gerenciado como EKS para produção, onde alta disponibilidade e compliance pesam mais. A arquitetura das aplicações permanece portável (os mesmos manifests Kubernetes), enquanto a operação de cada ambiente é ajustada ao que ele realmente precisa.

## Migrar de self-hosted para gerenciado

Como a API é a mesma, migrar workloads de um cluster self-hosted para um gerenciado normalmente segue os mesmos passos de qualquer migração entre clusters Kubernetes: provisionar o cluster de destino, aplicar os mesmos manifests, redirecionar o tráfego, e só então desligar o cluster de origem, mantendo-o disponível por um período como plano de contingência. O tempo total depende muito do volume de dados a migrar (o datastore de aplicações costuma dominar essa estimativa, não o control plane em si).

## Referências

- [AWS: preços do EKS](https://aws.amazon.com/eks/pricing/): calculadora oficial.
- [Google Cloud: preços do GKE](https://cloud.google.com/kubernetes-engine/pricing): calculadora oficial.
- [K3s: documentação oficial](https://docs.k3s.io/): referência do modelo self-hosted usado neste notebook.
