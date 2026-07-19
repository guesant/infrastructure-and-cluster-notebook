---
title: PersistentVolumes na prática
description: Explica modos de acesso, política de reclamação e o ciclo de vida de binding entre PersistentVolume e PersistentVolumeClaim.
sidebar:
  order: 2
---

> **Para quem é:** quem já entende o [modelo de armazenamento do Kubernetes](../kubernetes-storage-model/) e precisa configurar corretamente os detalhes de um PVC.

Um PVC mal configurado costuma falhar de duas formas: fica `Pending` porque nenhum PV compatível existe, ou é vinculado a um PV com um modo de acesso que não atende à aplicação (múltiplos Pods tentando escrever em um volume `ReadWriteOnce`, por exemplo).

## Como funciona

**Modos de acesso** definem quantos nós podem montar o volume simultaneamente e com qual permissão:

| Modo | Significado |
| --- | --- |
| `ReadWriteOnce` (RWO) | Um único nó pode montar para leitura e escrita. |
| `ReadOnlyMany` (ROX) | Vários nós podem montar somente para leitura. |
| `ReadWriteMany` (RWX) | Vários nós podem montar para leitura e escrita simultaneamente. |
| `ReadWriteOncePod` | Um único Pod (não apenas um nó) pode montar para leitura e escrita. |

Nem todo provisionador suporta todos os modos. O Longhorn, usado neste notebook, oferece RWO nativamente; RWX depende de um componente adicional (`share-manager`) e tem características de desempenho diferentes — não assuma RWX disponível sem verificar.

**Política de reclamação** (`reclaimPolicy`) decide o que acontece com o PV quando o PVC associado é excluído:

- `Delete`: o PV e os dados subjacentes são removidos junto com o PVC — a política padrão da maioria dos provisionadores dinâmicos.
- `Retain`: o PV permanece após a exclusão do PVC, em estado `Released`, exigindo limpeza manual antes de ser reutilizado.

```mermaid
flowchart LR
    accTitle: Ciclo de vida de binding entre PVC e PV
    accDescr: Um PVC criado permanece Pending até um PV compatível ser encontrado ou provisionado; após o bind, ambos ficam Bound; a exclusão do PVC aciona a política de reclamação do PV associado.

    Created["PVC criado"] -->|"provisionador cria PV compatível"| Pending["PVC: Pending"]
    Pending -->|"bind"| Bound["PVC e PV: Bound"]
    Bound -->|"PVC excluído"| Policy{"reclaimPolicy"}
    Policy -->|"Delete"| Removed["PV e dados removidos"]
    Policy -->|"Retain"| Released["PV: Released (dados preservados)"]
```yaml

Escolher `Retain` para dados críticos evita exclusão acidental por um `kubectl delete pvc` equivocado, ao custo de exigir limpeza manual de PVs órfãos.

## Alternativas

Para dados que não precisam sobreviver à exclusão do workload que os criou (caches, dados de teste), `Delete` é a escolha mais simples e evita acúmulo de PVs órfãos.

## Quando usar `Retain`

Bancos de dados e qualquer volume cuja perda acidental seria grave. Combine com um processo de revisão periódica de PVs `Released` — eles não aparecem como "problema" em um `kubectl get pvc` porque o PVC já não existe mais.

## Quando evitar

Não use `ReadWriteMany` como padrão "por segurança" quando a aplicação só precisa de RWO — RWX geralmente tem overhead maior e nem todo provisionador o suporta igualmente bem.

## Decisões que isso implica

A escolha do modo de acesso e da política de reclamação deveria ser feita ao criar a `StorageClass` ou o PVC, não descoberta depois de um incidente. Veja [criar uma StorageClass](../../../guides/tasks/storage/create-storage-class/).

## Páginas relacionadas

- [Modelo de armazenamento do Kubernetes](../kubernetes-storage-model/)
- [Expandir um PersistentVolume](../../../guides/tasks/storage/expand-persistent-volume/)

## Referências

- [Kubernetes — Persistent Volumes: Access Modes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes): referência completa dos modos de acesso.
- [Kubernetes — Reclaiming](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaiming): documenta `Retain`, `Delete` e o estado `Released`.
