---
title: Comandos rápidos (cookbook)
sidebar:
  order: 2
---

Recipes de comandos organizadas por tarefa, não por ferramenta. Cada recipe é uma tarefa pequena, um ou dois comandos, com contexto sobre quando usar.

Diferentes de um task guide (que tem múltiplos passos e decisões), recipes são fragmentos prontos para copiar e executar.

## Por categoria

- [Valores aleatórios](/toolbox/commands/random-values/) — senhas, tokens, chaves.
- [Certificados](/toolbox/commands/certificates/) — criar, inspecionar, converter certificados.
- [Criptografia](/toolbox/commands/cryptography/) — chaves de criptografia, hashing.
- [DNS](/toolbox/commands/dns/) — resolução, testes, troubleshooting.
- [Rede](/toolbox/commands/networking/) — conectividade, rotas, firewall.
- [Firewalls](/toolbox/commands/firewalls/) — UFW, firewalld, iptables.
- [Filesystems](/toolbox/commands/filesystems/) — montagem, permissions, inodes.
- [Discos e volumes](/toolbox/commands/disks-and-volumes/) — partições, LVM, espaço.
- [Processos](/toolbox/commands/processes/) — listar, portas, prioridade.
- [Systemd](/toolbox/commands/systemd/) — services, targets, logs.
- [Logs](/toolbox/commands/logs/) — journalctl, app logs, rotação.
- [Containers](/toolbox/commands/containers/) — Docker, buildah, inspecionar imagens.
- [Kubernetes](/toolbox/commands/kubernetes/) — kubectl, inspeccionar resources.
- [Helm](/toolbox/commands/helm/) — buscar charts, valores, releases.
- [Git](/toolbox/commands/git/) — branches, commits, rebase.
- [Troubleshooting](/toolbox/commands/troubleshooting/) — diagnóstico genérico.

## Formato de uma recipe

```yaml
### Tarefa

Descrição breve de quando usar (1-2 linhas).

**Comando:**

\`\`\`bash
command here
\`\`\`

**Quando usar:**
- Situação 1
- Situação 2

**Considerações:**
- Efeito colateral 1
- Cuidado com X

**Relacionado:**
- [outra recipe](/path)
```yaml
