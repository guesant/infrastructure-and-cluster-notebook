# cluster-management-notes

## Configuração geral das máquinas (físicas e virtuais)

### Por padrão, fechar todas as portas de entrada.

#### Tome cuidado com as ports do docker

> [!WARNING]
> Quando uma porta de um container é publicada pelo Docker, ela pode não ser filtrada da maneira esperada pelo UFW ou pelo firewalld.

Com UFW, o Docker desvia o tráfego publicado antes que ele passe pelas chains normalmente gerenciadas pelo UFW. Com firewalld, o Docker cria uma zona chamada docker, cujo target padrão é ACCEPT.

Portanto, não considere uma porta publicada pelo Docker protegida apenas porque o firewall do host possui uma política padrão de bloqueio.

Para serviços que só devem ser acessados pelo próprio host, prefira:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

Para serviços que devem ser acessados somente por uma rede específica, também é possível fazer bind diretamente no endereço da interface:

```yaml
ports:
  - "192.168.1.10:5432:5432"
```

Evite publicar apenas como 5432:5432, pois isso normalmente faz bind em todas as interfaces disponíveis.

#### Caso use ufw para controlar as regras

Negar qualquer entrada, permitir qualquer saída.

```bash
ufw default deny incoming
ufw default allow outgoing
```

Escolha uma das opções abaixo para liberar o acesso à porta 22 (sshd).

```bash
# Permite conexões TCP à porta 22, de qualquer origem e por qualquer interface
ufw allow in 22/tcp

# Permite conexões TCP à porta 22 somente quando entrarem pela interface eth1
ufw allow in on eth1 to any port 22 proto tcp

# Permite conexões TCP à porta 22 somente quando vierem da sub-rede indicada,
# independentemente da interface de entrada
ufw allow in from 192.168.1.0/24 to any port 22 proto tcp

# Permite conexões TCP à porta 22 somente quando:
# - entrarem pela interface eth1; e
# - vierem da sub-rede 192.168.1.0/24
ufw allow in on eth1 from 192.168.1.0/24 to any port 22 proto tcp
```

Habilitar e aplicar as regras:

```bash
# caso ainda não tenha o ufw habilitado
ufw enable

# caso já tenha habilitado, só fazer o reload
ufw reload
```

</details>

#### Caso use firewalld para controlar as regras

TODO.

### Deixar o servidor SSH mais rígido

Confirme que é possível entrar sem informar a senha da conta:

```bash
ssh usuario@ip-do-servidor
```

Mantenha essa sessão aberta enquanto altera a configuração. Ela poderá ser usada para corrigir o servidor caso uma nova conexão não funcione.

```sh
install -d \
  -o root \
  -g root \
  -m 0755 \
  /etc/ssh/sshd_config.d \
;
```

```sh
${EDITOR:-nano} /etc/ssh/sshd_config.d/00-hardening.conf
```

```sh
# Exigir autenticação por chave pública
PubkeyAuthentication yes
AuthenticationMethods publickey

# Desabilitar autenticação por senha
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no

# Manter verificações de conta e sessão do PAM
UsePAM yes

# Impedir login direto como root
PermitRootLogin no

# Validar permissões do home, ~/.ssh e authorized_keys
StrictModes yes

# Reduzir a janela e o número de tentativas de autenticação
LoginGraceTime 30
MaxAuthTries 4

# Desabilitar funcionalidades não utilizadas
X11Forwarding no
PermitTunnel no
PermitUserEnvironment no

# Aumentar os detalhes úteis para auditoria
LogLevel VERBOSE
```

Restringir quais usuários podem acessar

```sh
groupadd --force ssh-users
```

```sh
usermod -aG ssh-users $USER
```

Acrescente ao arquivo `/etc/ssh/sshd_config.d/00-hardening.conf`:

```sh
${EDITOR:-nano} /etc/ssh/sshd_config.d/00-hardening.conf
```

```text
AllowGroups ssh-users
```

**Desabilitar encaminhamentos SSH**

Caso o servidor não utilize túneis SSH, encaminhamento de portas, agent forwarding, X11, ProxyJump ou ferramentas que dependam dessas funcionalidades, pode-se acrescentar:

```text
DisableForwarding yes
```

Não habilite essa opção em servidores acessados por VS Code Remote SSH, túneis com `ssh -L`/`ssh -R`, bastion hosts ou conexões que utilizem `ProxyJump`.

**Validar a configuração**

