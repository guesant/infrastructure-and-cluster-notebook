---
title: Acesso remoto
sidebar:
  order: 4
---

O `kubectl` não precisa ser executado em um nó do cluster. Ele envia requisições HTTPS para a API Kubernetes e usa um **kubeconfig** para descobrir o endpoint, a autoridade certificadora, a identidade do usuário e o contexto selecionado. Portanto, qualquer máquina com conectividade até a API e credenciais autorizadas pode administrar o cluster.

Um contexto combina cluster, usuário e namespace padrão. O arquivo gerado pelo K3s para o administrador possui privilégios amplos; copiar esse arquivo equivale a copiar uma credencial administrativa, não apenas uma configuração de endereço. Use somente kubeconfigs confiáveis, mantenha permissões restritas e crie identidades com privilégios menores para outros usuários e automações. Referência: [organização de acesso com kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/).

Copie `/etc/rancher/k3s/k3s.yaml` para `~/.kube/config` na estação administrativa, substitua o endereço `127.0.0.1` pelo endpoint estável da API e proteja o arquivo:

> **Executar em:** estação administrativa onde o kubeconfig foi copiado e que possui acesso à API.

```bash
chmod 0600 ~/.kube/config
kubectl cluster-info
kubectl auth can-i '*' '*' --all-namespaces
```yaml

:::caution
Esse kubeconfig é administrativo. Não o compartilhe com aplicações nem com usuários que não devam ter acesso total ao cluster.
:::

Para criar credenciais menos privilegiadas, continue em [Identidade, autenticação e RBAC](../configure-rbac/).

## Fontes e leitura adicional

- [Acesso ao cluster no K3s](https://docs.k3s.io/cluster-access): descreve a origem do kubeconfig administrativo, a troca do endpoint e a renovação de suas credenciais.
- [Organização do acesso com kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/): explica clusters, usuários, contextos e os cuidados ao carregar arquivos de configuração.
- [Acesso a clusters pela API Kubernetes](https://kubernetes.io/docs/tasks/administer-cluster/access-cluster-api/): apresenta os caminhos suportados para clientes, proxies e acesso direto à API.
- [Controle de acesso à API](https://kubernetes.io/docs/concepts/security/controlling-access/): relaciona transporte seguro, autenticação, autorização e admission control.
