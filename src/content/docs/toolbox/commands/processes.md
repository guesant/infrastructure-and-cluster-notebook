---
title: Processos
sidebar:
  order: 5
---

## Listar processos

```bash
# Todos os processos (formato BSD)
ps aux

# Apenas processos do usuário
ps ux

# Árvore de processos
ps auxf
# ou
pstree
```yaml

**Quando usar:** encontrar processo, verificar estado, CPU/memória usada.

**Considerações:**

- `ps aux`: muito usado, formato fácil de ler.
- `%CPU`, `%MEM`: percentual de recursos.
- `STAT`: estado do processo (S=sleep, R=running, Z=zombie).

**Relacionado:**

- [Matar processo](#matar-processo-por-pid)
- [Monitorar CPU/memória](#monitorar-cpu-memória-em-tempo-real)

---

## Procurar processo por nome

```bash
ps aux | grep nginx

# ou (mais direto, sem grep recursivo)
pgrep -a nginx

# Mostrar PID apenas
pgrep nginx
```yaml

**Quando usar:** encontrar PID de uma aplicação, verificar se está rodando.

**Considerações:**

- `grep` sem `-v grep` aparece a si mesmo (use `grep [n]ginx` para evitar).
- `pgrep` evita o problema, mais limpo.
- `-a`: mostrar command line completa.

**Relacionado:**

- [Matar processo](#matar-processo-por-pid)
- [Listar processos](#listar-processos)

---

## Matar processo por PID

```bash
# Sinal TERM (gracioso)
kill 1234

# Sinal KILL (forçado)
kill -9 1234

# Por nome
pkill -f nginx
pkill -9 -f "python my_script.py"
```yaml

**Quando usar:** encerrar processo travado, liberar porta.

**Considerações:**

- TERM (15): deixa processo se limpar. KILL (9): instantâneo, sem chance de cleanup.
- `pkill`: mata por padrão (menos preciso que PID).
- `-f`: match full command line (não só nome).

**Relacionado:**

- [Procurar processo](#procurar-processo-por-nome)
- [Identificar processo em porta](#identificar-processo-escutando-uma-porta)

---

## Monitorar CPU/memória em tempo real

```bash
# Top (interativo)
top

# Atman (melhor interface)
htop

# Uma linha, atualizar a cada 2s
watch -n 2 'ps aux | sort -k3,3nr | head -5'
```yaml

**Quando usar:** diagnosticar processo usando muitos recursos, troubleshoot.

**Considerações:**

- `top`: builtin em quase todos os sistemas.
- `htop`: precisa instalação, mas é mais bonito.
- `watch`: roda comando repetidamente.

**Relacionado:**

- [Listar processos](#listar-processos)
- [Mudar prioridade](#mudar-prioridade-de-um-processo)

---

## Mudar prioridade de um processo

```bash
# Aumentar prioridade (lower nice = higher priority; -20 = máximo)
sudo nice -n -5 my_app

# Mudar prioridade de processo já rodando
sudo renice -n 10 -p 1234  # PID 1234
sudo renice -n 10 -u username  # Todos do user
```yaml

**Quando usar:** dar recursos a apps críticos, reduzir prioridade de background jobs.

**Considerações:**

- Nice ranges: -20 (highest) to +19 (lowest).
- `nice`: ao iniciar processo.
- `renice`: processo já rodando.
- Requer `sudo` para nice negativo.

**Relacionado:**

- [Monitorar CPU/memória](#monitorar-cpumemória-em-tempo-real)

---

## Zombies e processos órfãos

```bash
# Listar zombies (STAT = Z)
ps aux | grep Z

# Listar sem parent (init/systemd adota)
ps auxf | grep -v "^root" | grep "defunct"

# Matar parent para liberar zombie
sudo kill -9 <parent_pid>
```yaml

**Quando usar:** limpar processos zumbis após crash de aplicação.

**Considerações:**

- Zombies: processo terminou mas pai não leu exit code (wait).
- Ódios: parent morreu, init adotou.
- Único remédio: matar parent.

**Relacionado:**

- [Listar processos](#listar-processos)
- [Matar processo](#matar-processo-por-pid)

---

## Background e foreground

```bash
# Rodar em background
command &

# Listar jobs em background
jobs

# Trazer job pro foreground
fg %1

# Pausar job rodando (Ctrl+Z), depois
bg %1  # Continua em background
```yaml

**Quando usar:** executar múltiplos comandos, não bloquear terminal.

**Considerações:**

- `&` coloca no background automaticamente.
- Ctrl+Z pausa, `bg` continua em background.
- `fg` traz de volta ao foreground.

**Relacionado:**

- [Matar processo](#matar-processo-por-pid)