Antes de aplicar, verifique a sintaxe:

```bash
sshd -t
```

Recarregue o serviço sem encerrar as conexões existentes:

```bash
systemctl reload ssh
```

bra outro terminal e teste uma nova conexão:

```bash
ssh usuario@ip-do-servidor
```

Também confirme que senha não é aceita:

```bash
ssh \
  -o PubkeyAuthentication=no \
  -o PreferredAuthentications=password,keyboard-interactive \
  usuario@ip-do-servidor
```

Essa tentativa deverá terminar com uma mensagem semelhante a:

```text
Permission denied (publickey).
```

Somente encerre a sessão SSH original depois que a nova conexão por chave funcionar.

**Permissões da chave autorizada**

No servidor, o diretório e o arquivo de chaves devem pertencer ao usuário e não devem ser graváveis por terceiros:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Para corrigir o proprietário, quando necessário:

```bash
chown -R "$(id -un):$(id -gn)" ~/.ssh
```

### Configurar fail2ban

```bash
apt update
apt install --yes \
  fail2ban \
  python3-systemd
```

```bash
${EDITOR:-nano} /etc/fail2ban/jail.d/sshd.local
```

```conf
[DEFAULT]
# Endereços que nunca devem ser bloqueados
ignoreip = 127.0.0.1/8 ::1 # 192.168.0.0/24 10.0.0.0/8

# Bloqueio inicial
bantime = 1h

# Janela na qual as falhas serão contabilizadas
findtime = 10m

# Quantidade de falhas permitidas dentro da janela
maxretry = 5

# Aumentar progressivamente o tempo de bloqueio para reincidentes
bantime.increment = true
bantime.maxtime = 1w

# Não fazer resolução DNS para os endereços encontrados nos logs
usedns = no

[sshd]
enabled = true
port = ssh
# Ler os eventos diretamente do journal do systemd
backend = systemd
# Modos disponíveis: normal, ddos, extra e aggressive
mode = normal
```

**Validar a configuração**

Antes de iniciar ou reiniciar o serviço:

```bash
fail2ban-client -t
```

A validação deve terminar com:

```text
OK: configuration test is successful
```

**Habilite e inicie o serviço:**

```bash
systemctl enable --now fail2ban
```

**Depois de alterar a configuração:**

```bash
fail2ban-client -t &&
systemctl restart fail2ban
```

**Verificar o funcionamento**

Verifique se o daemon está respondendo:

```bash
fail2ban-client ping
```

Saída esperada:

```text
Server replied: pong
```

Liste as jails habilitadas:

```bash
fail2ban-client status
```

Verifique especificamente a proteção do SSH:

```bash
fail2ban-client status sshd
```

**Acompanhar os logs**

Logs do Fail2Ban:

```bash
journalctl \
  --unit fail2ban \
  --follow
```

Logs do SSH:

```bash
journalctl \
  --unit ssh \
  --follow
```

Eventos recentes de bloqueio:

```bash
journalctl \
  --unit fail2ban \
  --since "1 hour ago" \
  | grep -E 'Ban|Unban'
```

## Gestão dos nós do cluster k3s

### server

#### Iniciar o cluster

Para gerar um token seguro para o nó:

```bash
# caso esteja usando wayland
openssl rand -hex 64 | tr -d '\n' | wl-copy

# caso esteja usando x.org
openssl rand -hex 64 | tr -d '\n' | xclip -sel copy
```

```sh
bash <<'EOF'
  read -r -p "IP do nó: " K3S_NODE_IP </dev/tty
  read -r -p "Nome do nó: " K3S_NODE_NAME </dev/tty
  read -r -s -p "Token do cluster: " K3S_TOKEN </dev/tty
  printf '\n' >/dev/tty
  read -r -p "Host da API k8s: " K3S_API_HOST </dev/tty

  curl -sfL https://get.k3s.io | sh -s - server \
    --node-ip "${K3S_NODE_IP}" \
    --node-name "${K3S_NODE_NAME}" \
    --token "${K3S_TOKEN}" \
    --tls-san "${K3S_API_HOST}" \
    --tls-san "${K3S_NODE_IP}" \
    --cluster-init \
  ;

  export KUBECONFIG="/etc/rancher/k3s/k3s.yaml"

  echo "aguardando kubeconfig..."
  until [[ -f ${KUBECONFIG} ]]; do
    sleep 3
  done

  echo "aguardando ready..."
  kubectl wait --for=condition=Ready node/${K3S_NODE_NAME} --timeout=120s

  echo "cluster instalado."
EOF
```

