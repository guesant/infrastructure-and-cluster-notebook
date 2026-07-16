# Configuração dos hosts

[Voltar ao guia principal](../README.md)

## Firewall

O firewall do host controla quais conexões de rede podem chegar aos serviços da máquina. Ele é a primeira barreira contra portas expostas desnecessariamente, mas não substitui autenticação, atualização dos serviços nem políticas de acesso dentro do Kubernetes. Por padrão, bloqueie conexões de entrada e permita apenas o que for necessário.

### Portas publicadas pelo Docker

> [!WARNING]
> Uma porta publicada pelo Docker pode não ser filtrada da maneira esperada pelo UFW ou pelo firewalld.

Com UFW, o Docker pode encaminhar o tráfego publicado antes que ele passe pelas chains normalmente gerenciadas pelo UFW. Com firewalld, o Docker cria uma zona chamada `docker`, cujo target padrão é `ACCEPT`.

Portanto, não considere uma porta publicada pelo Docker protegida apenas porque o firewall do host possui uma política padrão de bloqueio.

Para serviços que só devem ser acessados pelo próprio host, faça bind no loopback:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

Para serviços que devem ser acessados somente por uma rede específica, faça bind no endereço da interface correspondente:

```yaml
ports:
  - "192.168.1.10:5432:5432"
```

Evite publicar apenas como `5432:5432`, pois isso normalmente faz bind em todas as interfaces disponíveis.

### UFW

Defina as políticas padrão:

> **Executar em:** nó alvo, como `root`.

```bash
ufw default deny incoming
ufw default allow outgoing
```

Antes de habilitar o UFW remotamente, libere o SSH. Informe somente as restrições usadas no ambiente; deixar interface ou CIDR vazios permite o acesso por qualquer interface ou origem, respectivamente.

> **Executar em:** nó alvo, como `root`.

```bash
bash <<'EOF'
set -euo pipefail

read -r -p "Porta TCP do SSH [22]: " SSH_PORT </dev/tty
read -r -p "Interface de entrada (Enter para qualquer): " SSH_INTERFACE </dev/tty
read -r -p "CIDR de origem (Enter para qualquer): " SSH_SOURCE_CIDR </dev/tty

SSH_PORT="${SSH_PORT:-22}"
UFW_RULE=(allow in)

if [[ -n "${SSH_INTERFACE}" ]]; then
  UFW_RULE+=(on "${SSH_INTERFACE}")
fi

if [[ -n "${SSH_SOURCE_CIDR}" ]]; then
  UFW_RULE+=(from "${SSH_SOURCE_CIDR}")
fi

UFW_RULE+=(to any port "${SSH_PORT}" proto tcp)

printf 'Regra que será adicionada: ufw'
printf ' %q' "${UFW_RULE[@]}"
printf '\n'
ufw "${UFW_RULE[@]}"
EOF
```

Nos hosts K3s, libere também a comunicação interna do cluster. Restrinja `K3S_NODE_CIDR` à rede que contém somente os nós; nunca exponha VXLAN/UDP 8472 à Internet.

Nos managers e agents:

> **Executar em:** todos os nós manager e agent, como `root`.

```bash
bash <<'EOF'
set -euo pipefail

read -r -p "CIDR da rede privada dos nós: " K3S_NODE_CIDR </dev/tty
read -r -p "CIDR dos Pods [10.42.0.0/16]: " K3S_POD_CIDR </dev/tty
read -r -p "CIDR dos Services [10.43.0.0/16]: " K3S_SERVICE_CIDR </dev/tty

K3S_POD_CIDR="${K3S_POD_CIDR:-10.42.0.0/16}"
K3S_SERVICE_CIDR="${K3S_SERVICE_CIDR:-10.43.0.0/16}"

if [[ -z "${K3S_NODE_CIDR}" ]]; then
  printf 'O CIDR dos nós não pode ficar vazio.\n' >&2
  exit 1
fi

# Em todos os nós: Flannel VXLAN e métricas/API do kubelet.
ufw allow in from "${K3S_NODE_CIDR}" to any port 8472 proto udp
ufw allow in from "${K3S_NODE_CIDR}" to any port 10250 proto tcp

# CIDRs padrão dos pods e serviços do K3s.
ufw allow in from "${K3S_POD_CIDR}"
ufw allow in from "${K3S_SERVICE_CIDR}"
EOF
```

Somente nos managers:

> **Executar em:** todos os nós manager, como `root`.

```bash
bash <<'EOF'
set -euo pipefail

read -r -p "CIDR da rede privada dos nós: " K3S_NODE_CIDR </dev/tty

if [[ -z "${K3S_NODE_CIDR}" ]]; then
  printf 'O CIDR dos nós não pode ficar vazio.\n' >&2
  exit 1
fi

# Supervisor e API Kubernetes.
ufw allow in from "${K3S_NODE_CIDR}" to any port 6443 proto tcp

# Comunicação entre managers com etcd embarcado.
ufw allow in from "${K3S_NODE_CIDR}" to any port 2379:2380 proto tcp
EOF
```

