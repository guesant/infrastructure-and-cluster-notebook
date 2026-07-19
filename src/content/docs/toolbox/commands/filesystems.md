---
title: Filesystems
sidebar:
  order: 8
---

## Verificar espaço em disco

```bash
# Resumo por filesystem
df -h

# Uso por diretório (1 nível)
du -sh /*

# Diretórios grandes
du -sh /* | sort -h | tail -10
```yaml

**Quando usar:** diagnosticar disco cheio, encontrar o que está comendo espaço.

**Considerações:**

- `df`: filesystem level.
- `du`: directory level.
- `-h`: human-readable (K, M, G).
- `-s`: summarize (não recursive para cada dir).

**Relacionado:**

- [Verificar inodes](#verificar-inodes)

---

## Verificar inodes

```bash
# Por filesystem
df -i

# Que diretório está usando inodes
find / -xdev -printf '%h\n' 2>/dev/null | sort | uniq -c | sort -rn | head -10
```yaml

**Quando usar:** filesystem cheio mas espaço disponível (problema de inodes).

**Considerações:**

- Inodes = número de arquivos/diretórios.
- Um arquivo pequeno = 1 inode.
- Limite: filesystem can run out of inodes antes de ficar sem espaço.

**Relacionado:**

- [Verificar espaço em disco](#verificar-espaço-em-disco)

---

## Montar filesystem

```bash
# Verificar o que está montado
mount | grep /mnt

# Montar NFS
sudo mount -t nfs server:/export /mnt/nfs

# Montar com opções
sudo mount -t nfs -o rw,hard,intr server:/export /mnt/nfs

# Desmontar
sudo umount /mnt/nfs
```yaml

**Quando usar:** adicionar storage, backup networks, dev environments.

**Considerações:**

- `-t`: tipo (nfs, cifs, etc).
- `-o`: opções (rw=read-write, hard=block on failure).
- `umount`: desmontar antes de remover device.

**Relacionado:**

- [Verificar permissões](#verificar-e-mudar-permissões-de-arquivo)

---

## Verificar e mudar permissões de arquivo

```bash
# Ver permissões
ls -l file.txt
stat file.txt

# Mudar permissões (octal)
chmod 644 file.txt    # rw- r-- r--
chmod 755 script.sh   # rwx r-x r-x

# Mudar permissões (alfabético)
chmod u+x script.sh   # adicionar execute ao owner
chmod g-w file.txt    # remover write do group

# Recursivo
chmod -R 755 /path/to/dir
```yaml

**Quando usar:** fixar permissions de arquivo/script, security.

**Considerações:**

- Octal: 4=read, 2=write, 1=execute; primeiro dígito=user, second=group, third=others.
- `-R`: recursivo (cuidado!).

**Relacionado:**

- [Mudar owner](#mudar-owner-de-arquivo)

---

## Mudar owner de arquivo

```bash
# Mudar user e group
sudo chown user:group file.txt

# Apenas user
sudo chown user file.txt

# Apenas group
sudo chown :group file.txt

# Recursivo
sudo chown -R user:group /path/to/dir
```yaml

**Quando usar:** file ownership after copy, container volumes, security.

**Considerações:**

- Requer `sudo` (ou ser dono do arquivo).
- `-R`: recursivo.
- Formato: `user:group`.

**Relacionado:**

- [Verificar permissões](#verificar-e-mudar-permissões-de-arquivo)

---

## Encontrar arquivos

```bash
# Por nome
find /path -name "*.log"

# Por tamanho
find /path -size +1G  # >1GB
find /path -size -10M # <10MB

# Por idade
find /path -mtime +30  # modificado há >30 dias
find /path -atime -1   # acessado há <1 dia

# Executar comando em resultados
find /path -name "*.tmp" -delete
find /path -name "*.log" -exec gzip {} \;
```yaml

**Quando usar:** limpeza de filesystem, auditoria, logs.

**Considerações:**

- `-name`: case-sensitive (use `-iname` para case-insensitive).
- `-size +1G`: +/- for greater/less than.
- `-delete`: remove (cuidado!).
- `-exec`: rodar comando em cada resultado.

**Relacionado:**

- [Verificar espaço em disco](#verificar-espaço-em-disco)

---

## Buscar conteúdo dentro de arquivos

```bash
# Arquivos contendo padrão
grep -r "pattern" /path

# Case-insensitive
grep -ri "pattern" /path

# Contar ocorrências
grep -c "pattern" file.txt

# Mostrar linha + contexto
grep -B2 -A2 "pattern" file.txt
```yaml

**Quando usar:** encontrar configuração, debugar, auditoria.

**Considerações:**

- `-r`: recursivo.
- `-i`: case-insensitive.
- `-B/-A`: linhas antes/depois.
- `-v`: invert (não contém).

**Relacionado:**

- [Encontrar arquivos](#encontrar-arquivos)
