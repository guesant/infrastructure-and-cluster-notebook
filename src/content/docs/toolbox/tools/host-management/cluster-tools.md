---
title: Gerenciamento de hosts e clusters
sidebar:
  order: 1
---

> **Para quem é:** operadores de Kubernetes e infraestrutura que precisam gerenciar clusters visualmente.

Ferramentas para monitorar, debugar e gerenciar Kubernetes clusters.

## k9s (TUI — Recomendado para CLI)

Terminal UI interativo para Kubernetes.

**Instalação:**

```bash
# Via brew
brew install k9s

# Via Linux package manager
sudo apt install k9s
```

**Uso:**

```bash
k9s
# :pod        → listar pods
# :deployment → listar deployments
# :node       → listar nós
# ? → ajuda
# Seta + Enter → detalhe/logs
```

**Vantagens:**

- Sem UI externa (rode no terminal)
- Navegação rápida
- Acesso a logs e shell
- Monitoring inline

---

## Lens (Desktop GUI)

IDE para Kubernetes (desktop app).

**Download:** https://k8slens.dev/

**Funcionalidade:**

- Dashboard visual do cluster
- Navegar resources
- Ver logs/eventos
- Terminal/shell em pods
- Monitoramento de CPU/memória
- Sync com kubeconfig automático

**Versões:**

- Open Source (free)
- Lens Pro (pago, mais recursos)

---

## Rancher (Web UI — Empresarial)

Plataforma web para gerenciar múltiplos clusters.

**Setup:**

```bash
helm repo add rancher-latest https://releases.rancher.com/server-charts/latest
helm install rancher rancher-latest/rancher \
  --namespace cattle-system \
  --set hostname=rancher.example.com
```

**Funcionalidade:**

- Gerenciar múltiplos clusters
- RBAC centralizado
- Monitoring integrado (Prometheus)
- Helm chart marketplace
- Logging centralizado (ELK)

---

## Portainer (Docker/Swarm UI)

Web UI para gerenciar Docker hosts e Swarm.

**Setup:**

```bash
docker run -d -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  portainer/portainer-ce
# Acessa em http://localhost:9000
```

**Funcionalidade:**

- Listar containers/images
- Logs em tempo real
- Shell em containers
- Deploy stacks (docker-compose)
- Swarm management

**Público:** Mais para Docker que Kubernetes.

---

## Cockpit (Linux host UI)

Dashboard web nativo para gerenciar Linux host.

**Instalação:**

```bash
sudo apt install cockpit
# Acessa em https://localhost:9090
```

**Funcionalidade:**

- Terminal web
- Gerenciar services
- Firewall (UFW)
- Armazenamento/partições
- Monitoramento de recursos
- Logs do sistema

**Cenário:** Gerenciar host individual (não cluster).

---

## Headlamp (Open source Kubernetes UI)

Dashboard Kubernetes leve (Electron + web).

**Instalação:**

```bash
# Download: https://headlamp.dev/
# Ou via container:
docker run -d -p 8080:80 ghcr.io/kinvolk/headlamp:latest
```

**Funcionalidade:**

- Dashboard clean
- Editing de resources
- Logs/events
- RBAC-aware (respeita permissões do kubeconfig)

---

## Escolher a ferramenta

| Caso               | Ferramenta                |
| ------------------ | ------------------------- |
| CLI rápido, sem UI | k9s                       |
| Desktop visual     | Lens                      |
| Múltiplos clusters | Rancher                   |
| Docker/Swarm       | Portainer                 |
| Linux host indiv.  | Cockpit                   |
| Kubernetes web leve| Headlamp                  |

---

## Referências

- [k9s](https://k9scli.io/): documentação.
- [Lens](https://k8slens.dev/): download e docs.
- [Rancher](https://www.rancher.com/): plataforma completa.
- [Portainer](https://www.portainer.io/): Docker UI.
- [Cockpit](https://cockpit-project.org/): Linux host UI.
- [Headlamp](https://headlamp.dev/): Kubernetes UI leve.