Se a API também for administrada por uma rede separada, acrescente uma regra TCP/6443 restrita a essa rede. Se usar Flannel WireGuard em vez de VXLAN, libere UDP/51820 e, para IPv6, UDP/51821 entre os nós no lugar de UDP/8472. Exponha TCP/80, TCP/443 e NodePorts somente quando a arquitetura dos serviços exigir.

Confira as regras antes de habilitar o firewall:

> **Executar em:** nó alvo, como `root`.

```bash
ufw show added
```

Habilite ou recarregue as regras:

> **Executar em:** nó alvo, como `root`.

```bash
read -r -p "O UFW já está ativo? [s/N]: " UFW_ALREADY_ACTIVE

if [[ "${UFW_ALREADY_ACTIVE,,}" == "s" ]]; then
  ufw reload
else
  ufw enable
fi
```

Valide o estado efetivo e teste uma nova conexão SSH antes de encerrar a sessão original:

> **Executar em:** nó alvo, como `root`.

```bash
ufw status verbose
```

### firewalld

TODO.

## Hardening do SSH

Hardening é a redução deliberada da superfície de ataque de um serviço. Nesta seção, o SSH continuará aceitando administração remota por chave pública, mas recusará senhas, login direto de `root`, usuários fora do grupo autorizado e funcionalidades que não forem necessárias. Essa configuração reduz as formas de entrada; ela não substitui o firewall nem a proteção da chave privada usada pelo administrador.

### Preparação

Escolha explicitamente a conta que continuará autorizada a entrar. Não use `$USER` em um shell de `root`, pois isso pode configurar a conta errada.

> **Executar em:** nó alvo que terá o SSH endurecido, como `root`.

```bash
bash <<'EOF'
set -euo pipefail

if (( EUID != 0 )); then
  printf 'Execute este bloco em um shell root aberto com sudo -i.\n' >&2
  exit 1
fi

read -r -p "Usuário que poderá acessar por SSH: " SSH_USER </dev/tty

if ! id "${SSH_USER}" >/dev/null 2>&1; then
  printf 'Usuário inexistente: %s\n' "${SSH_USER}" >&2
  exit 1
fi

SSH_HOME="$(getent passwd "${SSH_USER}" | cut -d: -f6)"
SSH_GROUP="$(id -gn "${SSH_USER}")"

if [[ -z "${SSH_HOME}" ]]; then
  printf 'Não foi possível identificar o home de %s.\n' "${SSH_USER}" >&2
  exit 1
fi

install -d \
  -o "${SSH_USER}" \
  -g "${SSH_GROUP}" \
  -m 0700 \
  "${SSH_HOME}/.ssh"

if [[ ! -s "${SSH_HOME}/.ssh/authorized_keys" ]]; then
  printf 'Chave ausente em %s/.ssh/authorized_keys.\n' "${SSH_HOME}" >&2
  exit 1
fi

chown "${SSH_USER}:${SSH_GROUP}" "${SSH_HOME}/.ssh/authorized_keys"
chmod 0600 "${SSH_HOME}/.ssh/authorized_keys"

groupadd --force ssh-users
usermod --append --groups ssh-users "${SSH_USER}"

printf '\nUsuário e grupo preparados:\n'
id "${SSH_USER}"
getent group ssh-users
EOF
```

Confirme, antes de alterar o servidor, que a conta entra usando uma chave e sem pedir a senha da conta:

> **Executar em:** estação administrativa com acesso SSH ao nó alvo.

```bash
read -r -p "Usuário SSH: " SSH_USER
read -r -p "Host ou IP do servidor: " SSH_HOST
ssh "${SSH_USER}@${SSH_HOST}"
```

Mantenha essa sessão aberta enquanto altera a configuração. Corrija também as permissões da chave autorizada com o bloco acima.

> [!IMPORTANT]
> A nova associação ao grupo só estará presente em novas sessões da conta.

### Configuração

O bloco abaixo grava a configuração completa, pergunta se todos os encaminhamentos devem ser bloqueados, valida o resultado e só então oferece o reload do serviço:

> **Executar em:** nó alvo que terá o SSH endurecido, como `root`.

