---
title: CoreDNS + Reverse Proxy Local — DNS interno sem kubectl port-forward
sidebar:
  order: 1
---

> **Para quem é:** operadores que querem acessar serviços internos via domínios resolvíveis (ex: `api.cluster.local`) sem `kubectl port-forward` manual.

Problema: Cada vez que quer acessar um serviço interno, precisa fazer:

```bash
kubectl port-forward svc/api 8080:80
# Acessa http://localhost:8080
```yaml

Solução: DNS local + reverse proxy no host resolvem domínios internos automaticamente.

## Arquitetura

```yaml
Seu host
  ├─ /etc/hosts ou systemd-resolved (aponta *.cluster.local → 127.0.0.1)
  └─ Nginx/HAProxy em 127.0.0.1:443
         ↓ (SNI-based routing)
Cluster
  ├─ CoreDNS (resolve *.cluster.local)
  └─ Serviços (api.cluster.local, grafana.cluster.local, etc.)
```yaml

## CoreDNS setup no cluster

CoreDNS já vem instalado em K3s. Adicionar zona local:

```bash
kubectl edit configmap coredns -n kube-system
```yaml

Editar para:

```yaml
.:53 {
    errors
    health
    ready
    
    # Zona local do cluster
    file /etc/coredns/cluster.local cluster.local
    
    # Fallback para upstream
    forward . /etc/resolv.conf
    cache 30
    loop
    reload
    loadbalance
}
```yaml

## Criar registros locais (CoreDNS)

```bash
cat > /tmp/cluster.local <<EOF
; Local cluster DNS zone
\$ORIGIN cluster.local.
@           IN SOA ns1.cluster.local. admin.cluster.local. (
                    2024010101  ; serial
                    3600        ; refresh
                    900         ; retry
                    1209600     ; expire
                    60)         ; minimum TTL
            IN NS  ns1

; API server
api         IN A   10.43.0.1  ; K3s API ClusterIP (ou Loadbalancer IP)
grafana     IN A   10.43.0.1
prometheus  IN A   10.43.0.1
argocd      IN A   10.43.0.1
EOF

kubectl create configmap cluster-zone \
  --from-file=/tmp/cluster.local \
  -n kube-system
```yaml

Ou via Ingress controller (mais simples):

- Cada ingresso já resolve via CoreDNS
- Reverse proxy roteia via Host header

## Nginx local (reverse proxy)

No seu host (127.0.0.1):

```nginx
# /etc/nginx/conf.d/cluster.conf
upstream cluster_services {
    # K3s API LoadBalancer ou Ingress controller
    server 192.168.1.100:443;  # IP interno do Ingress
}

server {
    listen 127.0.0.1:443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Qualquer *.cluster.local vai para upstream
    server_name ~^(?<subdomain>.+)\.cluster\.local$;
    
    location / {
        proxy_pass https://cluster_services;
        proxy_set_header Host $server_name;
        proxy_ssl_verify off;  # Self-signed OK
    }
}
```yaml

## Host local DNS resolution

### Linux (systemd-resolved)

```bash
cat > /etc/systemd/resolved.conf <<EOF
[Resolve]
DNS=127.0.0.1
Domains=~cluster.local.
EOF

sudo systemctl restart systemd-resolved
```yaml

Test:

```bash
nslookup api.cluster.local
# → 127.0.0.1
```yaml

### macOS

```bash
# Criar resolver config
sudo mkdir -p /etc/resolver
sudo bash -c 'echo "nameserver 127.0.0.1" > /etc/resolver/cluster.local'

# Se rodando dnsmasq/brew-services:
# Aponta para 127.0.0.1
```yaml

### Windows

Editar `C:\Windows\System32\drivers\etc\hosts`:

```yaml
127.0.0.1 api.cluster.local
127.0.0.1 grafana.cluster.local
127.0.0.1 prometheus.cluster.local
```yaml

## Kubernetes Ingress (complementar)

Para cada serviço que quer expor:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: api
spec:
  ingressClassName: traefik
  tls:
  - hosts:
    - api.cluster.local
      secretName: tls-api
  rules:
  - host: api.cluster.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```yaml

## Acesso local

```bash
# Sem reverse proxy (antes):
kubectl port-forward svc/api 8080:80
curl http://localhost:8080

# Com reverse proxy (depois):
curl https://api.cluster.local
# → Nginx roteia para Ingress controller
# → Ingress roteia para serviço
```yaml

## Certificate autossinado para testing

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /tmp/key.pem -out /tmp/cert.pem \
  -subj "/CN=*.cluster.local"

# Copiar para nginx/haproxy
sudo cp /tmp/{cert,key}.pem /etc/ssl/certs/cluster/
```yaml

## Vantagens

✅ Sem `kubectl port-forward` manual
✅ Domínios resolvíveis (api.cluster.local)
✅ Dev workflow mais ágil
✅ Isolado localmente (127.0.0.1, não expõe público)
✅ Funciona com cert autossinado

## Checklist

- [ ] CoreDNS zone local criada
- [ ] Nginx/HAProxy em 127.0.0.1:443
- [ ] systemd-resolved apontando para 127.0.0.1
- [ ] Ingress controller rodando no cluster
- [ ] Certificado autossinado/válido instalado
- [ ] Teste: `nslookup api.cluster.local`
- [ ] Teste: `curl https://api.cluster.local`

---

## Referências

- [CoreDNS documentation](https://coredns.io/): guia oficial.
- [Nginx reverse proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html): docs.
- [systemd-resolved](https://www.freedesktop.org/software/systemd/man/systemd-resolved.service.html): man page.
