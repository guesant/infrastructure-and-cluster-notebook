---
title: Systemd
sidebar:
  order: 9
---

## Gerenciar serviços

```bash
# Iniciar/parar/reiniciar
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx

# Habilitar/desabilitar no boot
sudo systemctl enable nginx
sudo systemctl disable nginx

# Status
sudo systemctl status nginx
```yaml

**Quando usar:** ligar/desligar aplicações, autostart, diagnóstico.

**Considerações:**

- `start`: inicia agora.
- `enable`: adiciona ao boot (sem iniciar agora).
- `status`: mostra PID, logs, memória.

**Relacionado:**

- [Ver logs de service](#ver-logs-de-um-service)
- [Recarregar configuração](#recarregar-configuração-de-service)

---

## Ver logs de um service

```bash
# Últimas linhas (últimos 10 logs de boot)
journalctl -u nginx

# Últimas 50 linhas
journalctl -u nginx -n 50

# Follow (tail -f)
journalctl -u nginx -f

# Desde última boot
journalctl -u nginx -b

# Entre timestamps
journalctl -u nginx --since "2026-07-19 10:00:00" --until "2026-07-19 11:00:00"
```yaml

**Quando usar:** debugar service, ver erros de startup.

**Considerações:**

- `journalctl`: systemd logging.
- `-u`: unit (service).
- `-f`: follow (live tail).
- `-b`: desde última boot.

**Relacionado:**

- [Gerenciar serviços](#gerenciar-serviços)

---

## Recarregar configuração de service

```bash
# Reload (lê configuração nova sem reiniciar)
sudo systemctl reload nginx

# Reload daemon (se service file mudou)
sudo systemctl daemon-reload

# Verificar unidade recarregou
sudo systemctl status nginx
```yaml

**Quando usar:** aplicar mudanças de config sem downtime (se suportado).

**Considerações:**

- `reload`: recarrega config, mantém conexões abertas (não todos os services suportam).
- `daemon-reload`: obrigatório se você editou arquivo .service.
- `restart`: mata tudo, inicia novo (downtime).

**Relacionado:**

- [Gerenciar serviços](#gerenciar-serviços)

---

## Timer (agendamento)

```bash
# Listar timers
systemctl list-timers

# Ver timer específico
systemctl status systemd-tmpfiles-clean.timer

# Testar timer (rodar agora)
sudo systemctl start systemd-tmpfiles-clean.service
```yaml

**Quando usar:** agendamentos (backups, limpeza), alternativa a cron.

**Considerações:**

- Timers são mais poderosos que cron (suportam delays, randomização).
- Logs vão para journalctl.

**Relacionado:**

- [Ver logs de service](#ver-logs-de-um-service)

---

## Criar serviço customizado

```bash
# Editar novo service
sudo nano /etc/systemd/system/myapp.service

# Conteúdo mínimo:
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=myuser
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/python3 /opt/myapp/main.py
Restart=on-failure

[Install]
WantedBy=multi-user.target

# Ativar
sudo systemctl daemon-reload
sudo systemctl enable myapp.service
sudo systemctl start myapp.service
```yaml

**Quando usar:** rodar aplicações customizadas como services.

**Considerações:**

- `[Unit]`: metadados, dependências.
- `[Service]`: execução, usuário, restart policy.
- `[Install]`: autostart, target.
- `Type=simple`: bloqueia até ExecStart terminar.
- `Type=forking`: para daemons que fazem fork.

**Relacionado:**

- [Gerenciar serviços](#gerenciar-serviços)
- [Ver logs de service](#ver-logs-de-um-service)

---

## Targets e dependências

```bash
# Ver target atual (runlevel)
systemctl get-default

# Mudar para target
sudo systemctl isolate multi-user.target  # CLI only
sudo systemctl isolate graphical.target   # Com GUI

# Listar todos os targets
systemctl list-units --type=target

# Dependências de um unit
systemctl list-dependencies nginx
```yaml

**Quando usar:** inicializar em modo específico, entender boot order.

**Considerações:**

- `multi-user.target`: servidor (sem GUI).
- `graphical.target`: desktop.
- `rescue.target`: emergency mode.

**Relacionado:**

- [Gerenciar serviços](#gerenciar-serviços)
