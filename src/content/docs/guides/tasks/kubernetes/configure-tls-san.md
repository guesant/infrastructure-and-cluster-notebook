---
title: Configurar TLS SAN
sidebar:
  order: 6
---

> **Pré-requisitos:** acesso root a todos os nós manager, K3s instalado.
> **Versões testadas:** K3s v1.36.1+k3s1.

O certificado da API do K3s inclui uma lista fixa de nomes e IPs válidos (`tls-san`), definida na inicialização do primeiro servidor. Acessar a API por um endereço que não está nessa lista — um novo load balancer, um DNS adicional, um IP público somado depois — falha na validação TLS do cliente, mesmo que a conectividade de rede funcione normalmente.

Adicionar um `tls-san` depois da instalação não altera um certificado já emitido: o K3s só reemite o certificado do servidor quando ele está próximo do vencimento ou quando forçado manualmente. Planeje todos os endereços de acesso à API antes do primeiro servidor sempre que possível; esta página cobre o caminho para quando isso não foi possível.

## Adicionar um SAN

Edite `/etc/rancher/k3s/config.yaml` em cada nó manager e acrescente o novo valor à lista `tls-san`:

> **Executar em:** cada nó manager, como `root`.

```bash
read -r -p "Novo nome ou IP para tls-san: " NEW_TLS_SAN

cp /etc/rancher/k3s/config.yaml /etc/rancher/k3s/config.yaml.bak
python3 - "${NEW_TLS_SAN}" <<'PYEOF'
import sys
import yaml

path = "/etc/rancher/k3s/config.yaml"
with open(path) as f:
    config = yaml.safe_load(f) or {}

config.setdefault("tls-san", [])
if sys.argv[1] not in config["tls-san"]:
    config["tls-san"].append(sys.argv[1])

with open(path, "w") as f:
    yaml.safe_dump(config, f, default_flow_style=False)
PYEOF
```yaml

Esse trecho usa `python3`/`pyyaml` para editar o YAML preservando as demais chaves; se `pyyaml` não estiver disponível no host, edite o arquivo manualmente com o mesmo cuidado descrito em [configurar opções do servidor](../configure-k3s-server-options/).

## Forçar a reemissão do certificado

O novo SAN só passa a valer no certificado depois de uma reemissão. Force-a removendo o certificado dinâmico do servidor (o K3s recria automaticamente na inicialização) e reinicie o serviço:

> **Executar em:** cada nó manager, um de cada vez, como `root`.

```bash
mv /var/lib/rancher/k3s/server/tls/dynamic-cert.json /var/lib/rancher/k3s/server/tls/dynamic-cert.json.bak
systemctl restart k3s
```yaml

Em uma topologia HA, aguarde o nó voltar a `Ready` antes de repetir o procedimento no próximo manager — os certificados são independentes por nó, mas os clientes precisam encontrar pelo menos um manager saudável durante o processo.

## Validação

> **Executar em:** estação administrativa com o kubeconfig apontando para o novo endereço.

```bash
openssl s_client -connect "${NEW_TLS_SAN}:6443" -showcerts </dev/null 2>/dev/null | openssl x509 -noout -text | grep -A1 "Subject Alternative Name"
kubectl --server "https://${NEW_TLS_SAN}:6443" cluster-info
```yaml

O SAN adicionado deve aparecer na lista `Subject Alternative Name` e `kubectl` deve conseguir se conectar pelo novo endereço sem erro de certificado.

## Troubleshooting

Se o certificado continuar sem o novo SAN após o restart, confirme que `dynamic-cert.json.bak` foi realmente removido do caminho original em todos os managers — um único manager com o certificado antigo pode continuar respondendo a requisições, mascarando o resultado do teste.

## Rollback

```bash
cp /etc/rancher/k3s/config.yaml.bak /etc/rancher/k3s/config.yaml
systemctl restart k3s
```yaml

Remover um SAN já em uso por clientes ativos quebra o acesso deles; comunique a mudança antes de reverter.

## Próximo passo

[Validar o cluster](../validate-k3s-cluster/).

## Fontes e leitura adicional

- [K3s — Server Configuration Reference](https://docs.k3s.io/cli/server): documenta o campo `tls-san` e seu efeito no certificado do servidor.
- [K3s — Certificate Rotation](https://docs.k3s.io/cli/certificate): explica o ciclo de vida e a rotação dos certificados internos do K3s.
