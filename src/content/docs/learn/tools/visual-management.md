---
title: Ferramentas de Gerenciamento Visual
sidebar:
  order: 1
---

> **Para quem é:** operadores que preferem dashboard visual a CLI pura para gerenciar clusters.

Além do `kubectl` CLI, existem ferramentas visuais para monitorar e gerenciar clusters de forma mais intuitiva.

## Principais ferramentas

### k9s — TUI (Terminal UI)

**O que é:**
- Interface terminal interativa para Kubernetes
- Navega pelo cluster: pods, deployments, services

**Pontos fortes:**
- Rápida (tudo em terminal)
- Sem dependências (1 binário)
- Keyboard shortcuts (produtivo)
- Logs, exec, delete inline

**Quando usar:**
- Desenvolvimento / troubleshooting rápido
- SSH para remote server (terminal-only)
- Prefere CLI elegante a web UI

```bash
k9s
# → TUI interativa
# → Pressione ':' para filtrar/buscar
# → Pressione 'd' para deletar recurso
```

---

### Lens — IDE visual (Desktop)

**O que é:**
- Aplicação desktop (Electron) para Kubernetes
- Gerencia múltiplos clusters

**Pontos fortes:**
- Interface visual e intuitiva
- Multi-cluster (abas)
- Integração com ferramentas (Terminal embutido, logs, etc.)
- Free (+ pro opcional)

**Quando usar:**
- Desenvolvimento (desktop)
- Gerenciador visual confortável
- Múltiplos clusters

**Trade-off:**
- Só em desktop (não remote)
- Mais recursos (Electron)

---

### Rancher — Dashboard web full-featured

**O que é:**
- Plataforma web para gerenciar clusters (não depende de Rancher distribution)
- Funciona com K3s, EKS, qualquer Kubernetes

**Pontos fortes:**
- Dashboard completo (nodes, pods, deployments, etc.)
- Fleet (múltiplos clusters)
- RBAC integrado
- Multi-tenancy

**Quando usar:**
- Precisa multi-cloud/multi-cluster
- Quer RBAC granular
- DevOps team size (não solo)

**Trade-off:**
- Complexo (curva de aprendizado)
- Infrastructure overhead (deploy Rancher em si)

---

### Portainer — Mais simples que Rancher

**O que é:**
- Dashboard web simplificado para Docker + Kubernetes
- Mais leve que Rancher

**Pontos fortes:**
- Simples (aprender rápido)
- Containers + Kubernetes na mesma UI
- Docker Compose visual

**Quando usar:**
- Quer simples (não enterprise Rancher)
- Docker + Kubernetes em um lugar

---

### Headlamp — Kubernetes-only, web

**O que é:**
- Dashboard web simples focado em Kubernetes
- Alternative leve a Rancher

**Pontos fortes:**
- Leve
- Fácil deploy (Helm chart)
- Dark mode bonito
- Open source

**Quando usar:**
- Quer web UI simples
- Alternativa a Rancher/Portainer

---

## Comparação

| Ferramenta | Interface | Multi-cluster | Overhead | Deploy |
|---|---|---|---|---|
| **k9s** | TUI | Sim (via contexts) | Mínimo (binário) | 1 comando |
| **Lens** | Desktop | Sim (UI) | Médio (Electron) | .exe/.dmg |
| **Rancher** | Web | ✅ Sim (fleet) | Alto | Helm (em cluster) |
| **Portainer** | Web | Sim (basic) | Médio | Docker (em cluster) |
| **Headlamp** | Web | Sim (contexts) | Baixo | Helm (em cluster) |

---

## Decisão prática

**Use k9s se:**
- Prefere terminal
- Quer rápido + lightweight
- SSH remoto

**Use Lens se:**
- Desktop
- Gerenciador visual preferido
- Múltiplos clusters

**Use Rancher se:**
- Enterprise (multi-cloud, multi-team)
- RBAC complexo

**Use Portainer se:**
- Docker + Kubernetes juntos
- Quer simples

**Use Headlamp se:**
- Web UI leve
- Deploy simples (Helm)

---

## Instalação rápida

### k9s
```bash
brew install derailed/k9s/k9s
k9s
```

### Lens
Baixar em https://k8slens.dev

### Rancher
```bash
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
helm install rancher rancher-stable/rancher \
  --namespace cattle-system --create-namespace \
  --set hostname=rancher.example.com
```

### Portainer
```bash
docker run -d -p 8000:8000 -p 9000:9000 \
  portainer/portainer-ce:latest
# UI em http://localhost:9000
```

---

## Referências

- [k9s repository](https://github.com/derailed/k9s): código aberto.
- [Lens documentation](https://docs.k8slens.dev/): guia oficial.
- [Rancher documentation](https://ranchermanager.docs.rancher.com/): guia oficial.
- [Portainer documentation](https://docs.portainer.io/): guia oficial.
- [Headlamp repository](https://github.com/kinvolk/headlamp): código aberto.