```bash
bash <<'EOF'
set -euo pipefail

if (( EUID != 0 )); then
  printf 'Execute este bloco em um shell root aberto com sudo -i.\n' >&2
  exit 1
fi

install -d -o root -g root -m 0755 /etc/ssh/sshd_config.d

cat >/etc/ssh/sshd_config.d/00-hardening.conf <<'SSHD_CONFIG'
# Exigir autenticação por chave pública.
PubkeyAuthentication yes
AuthenticationMethods publickey

# Desabilitar autenticação por senha.
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no

# Manter verificações de conta e sessão do PAM.
UsePAM yes

# Validar permissões do home, ~/.ssh e authorized_keys.
StrictModes yes

# Reduzir a janela e o número de tentativas de autenticação.
LoginGraceTime 30
MaxAuthTries 4

# Desabilitar funcionalidades não utilizadas.
X11Forwarding no
PermitTunnel no
PermitUserEnvironment no

# Restringir acesso e impedir login direto como root.
AllowGroups ssh-users
PermitRootLogin no

# Aumentar os detalhes úteis para auditoria.
LogLevel VERBOSE
SSHD_CONFIG

read -r -p \
  "Desabilitar todos os encaminhamentos SSH? [s/N]: " \
  DISABLE_FORWARDING \
  </dev/tty

if [[ "${DISABLE_FORWARDING,,}" == "s" ]]; then
  printf '\nDisableForwarding yes\n' \
    >>/etc/ssh/sshd_config.d/00-hardening.conf
fi

sshd -t

printf '\nConfiguração efetiva:\n'
sshd -T | grep -E \
  '^(authenticationmethods|allowgroups|disableforwarding|kbdinteractiveauthentication|maxauthtries|passwordauthentication|permitrootlogin|pubkeyauthentication|usepam) '

read -r -p "Recarregar o serviço SSH agora? [s/N]: " RELOAD_SSH </dev/tty

if [[ "${RELOAD_SSH,,}" == "s" ]]; then
  systemctl reload ssh
  systemctl --no-pager --full status ssh
else
  printf 'Configuração gravada, mas ainda não aplicada.\n'
fi
EOF
```

Não habilite `DisableForwarding` em servidores acessados por VS Code Remote SSH, túneis com `ssh -L`/`ssh -R`, bastion hosts ou conexões que usam `ProxyJump`.

### Validação

O bloco anterior já valida a sintaxe antes de permitir o reload. Abra outro terminal e teste uma nova conexão:

> **Executar em:** estação administrativa, em outro terminal.

```bash
read -r -p "Usuário SSH: " SSH_USER
read -r -p "Host ou IP do servidor: " SSH_HOST
ssh "${SSH_USER}@${SSH_HOST}"
```

Confirme também que senha e keyboard-interactive não são aceitos:

> **Executar em:** estação administrativa.

```bash
read -r -p "Usuário SSH: " SSH_USER
read -r -p "Host ou IP do servidor: " SSH_HOST

ssh \
  -o PubkeyAuthentication=no \
  -o PreferredAuthentications=password,keyboard-interactive \
  "${SSH_USER}@${SSH_HOST}"
```

A tentativa deve terminar com uma mensagem semelhante a:

```text
Permission denied (publickey).
```

Somente encerre a sessão SSH original depois que a nova conexão por chave funcionar.

## Fail2Ban

O Fail2Ban observa os logs de autenticação, identifica endereços que repetem falhas dentro de uma janela e solicita ao firewall um bloqueio temporário. Ele complementa o firewall e o hardening do SSH, mas não torna uma senha fraca segura e não deve ser a única proteção de um serviço exposto.

As camadas usadas neste guia têm responsabilidades diferentes:

| Camada | Responsabilidade |
| --- | --- |
| Firewall | Permitir somente origens, protocolos e portas necessários |
| Hardening do SSH | Restringir usuários, métodos de autenticação e funcionalidades do servidor SSH |
| Fail2Ban | Reagir a tentativas repetidas registradas nos logs |

Instale os pacotes:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
apt-get update
apt-get install --yes fail2ban python3-systemd
```

Edite a jail do SSH:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
${EDITOR:-nano} /etc/fail2ban/jail.d/sshd.local
```

```ini
[DEFAULT]
# Endereços que nunca devem ser bloqueados.
# Acrescente redes administrativas somente quando necessário, por exemplo:
# ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24 10.0.0.0/8
ignoreip = 127.0.0.1/8 ::1

# Bloqueio inicial.
bantime = 1h

# Janela na qual as falhas serão contabilizadas.
findtime = 10m

# Quantidade de falhas permitidas dentro da janela.
maxretry = 5

# Aumentar progressivamente o tempo de bloqueio para reincidentes.
bantime.increment = true
bantime.maxtime = 1w

# Não resolver DNS para os endereços encontrados nos logs.
usedns = no

[sshd]
enabled = true
# Ajuste se o SSH não usar a porta associada ao serviço "ssh".
port = ssh
# Ler eventos diretamente do journal do systemd.
backend = systemd
# Modos disponíveis: normal, ddos, extra e aggressive.
mode = normal
```

Valide antes de iniciar ou reiniciar:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
fail2ban-client -t
```

A validação deve terminar com:

```text
OK: configuration test is successful
```

Habilite e inicie o serviço:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
systemctl enable --now fail2ban
```

Depois de qualquer alteração, valide antes de reiniciar:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
fail2ban-client -t && systemctl restart fail2ban
```

Verifique o funcionamento:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
fail2ban-client ping
fail2ban-client status
fail2ban-client status sshd
```

A resposta do primeiro comando deve ser:

```text
Server replied: pong
```

Consulte os logs quando necessário:

> **Executar em:** nó alvo protegido pelo Fail2Ban, como `root`.

```bash
journalctl --unit fail2ban --follow
journalctl --unit ssh --follow
journalctl --unit fail2ban --since "1 hour ago" | grep -E 'Ban|Unban'
```
