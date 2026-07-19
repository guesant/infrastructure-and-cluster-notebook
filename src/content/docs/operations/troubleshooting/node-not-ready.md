---
title: Nó NotReady
sidebar:
  order: 1
---

> **Sintoma:** `kubectl get nodes` mostra um nó como `NotReady`.
> **Versões testadas:** K3s v1.36.1+k3s1.

Um nó `NotReady` deixou de reportar heartbeats saudáveis ao control plane. Em um cluster single-node, isso significa que o cluster inteiro está efetivamente indisponível — trate como incidente imediato, não como item de rotina.

## Diagnóstico inicial

> **Executar em:** estação administrativa com kubeconfig.

```bash
kubectl get nodes
kubectl describe node <nome-do-nó>
```yaml

A seção `Conditions` do `describe` mostra a causa mais provável: `MemoryPressure`, `DiskPressure`, `PIDPressure` ou `Ready: Unknown` (perda de comunicação com o kubelet).

## Se `Ready: Unknown`

O control plane não recebe heartbeats do kubelet. Verifique no próprio host:

> **Executar em:** o nó, como `root`.

```bash
systemctl status k3s
journalctl -u k3s -n 100 --no-pager
```yaml

Causas comuns: serviço K3s parado, falha de rede entre o kubelet e a API (relevante em multinó; irrelevante quando API e kubelet estão no mesmo host), ou o host inteiro sem resposta (verifique via console/hypervisor, não apenas SSH).

## Se `DiskPressure` ou `MemoryPressure`

Siga [revisão de capacidade de disco](../../maintenance/disk-capacity-review/) para disco. Para memória, identifique o consumidor:

```bash
free --human
kubectl top nodes 2>/dev/null || true
```yaml

## Verificar horário

Um relógio desalinhado pode causar falhas de heartbeat e de validação TLS entre componentes:

```bash
timedatectl status
```yaml

Veja [configurar sincronização de horário](../../../guides/tasks/host/configure-time-synchronization/) se o relógio estiver dessincronizado.

## Recuperação

Na maioria dos casos, reiniciar o serviço resolve um estado travado:

```bash
systemctl restart k3s
```yaml

Se o problema persistir após reinício e a causa não for óbvia pelos logs, considere [drenar e reintegrar o nó](../../maintenance/drain-and-uncordon-node/) — mas em nó único não há para onde drenar; priorize corrigir o host diretamente.

## Quando escalar para disaster recovery

Se o host não voltar de forma alguma (hardware perdido, disco corrompido), siga [reconstruir um cluster single-node](../../disaster-recovery/rebuild-single-node-cluster/) em vez de continuar tentando recuperar o host original.

## Fontes e leitura adicional

- [Kubernetes — Node-pressure Eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/): documenta as condições que levam a `NotReady`.
