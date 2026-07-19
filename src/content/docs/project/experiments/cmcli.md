---
title: Investigação — cmcli (CLI de diagnóstico)
sidebar:
  order: 99
---

**Status:** Investigação aberta (Fase 8) — sem compromisso de implementação.

`cmcli` seria uma CLI somente leitura para diagnóstico rápido de clusters e hosts, complementando a documentação. Antes de implementar, responder:

## Questões de design

### 1. Qual problema resolve melhor que shell scripts?

**Alternativa:** continuar com shell scripts + recipes do Toolbox.

- ✅ Scripts são "copiáveis", funcionam offline, sem dependências extras.
- ❌ Scripts dispersos; saída inconsistente entre eles; reportes heterogêneos.

**Hipótese:** CLI oferece:

- Saída estruturada (JSON/YAML para máquinas, formatado para humanos).
- Descoberta: `cmcli help` mostra tudo em um lugar.
- Reutilização: funções de diagnóstico centralizadas.

**Risco:** CI não gostaria de uma dependency binária extra — precisa que scripts continuem sendo self-contained.

### 2. Quais verificações são portáveis?

Começar **somente leitura** em:

- `check host` — SO, CPU, RAM, disco, rede.
- `check k3s` — versão, nós, services, API.
- `check firewall` — UFW/firewalld rules (ler, não mudar).
- `check networking` — DNS, conectividade, latência.
- `check storage` — volumes, inodes, Longhorn status.
- `checklist` — rodar checks de um checklist de Fase 3.
- `report` — gerar saída estruturada.

**Não portável:**

- `check windows` ou `check macos` — fora de escopo (Debian/Ubuntu + K3s).
- `check secrets` — Infisical, OpenBao, SOPS diferentes por stack.

### 3. Como as regras serão representadas?

Hoje, checklists são Markdown hardcoded. Se `cmcli` tiver regras, precisam de:

- Formato: YAML? JSON? Rust macros? Diretivas no código?
- Versionamento: acompanham versão da documentação? Release separado?
- Manutenção: quem atualiza quando Longhorn 1.12 → 1.13?

**Proposta:** regras como YAML em `src/cmcli/checks/` (ao lado de `.md`), parsed em tempo de build ou runtime.

### 4. Como evitar que a CLI esconda os comandos reais?

Risco: usuário roda `cmcli check k3s` e pensa que é "a forma certa" de verificar, nunca aprende `kubectl get nodes`.

**Mitigação:**

- Sempre mostrar o comando subjacente (ex: "→ running: `kubectl get nodes`").
- Cada output aponta para página da documentação (ex: "ver [Troubleshooting de nós](...)")
- Documentação permanece a verdade; CLI é atalho.

### 5. Como testar verificações sem modificar hosts reais?

`cmcli check firewall` precisa ler `/etc/ufw/` ou `firewall-cmd`. Em CI:

- Não há `/etc/ufw/` num container.
- Mock data ou skip? Ambos problemáticos.

**Opção A:** testes só em container com mocks; documentação fica como verdade.
**Opção B:** testes em VMs de verdade (mais lentos, mais confiáveis).
**Opção C:** testes em CI com Docker que emula estrutura de arquivo.

### 6. Quais comandos são só leitura vs. podem modificar?

**Só leitura (scope inicial):**

- `check *` — diagnóstico.
- `report` — saída.
- `help` — documentação.

**Modificadora (fora de escopo por enquanto):**

- `apply` — executar remediação (ex: "fix firewall").
- `configure` — applicar settings.

Manter clara a linha: CLI de diagnóstico != ferramenta de configuração.

### 7. Como tratar firewalls/distribuições diferentes?

UFW (Ubuntu), firewalld (RHEL), nftables (native). Cada um tem seus próprios:

- Arquivos de config.
- Comandos de query.
- Modelo (rules vs. zones).

**Realidade:** Fase 8 cobre Debian/Ubuntu somente. K3s é agnóstico. Limitar cmcli ao escopo (Debian/Ubuntu) por enquanto.

### 8. Se o relatório pode omitir secrets?

`cmcli report` gera JSON/YAML com diagnóstico. Incluir:

- ✅ Versões, nós, portas.
- ❌ Tokens de API (nunca).
- ❌ Conteúdo de `/etc/openbao/openbao.hcl` (secrets).
- ❓ IP do host? Hostname?

**Regra:** nunca incluir nada que fosse sensível em `sshd_config`, `.kube/config`, ou certificados privados.

### 9. Como apontar para página da documentação?

Cada check pode dizer "se falhar, ler [link]".

```bash
cmcli check firewall
# Port 6443: ALLOW (OK)
# Port 2379: CLOSED (⚠️ esperado se etcd externo)
#   → ver: https://site/guides/blueprints/k3s-multinode/#network-requirements
```yaml

Isso requer:

- Mapa de checks → URLs.
- URLs não mudem (ou redirecionar).
- Estar pronto para mudar docs sem quebrar CLI.

---

## Decisão recomendada (aguardando)

**MVP (Minimum Viable Product):**

- [ ] Implementar 3-5 checks básicos (host, k3s, firewall).
- [ ] Output estruturado (JSON) + humano.
- [ ] Cada check mostra comando subjacente.
- [ ] Nenhuma modificação — somente leitura.
- [ ] Publicar em `project/experiments/cmcli-v0.md` com resultados de testes.

**Critério go/no-go:**

- Se `cmcli check k3s` rodar em 1-2s e adicionar >20% de valor vs. 3-4 comandos manuais → vale.
- Se apenas replicar que `kubectl get nodes` já faz → não vale (complexidade sem benefício).

---

## Referências

- `todo.txt` linhas 1743–1765 — escopo completo da investigação.
- Exemplos inspiradores: `k9s` (full TUI), `kubectx` (descoberta de contexto), `dive` (análise de imagens).
