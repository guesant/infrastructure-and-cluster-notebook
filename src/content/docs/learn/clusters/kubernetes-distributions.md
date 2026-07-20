---
title: Distribuições Kubernetes além de K3s e RKE2
description: Apresenta k0s, kubeadm e MicroK8s como alternativas a K3s e RKE2 para cenários específicos (edge, aprendizado, desktop), e quando cada uma se aplica.
sidebar:
  order: 11
---

> **Para quem é:** operadores explorando alternativas a K3s e RKE2 para casos específicos (edge, máquinas locais, aprendizado).

Kubernetes é uma especificação; cada distribuição a implementa com opiniões diferentes sobre o que empacotar e o que deixar para o operador escolher. Além de K3s e RKE2 (veja [RKE2 vs. K3s](../rke2-vs-k3s/)), outras distribuições otimizam para cenários distintos.

| Distribuição | Foco | Tamanho aproximado | Deploy |
| --- | --- | --- | --- |
| K3s | Minimalista, desenvolvimento e produção pequena | Dezenas de MB | Segundos |
| RKE2 | Produção com compliance | Centenas de MB | Minutos |
| k0s | Modular, edge | Próximo de K3s | Minutos |
| kubeadm | Bootstrap manual, aprendizado | Sem componentes bundlados | Manual |
| MicroK8s | Desktop e laptop | Da ordem de 1GB | Um comando (snap) |

## k0s: modular e leve

k0s é a distribuição minimalista da Mirantis, distribuída como um binário único e altamente customizável: cada componente (controllers, sidecars) pode ser removido conforme a necessidade. Isso o torna adequado para IoT e edge computing, onde os recursos de hardware são limitados e a customização compensa o esforço extra de configuração. Em troca dessa flexibilidade, k0s é menos maduro que K3s e tem uma comunidade menor, o que se traduz em menos exemplos e integrações prontas para copiar.

## kubeadm: bootstrap manual

kubeadm é a ferramenta oficial de bootstrap do Kubernetes: ela não empacota rede, storage nem ingress, deixando cada escolha explícita para o operador. Essa falta de opinião é exatamente o que torna kubeadm valioso para quem quer aprender Kubernetes a fundo ou precisa de customização extrema em um ambiente inteiramente on-premises, sem provedor de nuvem. O custo é operacional: o setup é manual em cada etapa, e o troubleshooting exige entender como cada peça (CNI, CSI, ingress) foi montada manualmente.

## MicroK8s: um comando

MicroK8s empacota Kubernetes como um pacote snap, com etcd, CNI e complementos já integrados, instalado com um único comando (`snap install microk8s`) em qualquer distribuição Linux que suporte snap. Complementos como GPU, ingress e storage se habilitam individualmente, o que o torna conveniente para desenvolvimento local e demonstrações rápidas em um laptop. Ele depende do ecossistema snap (limitando-o efetivamente a Linux) e não é pensado para escalar além de uso local ou de demonstração.

## Comparação entre kubeadm, k0s e K3s

| Aspecto | kubeadm | k0s | K3s |
| --- | --- | --- | --- |
| Setup | Manual | Automatizado | Trivial |
| Curva de aprendizado | Alta | Média | Baixa |
| Customização | Total | Alta | Média |
| Pronto para produção | Sim, se operado com cuidado | Sim | Sim |
| Módulos da comunidade | Muitos | Alguns | Muitos |

## Decisão prática

K3s continua sendo o ponto de partida deste notebook: minimalista, rápido de implantar e suficiente para a maioria dos cenários cobertos aqui. Use kubeadm quando o objetivo for aprender Kubernetes a fundo ou operar em um ambiente on-premises com exigências muito específicas de composição. Use k0s quando o ambiente for de borda ou IoT, com restrição real de recursos, e a modularidade compensar a comunidade menor. Use MicroK8s quando o objetivo for puramente desenvolvimento local em uma máquina que já tem snap disponível.

Outras distribuições gerenciadas seguem o mesmo modelo do [EKS](../eks-overview/): AKS (Azure) e GKE (Google) delegam o control plane ao provedor de nuvem da mesma forma, e o DigitalOcean Kubernetes oferece uma versão gerenciada mais simples para quem já usa esse provedor. Talos, uma distribuição que integra o sistema operacional e o Kubernetes em um único projeto, permanece uma opção experimental fora do escopo coberto por este notebook.

## Próximas seções

- [RKE2 vs. K3s](../rke2-vs-k3s/): comparação detalhada entre as duas distribuições usadas neste notebook.

## Referências

- [k0s: documentação oficial](https://docs.k0sproject.io/): guia oficial.
- [Kubernetes: Installing kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/): referência oficial da especificação.
- [MicroK8s: documentação oficial](https://microk8s.io/docs): guia oficial.
