# small cluster

## Configuração geral

### Por padrão, fechar todas as portas de entrada.

Nota: ao expor portas usando o docker, as regras feitas com o ufw e firewalld são "ignoradas", pois a tabela usada pelo docker (nat) precede às que forem configuradas. Sendo assim, prefira "- 127.0.0.1:5432:5432" no lugar de "- 5432:5432".

**Caso esteja usando ufw:**

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

2. Configurar SSHD para somente acessar autenticação via chave SSH.

### Configurar fail2ban

TODO

## Gestão dos nós do cluster k3s

### server

```bash
mkdir -p /var/lib/rancher/k3s/server/manifests;
${EDITOR:-nano} /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
```

Coloque isso em `/var/lib/rancher/k3s/server/manifests/traefik-config.yaml`:

```yaml
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
```

Ajuste as permissões:

```sh
chmod 644 /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
```

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
    --cluster-init

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
    --tls-san "${K3S_API_HOST}"

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

