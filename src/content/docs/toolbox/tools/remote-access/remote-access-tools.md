---
title: Clientes e gateways de acesso remoto
description: Catálogo de ferramentas de acesso remoto (OpenSSH, Teleport, bastion hosts, Apache Guacamole), com o que avaliar antes de escolher cada uma.
sidebar:
  order: 1
---

> **Para quem é:** operadores que precisam acessar hosts remotos via SSH, RDP ou VNC e querem comparar as opções antes de escolher uma.

SSH é o protocolo padrão de acesso remoto seguro em infraestrutura Linux, e a forma mais direta de usá-lo é com o cliente `ssh` da linha de comando. Para times maiores, com muitos operadores e necessidade de auditoria centralizada, um framework de acesso Zero Trust como o Teleport substitui a distribuição manual de chaves por certificados de curta duração e um registro completo das sessões. Quando o destino precisa ficar isolado da rede pública, um bastion host concentra o único ponto de entrada externo. E quando o acesso precisa acontecer sem instalar nenhum cliente, ou quando o destino fala RDP ou VNC em vez de SSH, um gateway HTML5 como o Apache Guacamole expõe esses protocolos direto no navegador.

## OpenSSH: cliente e servidor padrão

```bash
# Debian/Ubuntu
sudo apt install openssh-client

# Conectar
ssh user@host
```

**Quando usar:** é o caminho padrão para qualquer acesso remoto interativo a um host Linux. O pacote `openssh-client` já vem pré-instalado na maioria das distribuições desktop; a instalação explícita é necessária principalmente em imagens mínimas de container ou servidor.

