---
title: Limitações e pontos únicos de falha
sidebar:
  order: 10
---

Este blueprint prioriza simplicidade e custo sobre disponibilidade. Cada limitação abaixo é uma consequência direta das [decisões adotadas](../k3s-single-node-gitops/#decisões-adotadas), não um defeito a ser corrigido: para eliminá-las, é necessário migrar para uma topologia diferente (veja "O que este blueprint não resolve" abaixo).

## Pontos únicos de falha

- **O host físico ou virtual.** Control plane, workloads, ingress e o próprio Argo CD rodam na mesma máquina. A perda do host interrompe o cluster inteiro, sem failover automático para outro nó.
- **O disco que armazena o etcd.** Sem um snapshot copiado para fora do host, a perda do disco é perda de dados irrecuperável; veja [backup e recuperação](../k3s-single-node-gitops/backup-and-recovery/).
- **A conectividade de rede do host.** Não há um segundo caminho de rede; uma falha de rede isola o cluster inteiro, incluindo o acesso administrativo.
- **O Argo CD reconciliando a si mesmo.** Como ele roda no cluster que gerencia, uma falha da API interrompe também a reconciliação; não há um cluster de gerenciamento externo para intervir.

## O que este blueprint não resolve

- **Alta disponibilidade do control plane.** `cluster-init: true` deixa o cluster pronto para receber mais managers, mas este blueprint não os configura nem testa o comportamento de quorum.
- **Distribuição de carga entre nós.** Todo o processamento acontece em uma única máquina; não há como isolar workloads ruidosos de componentes de plataforma sensíveis.
- **Tolerância a manutenção sem indisponibilidade.** Qualquer atualização que exija reiniciar o K3s ou o host interrompe o cluster inteiro durante a operação.
- **DNS interno, mTLS ou Cloudflare Tunnel.** Ficam fora do caminho mínimo coberto aqui; podem ser adicionados depois sem conflito com as decisões deste blueprint.

## Quando este blueprint não é adequado

Se o ambiente já tem um requisito de disponibilidade que não tolera a indisponibilidade completa do cluster durante uma manutenção planejada ou uma falha de host, este não é o blueprint certo. Considere uma topologia HA com etcd embarcado (fora do escopo atual do notebook) ou um provedor gerenciado.

## Fontes e leitura adicional

- [K3s: High Availability Embedded etcd](https://docs.k3s.io/datastore/ha-embedded): descreve o caminho de expansão para uma topologia que remove o ponto único de falha do control plane.
