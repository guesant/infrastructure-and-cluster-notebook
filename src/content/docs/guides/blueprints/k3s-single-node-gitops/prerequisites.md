---
title: Pré-requisitos
sidebar:
  order: 3
---

Confirme cada item antes de iniciar a [sequência de implantação](../k3s-single-node-gitops/implementation/).

## Infraestrutura

- Um host (físico ou VM) com Debian 12 (bookworm) instalado, acesso root e console fora do SSH disponível para recuperação.
- Recursos mínimos: 2 vCPUs, 2 GiB de memória, 20 GiB de disco livre em `/var/lib/rancher`; veja [validar requisitos do host](../../../guides/tasks/host/validate-host-requirements/) para os limites completos.
- Um endereço IP estável para o host, alcançável pela estação administrativa e, se houver publicação externa, pela Internet.
- Um domínio (ou subdomínio) sob controle, com acesso à zona DNS para o desafio ACME DNS-01.
- Credencial de API do provedor DNS com permissão de escrita na zona usada (necessária para o cert-manager).

## Repositório e ferramentas

- Um repositório Git (público ou privado) para hospedar a configuração GitOps.
- Uma estação administrativa com `kubectl`, Helm, a CLI do Argo CD e `git` instalados; veja [ferramentas de linha de comando](../../../toolbox/tools/kubernetes-management/command-line-tools/).
- Se o repositório for privado: uma chave SSH dedicada para o Argo CD (não uma chave pessoal reutilizada).

## Decisões que precisam ser tomadas antes de começar

- Hostname e `node-name` do host (únicos, mesmo em nó único; facilita expansão futura para multinó).
- Estratégia de armazenamento persistente: nenhuma, ou [Longhorn](../../../guides/tasks/storage/install-longhorn/). Este blueprint não decide por padrão.
- Quais módulos opcionais do GitOps ([templates copiáveis](../k3s-single-node-gitops/templates/)) serão habilitados no bootstrap inicial, e quais ficam para depois.

## Checkpoint

Todos os itens acima estão confirmados e documentados antes de seguir para [preparar um servidor Debian](../../../guides/tasks/host/prepare-debian-server/).

## Fontes e leitura adicional

- [K3s: Requirements](https://docs.k3s.io/installation/requirements): requisitos oficiais de sistema operacional, recursos e rede.
- [Desafio ACME DNS-01](https://cert-manager.io/docs/configuration/acme/dns01/): confirma a necessidade de acesso de escrita à zona DNS.