**Considerações:** além da sessão interativa, o mesmo pacote inclui `scp` (cópia pontual de arquivos) e `sftp` (sessão de transferência interativa); veja [transferência de arquivos](../file-transfer/transfer-tools/) para uma comparação entre os dois. No Windows, a alternativa mais usada historicamente é o PuTTY, com interface gráfica própria; para acesso multiplataforma (desktop e mobile) com catálogo de hosts, o Termius é uma opção comercial (veja a linha correspondente na [tabela de acesso remoto](../overview/#acesso-remoto-e-administração-dos-hosts) do catálogo geral).

**Modelo de acesso, privilégios e autenticação:** a sessão herda os privilégios da conta usada para autenticar no host remoto; a autenticação pode ser por senha (desaconselhada para hosts administrativos) ou por par de chaves pública/privada, o padrão recomendado (veja [reforçar o SSH](../../../guides/tasks/host/harden-ssh/)). Não há um servidor central: cada host mantém sua própria lista de chaves autorizadas.

**Riscos:** uma chave privada sem senha (`passphrase`) copiada para uma máquina comprometida dá acesso direto a todo host que a aceita; proteja a chave privada com passphrase e, em ambientes com múltiplos operadores, prefira certificados de curta duração (como os do Teleport, abaixo) a chaves estáticas de longa duração.

**Licença e plataformas:** licença BSD/ISC (OpenSSH é mantido pelo projeto OpenBSD). Nativo em Linux, macOS e BSD; incluído por padrão no Windows 10 e superior.

## Teleport: acesso Zero Trust com auditoria

Framework que centraliza acesso, auditoria e conformidade para infraestrutura com muitos operadores. Em vez de distribuir chaves SSH estáticas para cada pessoa, o Teleport emite certificados de curta duração a partir de uma identidade autenticada centralmente, o que elimina a necessidade de gerenciar `authorized_keys` em cada host e revoga o acesso automaticamente quando o certificado expira.

**Quando usar:** ambientes com múltiplos operadores onde é necessário registrar quem acessou qual host e quando, especialmente em infraestrutura multi-cloud ou híbrida onde manter um inventário de chaves SSH por host se torna inviável.

**Considerações:** a auditoria completa e o RBAC granular exigem operar o próprio cluster do Teleport (ou a versão gerenciada como serviço), o que adiciona um componente central à infraestrutura de acesso; avalie esse custo operacional contra o ganho de auditoria antes de adotar em um cluster pequeno com poucos operadores.

**Modelo de acesso, privilégios e autenticação:** o operador autentica uma vez contra o Teleport (SSO, MFA ou usuário local), que emite um certificado de curta duração usado para acessar os hosts autorizados por RBAC; não há chave SSH estática de longo prazo para gerenciar ou revogar manualmente.

**Riscos:** o próprio Teleport vira o ponto único de autenticação e autorização para todo o parque de hosts; comprometer o cluster do Teleport (ou a identidade usada para autenticar nele) equivale a comprometer o acesso a tudo que ele controla, o mesmo raciocínio de risco concentrado já aplicado ao bastion host, abaixo.

**Licença e plataformas:** a partir da versão 16, a Community Edition segue uma licença comercial restrita (uso livre para pessoa física; empresas com menos de 100 funcionários e US$ 10 milhões de receita anual podem usar sem custo, mas não revender nem embutir em produto próprio); versões anteriores à 16 permanecem sob Apache 2.0. Confirme o modelo vigente na [página de licenciamento oficial](https://goteleport.com/pricing/) antes de adotar. Servidor multiplataforma (Linux principalmente); clientes disponíveis para Linux, macOS e Windows.

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

**Modelo de acesso, privilégios e riscos:** não é um produto instalável, é um papel que qualquer host com OpenSSH já assume; os privilégios e riscos são os do próprio OpenSSH descritos acima, concentrados em um único ponto de entrada. Esse é o principal risco adicional: o bastion é o alvo de maior valor da rede, porque comprometê-lo dá rota para tudo atrás dele.

**Licença e plataformas:** as mesmas do OpenSSH, que implementa o papel de bastion.

## Acesso via navegador

### Cockpit

Interface web nativa para administrar um host Linux individual (services, firewall, armazenamento, terminal), não um mecanismo de acesso a múltiplos hosts. A instalação, o endereço padrão e as ressalvas de segurança já estão documentados em [gerenciamento de hosts e clusters](../../host-management/cluster-tools/#cockpit); esta página não repete esses detalhes.

### Apache Guacamole: gateway HTML5 para RDP, VNC e SSH

Gateway HTML5 que expõe RDP, VNC e SSH direto no navegador, sem exigir a instalação de nenhum cliente na máquina do operador. A arquitetura combina um daemon (`guacd`) que fala os protocolos nativos com os hosts de destino e uma aplicação web que renderiza a sessão como HTML5/WebSocket para o navegador do operador, com um banco de dados (MySQL ou PostgreSQL) guardando conexões e usuários.

Guacamole não implementa um servidor RDP ou VNC próprio: ele se conecta como cliente a um servidor RDP (como o já embutido no Windows, quando a Área de Trabalho Remota está habilitada) ou VNC (como TigerVNC ou TightVNC) já em execução no host de destino. Isso o torna a opção mais direta deste catálogo quando o destino é uma máquina Windows ou um desktop Linux com servidor VNC, casos que OpenSSH, Teleport e um bastion, todos centrados em SSH, não cobrem sozinhos.

**Quando usar:** acesso remoto centralizado a múltiplos protocolos (RDP, VNC e SSH ao mesmo tempo) sem depender de um cliente instalado em cada estação, e quando um registro centralizado de quem acessou qual destino é necessário.

**Considerações:** o setup exige orquestrar `guacd`, a aplicação web e o banco de dados, normalmente via Docker Compose; é significativamente mais complexo de operar do que os clientes diretos acima. Como o Guacamole passa a ser o único ponto de autenticação para todos os destinos cadastrados nele, proteja o próprio Guacamole com autenticação forte e TLS antes de cadastrar qualquer host administrativo.

**Modelo de acesso, privilégios e autenticação:** o operador autentica na aplicação web do Guacamole (usuário/senha local, ou LDAP/SSO via extensão); a partir daí, o Guacamole guarda as credenciais de cada destino (RDP/VNC/SSH) e as usa por trás dos panos, sem expô-las de volta ao operador.

**Riscos:** o banco de credenciais de destino guardado pelo Guacamole é um alvo de alto valor, equivalente a um cofre de senhas administrativas; a mesma concentração de risco do bastion host se aplica aqui, mas sobre credenciais em vez de rota de rede.

**Licença e plataformas:** Apache License 2.0. `guacd` roda em Linux; o acesso do operador é via navegador, portanto multiplataforma por definição.

## Referências

- [OpenSSH documentation](https://man.openbsd.org/ssh): manual oficial do cliente `ssh`.
- [OpenSSH: ProxyJump](https://man.openbsd.org/ssh_config#ProxyJump): referência da diretiva usada para encadear o acesso via bastion.
- [Teleport documentation](https://goteleport.com/docs/): arquitetura, certificados de curta duração e RBAC.
- [Apache Guacamole documentation](https://guacamole.apache.org/doc/gug/): instalação, `guacd` e configuração de conexões RDP/VNC/SSH.
