---
title: DNS
sidebar:
  order: 3
---

## Testar resolução de domínio

```bash
nslookup example.com
# ou
dig example.com
# ou
host example.com
```

**Quando usar:** verificar que um domínio resolve, descobrir IP de um host.

**Considerações:**

- `nslookup` usa `/etc/resolv.conf`.
- `dig` mostra mais detalhes (TTL, tipo de record).
- `host` é mais breve.

---

## Listar servidor DNS configurado

```bash
cat /etc/resolv.conf
# ou (systemd-resolved)
resolvectl status
```

**Quando usar:** confirmar qual resolver está em uso (Google 8.8.8.8, Cloudflare, local, etc.).

**Considerações:**

- `/etc/resolv.conf` pode ser gerado automaticamente por systemd-resolved.
- Em systemd: `resolvectl` mostra config por interface.

---

## Resolver para um nameserver específico

```bash
dig @8.8.8.8 example.com
# Força uso do Google DNS (8.8.8.8)
```

**Quando usar:** testar se um nameserver específico responde, contornar cache local.

**Considerações:**

- `@<IP>` especifica o resolver.
- Útil para diagnóstico de DNS distribuído.

---

## Listar todos os records de um domínio

```bash
dig example.com ANY
# ou com short output
dig +short example.com

# Específico: só A records
dig +short example.com A

# Todos: A, AAAA, MX, NS, TXT
dig example.com +nocmd +noall +answer
```

**Quando usar:** auditoria de zona, descobrir todos os IPs/aliases.

**Considerações:**

- `ANY` pode ser bloqueado por alguns nameservers (política).
- `+short` é mais legível.
- `+nocmd +noall +answer` mostra só answers.

---

## Verificar record MX, TXT, CNAME

```bash
# Mail servers (MX)
dig example.com MX

# Text records (TXT) — DKIM, SPF, etc.
dig example.com TXT

# Aliases (CNAME)
dig example.com CNAME
```

**Quando usar:** validar email infrastructure, verificar SPF/DKIM, resolver aliases.

**Considerações:**

- MX: lower preference = higher priority (confuso!).
- TXT: inclui SPF, DKIM, DMARC, verificação de domínio.
- CNAME: não pode existir junto com A record.

---

## Testar conectividade DNS interno (K3s)

```bash
# De um pod no cluster
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- \
  nslookup kubernetes.default.svc.cluster.local

# ou dentro de um container
docker exec <container> nslookup myservice

# Verificar CoreDNS
kubectl get svc -n kube-system coredns
kubectl logs -n kube-system -l k8s-app=kube-dns
```

**Quando usar:** diagnosticar resolução de services internas, verificar CoreDNS.

**Considerações:**

- FQDN em K3s: `<service>.<namespace>.svc.cluster.local`.
- CoreDNS responde na porta 53 (UDP/TCP).
- Logs de CoreDNS indicam cache misses.

---

## Medir latência de resolução

```bash
time dig example.com
# mostra tempo total de lookup
```

**Quando usar:** diagnosticar lentidão de DNS, comparar resolvers.

**Considerações:**

- Primeira query é mais lenta (cache miss).
- Queries subsequentes usam cache (mais rápidas).
- >100ms indica problema.
