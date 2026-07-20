---
title: Rede
sidebar:
  order: 4
---

## Testar conectividade para um host

```bash
ping -c 3 example.com
# ou sem limit de tempo
ping example.com

# Com timeout customizado
ping -w 5000 example.com  # 5 segundos
```

**Quando usar:** verificar se um host está online, medir latência.

**Considerações:**

- ICMP pode ser bloqueado por firewall.
- `-c`: número de pacotes (Linux).
- `-W`: timeout (Linux).

---

## Escanear porta aberta

```bash
# Com netcat
nc -zv example.com 443
# -z: close after connect, -v: verbose

# Com telnet
telnet example.com 443

# Com /dev/tcp (bash)
timeout 1 bash -c 'cat </dev/null >$(echo /dev/tcp/example.com/443)' && echo "Aberta" || echo "Fechada"
```

**Quando usar:** verificar se uma porta está aberta e respondendo.

**Considerações:**

- netcat é mais portável.
- telnet pode exigir instalação.
- `/dev/tcp` é bash-específico, sem dependências.

---

## Listar conexões ativas

```bash
# Todos os sockets
netstat -tlnp

# ou com ss (mais moderno)
ss -tlnp

# Filtrar por porta
ss -tlnp | grep :8080

# Filtrar por estado
ss -tnp state ESTABLISHED
```

**Quando usar:** diagnosticar porta em uso, ver qual processo, monitorar conexões.

**Considerações:**

- `-t`: TCP, `-u`: UDP.
- `-l`: listening, `-n`: numeric (não resolve hostnames).
- `-p`: show process.
- `ss` é mais rápido em kernels modernos.

---

## Identificar processo escutando uma porta

```bash
# Qual processo está em :3000?
lsof -i :3000

# ou com ss
ss -ltnp | grep :3000

# Mais detalhes (sudo pode ser necessário)
sudo lsof -i :3000
```

**Quando usar:** descobrir qual app está usando uma porta, diagnosticar conflitos.

**Considerações:**

- `lsof` requer privilégios para ver processos de outros usuários.
- `-i`: internet sockets.
- Útil antes de kill um processo.

---

## Testar rota para um host

```bash
traceroute example.com
# ou
mtr example.com  # modo interativo, mais detalhes

# Apenas uma tentativa
mtr -c 1 example.com
```

**Quando usar:** diagnosticar latência de rede, ver por quais hops uma conexão passa.

**Considerações:**

- `traceroute` mostra route estática.
- `mtr` combina ping + traceroute, mostra estatísticas.
- Pode ser bloqueado por firewalls.

---

## Listar rotas do host

```bash
# Com ip (moderno)
ip route show

# Com route (legado)
route -n

# Rota default
ip route | grep default
```

**Quando usar:** verificar default gateway, debugar roteamento não está funcionando.

**Considerações:**

- `ip route` é preferido (comando `ip` unificado).
- Sem `-n`: tenta resolver IPs em hostnames (mais lento).

---

## Adicionar/remover rota

```bash
# Adicionar rota
sudo ip route add 192.168.2.0/24 via 192.168.1.1

# Remover rota
sudo ip route del 192.168.2.0/24 via 192.168.1.1

# Verificar
ip route show | grep 192.168.2
```

**Quando usar:** roteamento customizado, lab de rede, tunels.

**Considerações:**

- Requer `sudo`.
- Mudanças são temporárias (perde ao reboot).
- Para persistência: editar `/etc/netplan/` ou equivalente.
