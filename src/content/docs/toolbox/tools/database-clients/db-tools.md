---
title: Clientes de banco de dados
description: Catálogo de clientes de linha de comando, GUIs e IDEs para PostgreSQL, MySQL e outros bancos, com o que avaliar antes de adotar cada um.
sidebar:
  order: 1
---

> **Para quem é:** operadores que precisam conectar, consultar e administrar bancos de dados PostgreSQL, MySQL e equivalentes.

Este catálogo cobre ferramentas genéricas de conexão a bancos de dados. Para conectar um desses clientes especificamente ao PostgreSQL gerenciado por este notebook (via CloudNativePG), veja o procedimento já pronto em [acessar o PostgreSQL com um cliente gráfico](../../../../guides/tasks/databases/access-postgresql-with-gui-client/); esta página não repete os dados de conexão específicos do projeto.

## CLI nativa: psql (PostgreSQL)

O cliente de linha de comando oficial do PostgreSQL.

```bash
sudo apt install postgresql-client
```

```bash
psql -h localhost -U postgres -d mydb
```

Dentro do `psql`, os comandos internos mais usados são `\dt` (listar tabelas), `\du` (listar usuários/roles), `\q` (sair), além de qualquer instrução SQL padrão como `SELECT * FROM users;`.

**Quando usar:** scripts, automação e qualquer situação em que uma interface gráfica seria desnecessária. É a opção mais leve das listadas aqui, sem dependências além do próprio pacote cliente.

**Modelo de acesso e privilégios:** autentica com usuário/senha (ou certificado, dependendo da configuração `pg_hba.conf` do servidor); os privilégios dentro do banco são os da role usada para conectar, não algo que o `psql` controla.

**Licença e plataformas:** licença PostgreSQL (permissiva, similar a MIT/BSD). Linux, macOS e Windows.

## CLI: cliente MySQL

```bash
mysql -h localhost -u root -p -D mydb
```

Alternativa com destaque de sintaxe e autocompletar, útil para uso interativo:

```bash
mycli -h localhost -u root -p
```

**Modelo de acesso e privilégios:** mesmo modelo do `psql` acima, adaptado ao controle de acesso do MySQL/MariaDB (usuário/senha ou certificado, privilégios de acordo com a conta usada).

**Licença e plataformas:** o cliente `mysql` é GPL-2.0 (parte do MySQL, licenciamento dual GPL/comercial conforme o uso); `mycli` é BSD-3-Clause. Ambos disponíveis para Linux, macOS e Windows.

## GUI multi-banco: DBeaver

Cliente universal com suporte a PostgreSQL, MySQL, Oracle e diversos outros bancos através de drivers JDBC.

Instalação: baixe em [dbeaver.io/download](https://dbeaver.io/download/), ou instale via gerenciador de pacotes da distribuição, quando disponível.

Funcionalidades principais: navegação visual de schema, construtor de queries, importação/exportação de dados, geração de diagrama entidade-relacionamento (ERD) e comparação/sincronização entre bancos.

**Quando usar:** administração de múltiplos tipos de banco com uma única ferramenta. A edição Community é gratuita e cobre a maior parte do uso comum; a edição Enterprise adiciona recursos pagos (colaboração em equipe, alguns drivers adicionais). Confira o [comparativo oficial de edições](https://dbeaver.io/edition/) antes de decidir, já que a divisão exata entre gratuito e pago muda entre versões.

**Modelo de acesso e privilégios:** cada conexão configurada guarda suas próprias credenciais (usuário/senha, certificado, ou túnel SSH embutido); os privilégios dentro do banco são os da conta usada em cada conexão, não algo que o DBeaver controla.

**Licença e plataformas:** Community Edition Apache 2.0; Enterprise Edition comercial. Linux, macOS e Windows.

## GUI web: pgAdmin

Interface de administração do PostgreSQL, servida via navegador.

```bash
docker run -p 127.0.0.1:80:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
  -e PGADMIN_DEFAULT_PASSWORD=troque-esta-senha \
  dpage/pgadmin4
```

A imagem oficial exige `PGADMIN_DEFAULT_EMAIL` e `PGADMIN_DEFAULT_PASSWORD` definidos; sem essas variáveis, o container não inicia. Publique a porta apenas em `127.0.0.1` (como no exemplo) a menos que o acesso remoto seja um requisito explícito; publicar em todas as interfaces expõe uma interface administrativa completa do banco a qualquer coisa que alcance a rede do host.

Funcionalidades principais: criação e remoção de databases e roles, execução de queries, backup e restauração pela interface, e monitoramento básico do servidor.

**Modelo de acesso e privilégios:** duas camadas de autenticação distintas: o login no próprio pgAdmin (`PGADMIN_DEFAULT_EMAIL`/`PGADMIN_DEFAULT_PASSWORD` no exemplo acima) e, separadamente, as credenciais de cada servidor PostgreSQL cadastrado dentro dele.

**Riscos:** como visto na nota de publicação de porta acima, o pgAdmin é uma interface administrativa completa; além de restringir a porta a `127.0.0.1`, troque a senha padrão do exemplo antes de qualquer uso além de teste local.

**Licença e plataformas:** licença PostgreSQL. Distribuído como imagem Docker oficial (portanto qualquer host com Docker); também disponível como pacote Python instalável diretamente em Linux, macOS ou Windows.

## IDE profissional: DataGrip (JetBrains)

IDE dedicada a bancos de dados, paga, com autocompletar orientado a schema, profiling de queries, refatoração de schema e integração com Git.

**Quando usar:** quem já trabalha com outras ferramentas JetBrains (IntelliJ, PyCharm) e quer a mesma experiência de edição aplicada a SQL, ou equipes que precisam de refatoração de schema assistida. Consulte o [preço atual](https://www.jetbrains.com/datagrip/buy/) diretamente na JetBrains antes de decidir: o modelo de licenciamento (standalone ou incluído em um plano All Products) muda com frequência.

**Modelo de acesso e privilégios:** mesmo modelo do DBeaver acima (credenciais por conexão configurada, privilégios herdados da conta usada no banco).

**Licença e plataformas:** comercial (JetBrains), com licença gratuita para uso educacional e projetos open source qualificados via [JetBrains para não-comerciais](https://www.jetbrains.com/community/education/). Linux, macOS e Windows.

## Situações comuns

### Conectar a um banco em rede privada via túnel SSH

Quando o banco não está diretamente acessível, mas um bastion host tem acesso à rede onde ele está:

```bash
ssh -L 5432:db-server:5432 bastion-host
```

Depois, conecte qualquer cliente (DBeaver, `psql`, etc.) em `localhost:5432`, como se o banco estivesse na própria máquina.

### Backup e restauração via linha de comando

```bash
# PostgreSQL
pg_dump -h localhost -U postgres mydb > backup.sql
psql -h localhost -U postgres mydb < backup.sql

# MySQL
mysqldump -h localhost -u root -p mydb > backup.sql
```

Um dump gerado dessa forma é um backup lógico, não um backup físico com PITR; para o procedimento usado pelo PostgreSQL deste notebook (gerenciado pelo CloudNativePG, com backup contínuo em object storage), veja [configurar backups do PostgreSQL](../../../../guides/tasks/databases/configure-postgresql-backups/) em vez de depender apenas de `pg_dump` manual.

## Referências

- [DBeaver](https://dbeaver.io/): download e documentação oficial.
- [pgAdmin](https://www.pgadmin.org/): documentação oficial, incluindo a imagem Docker.
- [DataGrip](https://www.jetbrains.com/datagrip/): página oficial da IDE JetBrains.
