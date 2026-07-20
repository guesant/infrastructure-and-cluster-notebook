---
title: Clientes SSH
description: Catálogo de ferramentas de acesso remoto (OpenSSH, Teleport, bastion hosts, Apache Guacamole), com o que avaliar antes de escolher cada uma.
sidebar:
  order: 1
---

> **Para quem é:** operadores que precisam acessar hosts remotos via SSH, RDP ou VNC e querem comparar as opções antes de escolher uma.

SSH é o protocolo padrão de acesso remoto seguro em infraestrutura Linux, e a forma mais direta de usá-lo é com o cliente `ssh` da linha de comando. Para times maiores, com muitos operadores e necessidade de auditoria centralizada, um framework de acesso Zero Trust como o Teleport substitui a distribuição manual de chaves por certificados de curta duração e um registro completo das sessões. Quando o destino precisa ficar isolado da rede pública, um bastion host concentra o único ponto de entrada externo. E quando o acesso precisa acontecer sem instalar nenhum cliente, um gateway HTML5 como o Apache Guacamole expõe RDP, VNC e SSH direto no navegador.

## OpenSSH: cliente e servidor padrão

```bash
# Debian/Ubuntu
sudo apt install openssh-client

# Conectar
ssh user@host
```

**Quando usar:** é o caminho padrão para qualquer acesso remoto interativo a um host Linux. O pacote `openssh-client` já vem pré-instalado na maioria das distribuições desktop; a instalação explícita é necessária principalmente em imagens mínimas de container ou servidor.

**Considerações:** além da sessão interativa, o mesmo pacote inclui `scp` (cópia pontual de arquivos) e `sftp` (sessão de transferência interativa); veja [transferência de arquivos](../file-transfer/transfer-tools/) para uma comparação entre os dois. No Windows, a alternativa mais usada historicamente é o PuTTY, com interface gráfica própria; para acesso multiplataforma (desktop e mobile) com catálogo de hosts, o Termius é uma opção comercial (veja a linha correspondente na [tabela de acesso remoto](../overview/#acesso-remoto-e-administração-dos-hosts) do catálogo geral).

## Teleport: acesso Zero Trust com auditoria

Framework que centraliza acesso, auditoria e conformidade para infraestrutura com muitos operadores. Em vez de distribuir chaves SSH estáticas para cada pessoa, o Teleport emite certificados de curta duração a partir de uma identidade autenticada centralmente, o que elimina a necessidade de gerenciar `authorized_keys` em cada host e revoga o acesso automaticamente quando o certificado expira.

**Quando usar:** ambientes com múltiplos operadores onde é necessário registrar quem acessou qual host e quando, especialmente em infraestrutura multi-cloud ou híbrida onde manter um inventário de chaves SSH por host se torna inviável.

**Considerações:** a auditoria completa e o RBAC granular exigem operar o próprio cluster do Teleport (ou a versão gerenciada como serviço), o que adiciona um componente central à infraestrutura de acesso; avalie esse custo operacional contra o ganho de auditoria antes de adotar em um cluster pequeno com poucos operadores.

## Bastion host: ponto único de entrada

Um bastion (ou jump host) é um host intermediário, geralmente o único exposto à rede pública, usado para alcançar hosts privados que não têm rota direta de fora:

```text
Operador → Bastion (público) → Host privado (rede interna)
```

O OpenSSH implementa essa cadeia nativamente com a diretiva `ProxyJump`, que abre a conexão até o host privado através do bastion sem exigir uma sessão SSH manual intermediária:

```bash
# ~/.ssh/config
Host private-server
  ProxyJump bastion-host
  HostName 10.0.1.100

ssh private-server
```

**Considerações:** o bastion concentra risco: qualquer comprometimento dele expõe a rota para todos os hosts privados alcançáveis a partir dele. Trate o bastion com o mesmo rigor de hardening aplicado a qualquer host exposto publicamente (veja [reforçar o SSH](../../../guides/tasks/host/harden-ssh/)), e restrinja por firewall quais origens podem alcançá-lo.

## Acesso via navegador

### Cockpit

Interface web nativa para administrar um host Linux individual (services, firewall, armazenamento, terminal), não um mecanismo de acesso a múltiplos hosts. A instalação, o endereço padrão e as ressalvas de segurança já estão documentados em [gerenciamento de hosts e clusters](../../host-management/cluster-tools/#cockpit); esta página não repete esses detalhes.

### Apache Guacamole

Gateway HTML5 que expõe RDP, VNC e SSH direto no navegador, sem exigir a instalação de nenhum cliente na máquina do operador. A arquitetura combina um daemon (`guacd`) que fala os protocolos nativos com os hosts de destino e uma aplicação web que renderiza a sessão como HTML5/WebSocket para o navegador do operador, com um banco de dados (MySQL ou PostgreSQL) guardando conexões e usuários.

**Quando usar:** acesso remoto centralizado a múltiplos protocolos (RDP, VNC e SSH ao mesmo tempo) sem depender de um cliente instalado em cada estação, e quando um registro centralizado de quem acessou qual destino é necessário.

**Considerações:** o setup exige orquestrar `guacd`, a aplicação web e o banco de dados, normalmente via Docker Compose; é significativamente mais complexo de operar do que os clientes diretos acima. Como o Guacamole passa a ser o único ponto de autenticação para todos os destinos cadastrados nele, proteja o próprio Guacamole com autenticação forte e TLS antes de cadastrar qualquer host administrativo.

## Referências

- [OpenSSH documentation](https://man.openbsd.org/ssh): manual oficial do cliente `ssh`.
- [OpenSSH: ProxyJump](https://man.openbsd.org/ssh_config#ProxyJump): referência da diretiva usada para encadear o acesso via bastion.
- [Teleport documentation](https://goteleport.com/docs/): arquitetura, certificados de curta duração e RBAC.
- [Apache Guacamole documentation](https://guacamole.apache.org/doc/gug/): instalação, `guacd` e configuração de conexões.
