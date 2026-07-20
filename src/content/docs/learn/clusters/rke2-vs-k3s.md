---
title: RKE2 vs. K3s
description: Compara as duas distribuições Kubernetes leves da Rancher/SUSE por tamanho, componentes empacotados e compliance, para decidir qual usar em cada ambiente.
sidebar:
  order: 8
---

> **Para quem é:** operadores decidindo entre K3s e RKE2, as duas distribuições Kubernetes leves da Rancher/SUSE.

K3s e RKE2 vêm da mesma origem, mas fazem escolhas opostas sobre o que empacotar por padrão: K3s é minimalista e opinativo; RKE2 é mais completo e deixa mais escolhas para o operador.

| Critério | K3s | RKE2 |
| --- | --- | --- |
| Tamanho do binário | Dezenas de MB | Centenas de MB |
| Componentes empacotados | Flannel, Traefik | Nenhum por padrão; o operador escolhe CNI e ingress |
| Datastore | etcd embarcado | Configurável |
| Suporte a ARM64 | Nativo | Nativo |
| Ambiente de desenvolvimento | Ideal | Funciona, mas com mais overhead do que precisa |
| Produção | Funciona bem | Preferido quando compliance é um requisito |
| Hardening FIPS/CIS | Não incluído | Incluído |
| Certificações de compliance | Nenhuma | CIS, DISA, FedRAMP |

## K3s: opinativo e minimalista

K3s já vem com Flannel para rede e Traefik para ingress, e o etcd embarcado como datastore: as escolhas já estão feitas, o que acelera o início de qualquer cluster novo. Essa é a distribuição certa para desenvolvimento e testes, para clusters pequenos (até algumas dezenas de nós), e para quando as escolhas padrão do K3s já atendem ao ambiente. A contrapartida é que ele não vem com hardening FIPS ou CIS nativo e não é certificado para os frameworks de compliance que RKE2 cobre.

## RKE2: pensado para conformidade

RKE2 não empacota CNI, ingress nem storage por padrão: cada escolha é explícita, e a distribuição já vem com hardening de segurança alinhado ao CIS Benchmark, com suporte a FIPS e ao hardening do DISA. Isso o torna a escolha certa para produção com requisitos formais de compliance, para ambientes de segurança crítica, e para setores regulados (governo, saúde, finanças). O custo é operacional: sem Traefik empacotado, o setup inicial exige mais configuração manual, e o ambiente consome mais recursos do que um K3s equivalente.

## Decisão prática

Comece por K3s quando o objetivo for experimentar com Kubernetes, montar um laboratório ou prova de conceito, ou simplesmente priorizar um setup rápido. Migre para RKE2 quando compliance formal (CIS, FIPS) se tornar um requisito real, quando o ambiente de produção tiver exigências regulatórias, ou quando a equipe já tiver experiência suficiente com Kubernetes e uma estratégia clara de rede e storage definida com antecedência. Um padrão híbrido comum usa K3s em desenvolvimento e RKE2 em produção, mantendo a mesma configuração de aplicações, já que ambas expõem a mesma API Kubernetes e são agnósticas quanto ao CNI usado pelas aplicações.

## Outras distribuições

| Distribuição | Foco | Caso de uso típico |
| --- | --- | --- |
| kubeadm | Máxima flexibilidade | Aprender Kubernetes, DIY |
| k0s | Minimalista e modular | Edge, IoT |
| MicroK8s | Baseada em snap, Ubuntu | Desktop, laptop |
| Minikube | Desenvolvimento local | Aprendizado em laptop |

Veja [distribuições Kubernetes além de K3s e RKE2](../kubernetes-distributions/) para o detalhamento de cada uma, e [Kubernetes gerenciado vs. self-hosted](../managed-vs-selfhosted/) para a comparação com opções como EKS, GKE e AKS.

## Migrar de K3s para RKE2

Como as duas distribuições expõem a mesma API Kubernetes, migrar workloads de K3s para RKE2 segue o padrão de qualquer migração entre clusters: provisionar o RKE2 como um cluster novo, reaplicar os manifests das aplicações, e só então desligar o K3s original. Não é um upgrade in-place: é um redeploy em um cluster novo, o que também é uma oportunidade de reaproveitar o mesmo hardware depois da migração.

## Referências

- [K3s: documentação oficial](https://docs.k3s.io/): instalação e operação.
- [RKE2: documentação oficial](https://docs.rke2.io/): incluindo o hardening CIS.
- [Kubernetes: Production environment tools](https://kubernetes.io/docs/setup/): visão oficial das ferramentas de instalação.
