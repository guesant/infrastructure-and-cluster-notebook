---
title: Clientes de banco de dados
sidebar:
  order: 1
---

> **Para quem é:** operadores que precisam gerenciar bancos de dados PostgreSQL, MySQL, etc.

Ferramentas para conectar, executar queries, e gerenciar schemas.

## CLI nativa

### psql (PostgreSQL)

Cliente nativo de linha de comando.

**Instalação:**

```bash
sudo apt install postgresql-client
```

**Uso:**

```bash
psql -h localhost -U postgres -d mydb
# Dentro do psql:
# \dt              → listar tabelas
# \du              → listar usuários
# SELECT * FROM users;  → query
# \q               → sair
```

**Vantagens:**

- Direto, sem UI
- Perfeito para scripts
- Leve

---

## GUI — DBeaver (Recomendado)

Cliente universal para múltiplos bancos (PostgreSQL, MySQL, Oracle, etc).

**Instalação:**

```bash
# Download: https://dbeaver.io/download/
# Ou via package manager
```

**Funcionalidade:**

- Navegação de schema visual
- Query builder
- Import/export
- ERD (Entity Relationship Diagram)
- Sync entre bancos

**Versões:**

- Community (free)
- Enterprise (pago, mais recursos)

---

## GUI — pgAdmin (PostgreSQL)

Web-based admin para PostgreSQL.

**Setup:**

```bash
docker run -p 80:80 dpage/pgadmin4
# Acessa em http://localhost
# User: admin@pgadmin.org, password: admin
```

**Funcionalidade:**

- Criar/deletar databases, roles
- Query executor
- Backup/restore
- Server monitoring

---

## CLI — MySQL

Cliente nativo de MySQL.

**Uso:**

```bash
mysql -h localhost -u root -p -D mydb
```

### Alternativa: mycli

```bash
mycli -h localhost -u root -p
# Syntax highlighting, auto-complete
```

---

## DataGrip (JetBrains)

IDE profissional para bancos (pago, mas poderoso).

**Funcionalidade:**

- Autocomplete inteligente
- Profiling de queries
- Refactoring de schemas
- Integração Git

**Custo:** ~$200/ano ou incluído em IntelliJ Ultimate.

---

## Situações comuns

### Conectar via SSH tunnel

Se banco está em rede privada:

```bash
# Forward porta 5432 via SSH
ssh -L 5432:db-server:5432 bastion-host

# Depois, no DBeaver/psql:
psql -h localhost -p 5432 -U postgres
```

### Backup/Restore

```bash
# PostgreSQL backup
pg_dump -h localhost -U postgres mydb > backup.sql

# Restore
psql -h localhost -U postgres mydb < backup.sql

# MySQL backup
mysqldump -h localhost -u root -p mydb > backup.sql
```

---

## Referências

- [DBeaver](https://dbeaver.io/): download e documentação.
- [pgAdmin](https://www.pgadmin.org/): PostgreSQL admin web.
- [DataGrip](https://www.jetbrains.com/datagrip/): IDE JetBrains.
