---
title: Revisão de capacidade de disco
sidebar:
  order: 4
---

> **Pré-requisitos:** acesso ao host e/ou kubeconfig administrativo.
> **Versões testadas:** K3s v1.36.1+k3s1.

Um host sem espaço em disco disponível para o K3s começa a evictar Pods (`DiskPressure`), pode corromper o datastore do etcd em escrita e impede a criação de novos snapshots. Revise a capacidade de disco periodicamente, não apenas quando um alerta já disparou.

## Verificar o disco do host

> **Executar em:** cada nó.

```bash
df --human /var/lib/rancher /var/lib/kubelet /var/lib/longhorn 2>/dev/null
du --human --max-depth=1 /var/lib/rancher/k3s/agent/containerd 2>/dev/null | sort -rh | head -n10
```yaml

`/var/lib/rancher` contém o datastore do K3s e as imagens de container; `/var/lib/longhorn`, se presente, contém os dados replicados do Longhorn. Cada um merece atenção separada — um cheio pelo outro é um sintoma comum.

## Verificar pressão de disco relatada pelo Kubernetes

> **Executar em:** estação administrativa com kubeconfig.

```bash
kubectl get nodes -o json | \
  python3 -c 'import json,sys; [print(n["metadata"]["name"], c) for n in json.load(sys.stdin)["items"] for c in n["status"]["conditions"] if c["type"] == "DiskPressure"]'
```yaml

Um nó com `DiskPressure: True` já está evictando Pods de baixa prioridade — trate como incidente, não como item de rotina.

## Limpar imagens de container não utilizadas

O containerd usado pelo K3s remove imagens órfãs automaticamente sob pressão de disco, mas uma limpeza proativa evita chegar a esse ponto:

> **Executar em:** o nó, como `root`.

```bash
k3s crictl rmi --prune
```yaml

## Verificar volumes persistentes

Se o Longhorn estiver instalado, revise a capacidade agregada e por nó pela interface do Longhorn ou:

> **Executar em:** estação administrativa com kubeconfig.

```bash
kubectl --namespace longhorn-system get nodes.longhorn.io -o wide
```yaml

## Checklist

- [ ] `/var/lib/rancher` tem margem livre suficiente para o crescimento esperado do datastore e das imagens.
- [ ] Nenhum nó reporta `DiskPressure: True`.
- [ ] Imagens de container não utilizadas foram limpas quando aplicável.
- [ ] Volumes persistentes (Longhorn ou outro) têm capacidade livre compatível com o crescimento planejado.
- [ ] Existe alerta configurado para consumo de disco acima de um limite definido (veja [observabilidade e alertas](../../observability/observability-and-alerting/)).

## Troubleshooting

Se o disco encher rapidamente sem explicação óbvia, verifique logs do journal não rotacionados (`journalctl --disk-usage`, veja [journal persistente](../../../guides/tasks/host/configure-persistent-journal/)) e snapshots do etcd acumulados sem limpeza (`k3s etcd-snapshot list` e `etcd-snapshot-retention` em `config.yaml`).

## Próximo passo

Registre a revisão no [runbook de manutenção](../maintenance-runbook/).

## Fontes e leitura adicional

- [Kubernetes — Node-pressure Eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/): documenta `DiskPressure` e o comportamento de eviction do kubelet.
- [K3s — `crictl`](https://docs.k3s.io/cli/crictl): referência do `crictl` empacotado com o K3s, incluindo `rmi --prune`.
