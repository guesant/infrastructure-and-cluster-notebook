---
title: Configurar opções do servidor K3s
sidebar:
  order: 5
---

> **Pré-requisitos:** acesso root ao nó manager, K3s instalado conforme [instalar o primeiro servidor](../install-first-k3s-server/).
> **Versões testadas:** K3s v1.36.1+k3s1.

O K3s lê `/etc/rancher/k3s/config.yaml` na inicialização do serviço. Alterar esse arquivo é a forma recomendada de mudar opções do servidor de forma persistente e auditável — evite passar flags diretamente no `ExecStart` do systemd, que fica fora do controle de versão do host e é sobrescrito em atualizações do pacote.

Esta página cobre como adicionar ou alterar uma opção existente. Para o campo específico `tls-san`, veja [Configurar TLS SAN](../configure-tls-san/) — ele tem um procedimento próprio porque exige atenção ao comportamento de recriação de certificados.

## Alterar uma opção

> **Executar em:** nó manager, como `root`.

```bash
cp /etc/rancher/k3s/config.yaml /etc/rancher/k3s/config.yaml.bak
${EDITOR:-vi} /etc/rancher/k3s/config.yaml
```yaml

Mantenha o arquivo em YAML válido — uma chave duplicada ou indentação incorreta impede o K3s de iniciar. Depois de editar:

```bash
systemctl restart k3s
```yaml

Reiniciar o serviço em um manager único derruba a API por alguns segundos; em uma topologia HA, reinicie um servidor por vez e confirme `Ready` antes de seguir para o próximo.

## Opções comuns

| Opção | Efeito |
| --- | --- |
| `disable` | Remove componentes empacotados (ex.: `traefik`, `local-storage`, `metrics-server`) do bootstrap. |
| `node-taint` | Aplica taints ao nó na inicialização, útil para impedir workloads em um manager. |
| `kube-apiserver-arg` / `kubelet-arg` | Repassa flags adicionais para os componentes internos correspondentes. |
| `secrets-encryption` | Habilita criptografia de Secrets em repouso (já usada no primeiro servidor deste guia). |

Consulte a referência completa antes de adicionar uma opção não documentada aqui — algumas exigem reinstalação em vez de apenas reinício para terem efeito.

## Validação

> **Executar em:** nó manager.

```bash
systemctl status k3s
k3s kubectl get nodes
journalctl -u k3s -n 50 --no-pager
```yaml

Confirme que o serviço voltou a `active (running)`, o nó voltou a `Ready` e o journal não mostra erro de parsing do `config.yaml`.

## Troubleshooting

Se o K3s não reiniciar, o `journalctl -u k3s` normalmente aponta a linha exata do YAML inválido. Restaure o backup (`config.yaml.bak`) para recuperar o serviço rapidamente e corrija o arquivo com calma antes de tentar de novo.

## Rollback

```bash
cp /etc/rancher/k3s/config.yaml.bak /etc/rancher/k3s/config.yaml
systemctl restart k3s
```yaml

## Próximo passo

[Validar o cluster](../validate-k3s-cluster/).

## Fontes e leitura adicional

- [K3s — Configuration Options](https://docs.k3s.io/installation/configuration): explica a leitura do `config.yaml` e a precedência entre arquivo, variáveis de ambiente e flags.
- [K3s — Server Configuration Reference](https://docs.k3s.io/cli/server): lista todas as opções aceitas pelo servidor.