Configurar traefik:

```bash
kubectl apply -f - <<'EOF'
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system

spec:
  valuesContent: |-
    providers:
      kubernetesGateway:
        enabled: true

    gateway:
      enabled: false

    ports:
      web:
        port: 80
        exposedPort: 80
        expose:
          default: true

      websecure:
        port: 443
        exposedPort: 443
        expose:
          default: true
EOF
```

#### Acrescentar manager

```sh
bash <<'EOF'
  read -r -p "IP do nó: " K3S_NODE_IP </dev/tty
  read -r -p "Nome do nó: " K3S_NODE_NAME </dev/tty
  read -r -s -p "Token do cluster: " K3S_TOKEN </dev/tty
  printf '\n' >/dev/tty
  read -r -p "Host da API k8s: " K3S_API_HOST </dev/tty

  curl -sfL https://get.k3s.io | sh -s - server \
    --server "https://${K3S_API_HOST}:6443" \
    --node-ip "${K3S_NODE_IP}" \
    --node-name "${K3S_NODE_NAME}" \
    --token "${K3S_TOKEN}" \
    --tls-san "${K3S_API_HOST}" \
    --disable local-storage \
  ;

  export KUBECONFIG="/etc/rancher/k3s/k3s.yaml"

  echo "aguardando kubeconfig..."
  until [[ -f ${KUBECONFIG} ]]; do
    sleep 3
  done

  echo "aguardando ready..."
  kubectl wait --for=condition=Ready node/${K3S_NODE_NAME} --timeout=120s

  echo "manager acrescentado."
EOF
```

### agent

#### Acrescentar agent

```sh
bash <<'EOF'
  read -r -p "IP do nó: " K3S_NODE_IP </dev/tty
  read -r -p "Nome do nó: " K3S_NODE_NAME </dev/tty
  read -r -s -p "Token do cluster: " K3S_TOKEN </dev/tty
  printf '\n' >/dev/tty
  read -r -p "Host da API k8s: " K3S_API_HOST </dev/tty

  curl -sfL https://get.k3s.io | sh -s - agent \
    --server "https://${K3S_API_HOST}:6443" \
    --node-ip "${K3S_NODE_IP}" \
    --node-name "${K3S_NODE_NAME}" \
    --token "${K3S_TOKEN}" \
  ;

  echo "manager acrescentado."
EOF
```

## Subir serviços base

### cert-manager

```bash
helm upgrade \
  --repo https://charts.jetstack.io cert-manager \
  --install cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set crds.enabled=true \
  --set config.gatewayAPI.enabled=true \
  --set-json 'extraArgs=[
    "--dns01-recursive-nameservers-only",
    "--dns01-recursive-nameservers=1.1.1.1:53,8.8.8.8:53"
  ]' \
  --wait \
;
```

### longhorn

Veja antes os requisitos: <https://longhorn.io/docs/1.12.0/deploy/install/#installation-requirements>.

> A container runtime compatible with Kubernetes (Docker v1.13+, containerd v1.3.7+, etc.)
>
> - Kubernetes >= v1.25
> - RWX support requires that each node has a NFSv4 client installed.
>   - For installing a NFSv4 client, refer to Install NFSv4 client.
> - bash, curl, findmnt, grep, awk, blkid, lsblk must be installed.
> - Mount propagation must be enabled.

O longhorn disponibiliza o `longhornctl` para ajudar com algumas operações, veja mais em: <https://longhorn.io/docs/1.12.0/advanced-resources/longhornctl/> e em <https://github.com/longhorn/cli>.

```bash
# identificar possíveis problemas antes do uso
longhornctl check preflight

# instalar depedências antes do uso
longhornctl install preflight
```

Para instalar o longhornctl:

```bash
curl -sfL https://raw.githubusercontent.com/guesant/cluster-management-notes/refs/heads/main/scripts/install/longhornctl.sh | bash -
```

```bash
helm upgrade \
  --repo https://charts.longhorn.io longhorn \
  --version 1.12.0 \
  --install longhorn \
  --namespace longhorn-system \
  --create-namespace \
  --wait \
  ;
```

Para acessar a interface web do Longhorn por port-forward:

```bash
kubectl --namespace longhorn-system port-forward service/longhorn-frontend 8080:80
```

```bash
ssh -N -L 8080:127.0.0.1:8080 usuario@ip-do-servidor
```
