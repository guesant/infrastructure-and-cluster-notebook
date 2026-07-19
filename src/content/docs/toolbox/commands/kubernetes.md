---
title: Kubernetes
sidebar:
  order: 6
---

## Verificar status do cluster

```bash
kubectl cluster-info
kubectl get nodes
kubectl top nodes  # CPU/memória dos nós
```yaml

**Quando usar:** health check geral, saber se API está respondendo.

**Considerações:**

- `cluster-info`: mostra master, DNS, kubernetes-dashboard.
- `get nodes`: lista nós e status (Ready, NotReady).
- `top`: requer metrics-server.

**Relacionado:**

- [Listar pods](#listar-pods-e-status)
- [Verificar resources](#verificar-cpu-memória-de-um-pod)

---

## Listar pods e status

```bash
# Todos os namespaces
kubectl get pods -A

# Namespace específico
kubectl get pods -n default

# Detalhes (inclui IP, node)
kubectl get pods -o wide

# Apenas com erro
kubectl get pods --field-selector=status.phase!=Running
```yaml

**Quando usar:** ver quais pods estão rodando, encontrar crashed.

**Considerações:**

- `-A`: all namespaces.
- `-o wide`: mais informações (IP, node).
- `--field-selector`: filtrar por status.

**Relacionado:**

- [Ver logs de um pod](#ver-logs-de-um-pod)
- [Descrever pod](#descrever-um-pod)

---

## Ver logs de um pod

```bash
# Últimos logs
kubectl logs <pod-name>

# Follow (tail -f)
kubectl logs -f <pod-name>

# Últimas 100 linhas
kubectl logs <pod-name> --tail=100

# Container específico (se múltiplos)
kubectl logs <pod-name> -c <container-name>

# Pod anterior (se crashou)
kubectl logs <pod-name> --previous
```yaml

**Quando usar:** debugar aplicação, ver o que deu errado.

**Considerações:**

- Default: stdout/stderr.
- `-f`: segue logs em tempo real.
- `--previous`: útil após restart.

**Relacionado:**

- [Descrever um pod](#descrever-um-pod)
- [Executar comando em pod](#executar-comando-em-um-pod)

---

## Descrever um pod

```bash
kubectl describe pod <pod-name>

# Namespace específico
kubectl describe pod <pod-name> -n myapp

# Ver eventos recentes
kubectl describe pod <pod-name> | grep -A 10 Events:
```yaml

**Quando usar:** ver detalhes, encontrar por que pod não started (image pull error, etc).

**Considerações:**

- Mostra: volumes, env vars, image, resource requests/limits.
- **Events**: histórico recente do pod (pull failures, restarts, etc).

**Relacionado:**

- [Listar pods](#listar-pods-e-status)
- [Ver logs](#ver-logs-de-um-pod)

---

## Executar comando em um pod

```bash
# Interactive shell
kubectl exec -it <pod-name> -- /bin/bash

# Comando único
kubectl exec <pod-name> -- env

# Container específico
kubectl exec -it <pod-name> -c <container-name> -- /bin/bash
```yaml

**Quando usar:** debugar dentro do pod, inspecionar filesystem.

**Considerações:**

- `-it`: interactive + TTY.
- `--`: separa flags do kubectl do comando real.
- Container precisa ter o binário (bash, sh, etc).

**Relacionado:**

- [Ver logs](#ver-logs-de-um-pod)
- [Port-forward](#port-forward-para-um-pod)

---

## Port-forward para um pod

```bash
# Pod local:3000 → container:8080
kubectl port-forward <pod-name> 3000:8080

# Todos os IPs
kubectl port-forward <pod-name> 3000:8080 --address 0.0.0.0

# Service (mais comum)
kubectl port-forward svc/<service-name> 3000:8080
```yaml

**Quando usar:** acessar serviço interno via localhost, debug.

**Considerações:**

- Default: escuta 127.0.0.1 (localhost só).
- `--address 0.0.0.0`: qualquer interface.
- Bloqueia o terminal; use `&` para background.

**Relacionado:**

- [Executar comando em pod](#executar-comando-em-um-pod)
- [Acessar serviço](#acessar-um-serviço-interno)

---

## Acessar um serviço interno

```bash
# DNS interno (dentro de pod)
curl http://<service-name>:<port>

# FQDN completo
curl http://<service-name>.<namespace>.svc.cluster.local:<port>

# Port-forward (do host)
kubectl port-forward svc/<service-name> 8080:80
# Depois: curl http://localhost:8080
```yaml

**Quando usar:** testar conectividade entre serviços, debug.

**Considerações:**

- DNS: `<service>.<namespace>.svc.cluster.local`.
- Dentro de pods: pode omitir namespace.
- CoreDNS resolve automaticamente.

**Relacionado:**

- [Port-forward](#port-forward-para-um-pod)

---

## Verificar CPU/memória de um pod

```bash
# Um pod
kubectl top pod <pod-name>

# Todos
kubectl top pods -A

# Namespace específico
kubectl top pods -n myapp

# Ordenar por uso
kubectl top pods --sort-by=memory
```yaml

**Quando usar:** diagnosticar OOM (out of memory), CPU throttling.

**Considerações:**

- Requer metrics-server.
- Mostra uso atual, não histórico.

**Relacionado:**

- [Descrever um pod](#descrever-um-pod)
- [Ver limits de um pod](#ver-cpu-memória-limits)

---

## Ver CPU/memória limits

```bash
# Requests/limits
kubectl get pod <pod-name> -o yaml | grep -A 5 resources:

# Ou usar describe
kubectl describe pod <pod-name> | grep -A 3 "Limits\|Requests"
```yaml

**Quando usar:** verificar se pod tem resource limits, prevenir OOM.

**Considerações:**

- Requests: garantido, limite inferior.
- Limits: máximo que pode usar, OOM se exceder.

**Relacionado:**

- [Verificar CPU/memória](#verificar-cpumemória-de-um-pod)
