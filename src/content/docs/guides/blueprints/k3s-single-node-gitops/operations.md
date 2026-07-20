---
title: Operação
sidebar:
  order: 8
---

Este blueprint não define seus próprios procedimentos de operação: ele adota os runbooks gerais de `operations/`, com as observações específicas de nó único abaixo.

## Rotinas recomendadas

| Rotina | Página canônica | Observação para nó único |
| --- | --- | --- |
| Atualização do K3s | [Atualizar o K3s (nó único)](../../../operations/upgrades/upgrade-k3s-single-node/) | Não há outro nó para absorver carga durante o reinício; planeje uma janela de indisponibilidade. |
| Registro de mudanças | [Runbook de manutenção](../../../operations/maintenance/maintenance-runbook/) | Registre também mudanças no repositório GitOps, não só no host. |
| Checklist contínuo | [Guia de operação contínua](../../../operations/checklists/cluster-operational-checklist/) | Use como base para definir cadência de backup e teste de recuperação. |
| Observabilidade | [Observabilidade e alertas](../../../operations/observability/observability-and-alerting/) | Sem outro nó, um alerta de recurso do host é também um alerta de risco para o cluster inteiro. |

## Particularidades do nó único

Qualquer operação que exija reiniciar o serviço K3s ou o host (atualização de versão, mudança de `config.yaml`, atualização de kernel) interrompe o cluster inteiro durante a operação, incluindo o próprio Argo CD. Não há um segundo manager para atender requisições enquanto o único nó está indisponível.

Planeje manutenções em uma janela comunicada, mesmo em ambiente pessoal, e confirme que o snapshot mais recente do etcd é anterior à mudança antes de iniciar qualquer atualização. Veja [backup e recuperação](../k3s-single-node-gitops/backup-and-recovery/).

## Fontes e leitura adicional

- [K3s: Cluster Datastore](https://docs.k3s.io/datastore): comportamento do datastore relevante para janelas de manutenção em nó único.
