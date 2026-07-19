---
title: Clientes SSH
sidebar:
  order: 1
---

> **Para quem é:** operadores que precisam acessar hosts remotos via SSH.

SSH é o padrão para acesso remoto seguro em infraestrutura. Existem diversas formas de usar: CLI direto, gerenciadores de conexões, ou via navegador.

## OpenSSH (ssh, scp, sftp)

Ferrramenta padrão, instalada em quase todos os sistemas Linux/Mac.

**Instalação:**

```bash
# Debian/Ubuntu
sudo apt install openssh-client

# Executar
ssh user@host
```

**Uso:**

- Acesso remoto interativo
- Copiar arquivos: `scp file user@host:/remote/path`
- SFTP: `sftp user@host` (protocolo de transferência)

**Alternativas:** PuTTY (Windows, UI), Termius (mobile + desktop).

---

## Gerenciadores de conexões

### Teleport (Zero Trust)

Framework moderno que centraliza acesso, auditoria e compliance.

**Use quando:**

- Acesso corporativo com muitos usuários
- Necessário auditoria de quem fez o quê
- Multi-cloud/hybrid infrastructure

**Características:**

- Sem senhas (certificados)
- Auditoria completa
- RBAC granular

---

### Bastion/Jump host

Host intermediário para acessar infraestrutura privada.

**Padrão:**

```text
Seu host → Bastion (público) → Host privado
```

**Implementação:**

```bash
# ProxyJump no SSH config
Host private-server
  ProxyJump bastion-host
  HostName 10.0.1.100

ssh private-server
```

---

## Acesso via navegador

### Cockpit

Interface web nativa em Debian/RHEL para gerenciar hosts.

**Instalação:**

```bash
sudo apt install cockpit
# Acessa em https://localhost:9090
```

**Funcionalidade:**

- Terminal interativo
- Gerenciar services, firewall, storage
- Requer acesso ao host

---

### Apache Guacamole

HTML5 gateway para RDP, VNC, SSH.

**Use quando:**

- Acesso remoto sem instalar cliente
- Múltiplos protocolos (RDP, VNC, SSH)
- Auditoria de acesso centralizada

**Setup:** Docker Compose com Guacamole (mais complexo).

---

## Referências

- [OpenSSH documentation](https://man.openbsd.org/ssh): manual oficial.
- [Teleport](https://goteleport.com/): zero-trust access.
- [Cockpit](https://cockpit-project.org/): gerenciamento via web.
