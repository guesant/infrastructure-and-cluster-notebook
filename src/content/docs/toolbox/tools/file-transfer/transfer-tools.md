---
title: Transferência de arquivos
sidebar:
  order: 1
---

> **Para quem é:** operadores que precisam copiar arquivos entre hosts.

Alternativas para copiar entre máquinas: integrado no SSH, sincronização bidirecional, ou protocolo FTP.

## SCP (SSH Copy)

Copiar arquivos via SSH (mesmo protocolo, sem servidor adicional).

**Uso:**

```bash
# Host remoto → local
scp user@host:/remote/file.txt ./local/

# Local → host remoto
scp ./local/file.txt user@host:/remote/path/

# Recursivo
scp -r user@host:/remote/dir ./local/
```

**Vantagens:**

- Integrado em SSH (sem setup adicional)
- Seguro (criptografado)

**Desvantagens:**

- Sem progresso visual de transfer
- Sem retry automático

---

## SFTP

Protocolo FTP sobre SSH (mais seguro, interativo).

**Uso:**

```bash
sftp user@host
# Dentro do SFTP:
# put file.txt        → upload
# get file.txt        → download
# ls, cd, pwd         → navegação
# quit                → sair
```

**Clientes:**

- `sftp` (CLI, integrado)
- FileZilla (GUI, multiplataforma)
- Commander (Norton Commander-style)

---

## Rsync

Sincronização bidirecional com detecção de mudanças.

**Uso:**

```bash
# Backup unidirecional
rsync -avz /local/path/ user@host:/remote/path/

# Bidirecional (cuidado!)
rsync -avz --delete /local/ user@host:/remote/

# Com exclusões
rsync -avz --exclude='*.tmp' /local/ user@host:/remote/
```

**Vantagens:**

- Sincroniza apenas mudanças (eficiente)
- Mostra progresso
- Pode excluir padrões

**Desvantagens:**

- Mais lento na primeira vez (scan completo)
- Rsync deve estar instalado em ambos os hosts

---

## FTP/SFTP via navegador

### FileZilla

Cliente FTP/SFTP com interface gráfica.

**Setup:**

```
Protocolo: SFTP
Host: example.com
User: admin
Port: 22
```

**Funcionalidade:**

- Upload/download por drag-drop
- Queue de transferências
- Sincronização de pastas

---

## Sincronização em nuvem

### MinIO Client (mc)

Cliente S3-compatível para backup em object storage.

**Uso:**

```bash
mc alias set minio http://localhost:9000 minioadmin minioadmin
mc mirror /local/path/ minio/backup/
```

**Cenário:** Backup de dados locais para MinIO/S3.

---

## Referências

- [OpenSSH SCP](https://man.openbsd.org/scp): manual.
- [rsync](https://rsync.samba.org/): documentação completa.
- [FileZilla](https://filezilla-project.org/): download e documentação.
