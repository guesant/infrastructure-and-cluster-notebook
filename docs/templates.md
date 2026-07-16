# Templates copiáveis

[Voltar ao guia principal](../README.md)

O diretório [`templates/gitops`](../templates/gitops/) contém uma estrutura GitOps completa para ser copiada para outro repositório. Os arquivos usam valores genéricos e não incluem referências a ambientes específicos, segredos versionados nem charts `.tgz` gerados.

Os exemplos são opcionais e independentes: estar disponível em `templates/` não significa que um componente seja requisito do cluster. Escolha somente o que atende ao ambiente e revise capacidade, segurança, persistência e política de atualização antes de habilitar a respectiva Application.

| Template | O que apresenta | Para que serve |
| --- | --- | --- |
| `root/` | Application raiz | Iniciar o App-of-Apps no Argo CD |
| `applications/` | Manifests Argo CD independentes | Permitir que cada usuário selecione quais componentes serão reconciliados |
| `apps/system/gateway-resources/` | GatewayClass opcional, Gateways, Certificates, ClusterIssuer e HTTPRoutes | Publicar serviços e automatizar certificados usando os controllers instalados anteriormente |
| `apps/security/network-policies/` | Deny por padrão, DNS, Traefik e fluxos explícitos entre workloads | Gerar e versionar isolamento de rede por namespace sem aplicar políticas automaticamente |
| `apps/security/infisical-secrets/` | Conexão, autenticação, sincronização e bootstrap manual mínimo | Materializar Secrets Kubernetes a partir do Infisical sem versionar seus valores |
| `apps/data/cloudnative-pg-example/` | Cluster PostgreSQL e Database declarativa de exemplo | Demonstrar um banco gerenciado pelo operator CloudNativePG instalado por uma Application separada |
| `apps/monitoring/kube-prometheus-stack/` | Prometheus Operator, Prometheus, Alertmanager, Grafana, exporters e HTTPRoutes opcionais | Coletar métricas, consultar séries temporais, visualizar dashboards e encaminhar alertas |
| `apps/management/rancher/` | Rancher com publicação opcional por HTTPRoute e TLS terminado no Gateway | Oferecer uma interface e uma camada adicional de administração para clusters Kubernetes |

No template de monitoring, o Prometheus coleta métricas numéricas de endpoints e as armazena como séries temporais; o Grafana consulta essas métricas e as apresenta em dashboards; o Alertmanager recebe alertas gerados por regras, agrupa notificações e as encaminha aos destinos configurados. Essa pilha não substitui coleta de logs, backup nem monitoramento externo do próprio cluster. Antes de produção, defina retenção, armazenamento persistente, regras úteis e receptores reais. Referências: [visão geral do Prometheus](https://prometheus.io/docs/introduction/overview/) e [introdução ao Grafana](https://grafana.com/docs/grafana/latest/introduction/).

O Rancher é opcional. Ele adiciona interface, autenticação e recursos de gestão sobre Kubernetes e pode centralizar vários clusters, mas não é necessário para que K3s, `kubectl` ou Argo CD funcionem. Rancher e Argo CD também não têm o mesmo papel: Rancher oferece administração ampla do cluster, enquanto Argo CD reconcilia aplicações a partir do Git. Referência: [visão geral do Rancher](https://ranchermanager.docs.rancher.com/getting-started/overview).

CloudNativePG é um operator para administrar o ciclo de vida de clusters PostgreSQL declarados na API Kubernetes. O template mantém o operator e o banco de exemplo em Applications diferentes: instale primeiro `cloudnative-pg-operator.yaml`, aguarde o controller e seus CRDs, e só depois adicione `cloudnative-pg-database-example.yaml`. O exemplo não é uma receita de produção; revise backup e restauração, recursos, topologia, armazenamento, NetworkPolicies, monitoramento e credenciais. Referências: [instalação do CloudNativePG](https://cloudnative-pg.io/docs/1.30/installation_upgrade/) e [gerenciamento declarativo de databases](https://cloudnative-pg.io/docs/1.30/declarative_database_management/).

As HTTPRoutes dos charts de monitoring e Rancher são opt-in e permanecem desabilitadas nos `values.yaml`. Para publicar uma interface, habilite somente a rota desejada (`routes.grafana.enabled`, `routes.prometheus.enabled` ou `httpRoute.enabled`) e revise hostname, Gateway, listener, Service de destino, TLS e NetworkPolicy antes da sincronização.

Para extrair somente o conteúdo de `templates/gitops` no diretório atual, sem clonar este repositório e sem instalar Node.js, npm ou `degit` na máquina, execute o `npx` dentro da imagem oficial do Node.js. O diretório atual é montado em `/workspace`; portanto, rode o comando na raiz do repositório que receberá a pasta `gitops/`:

> **Executar em:** qualquer máquina com Docker, acesso à Internet e permissão de escrita na raiz do repositório de destino.

```bash
read -r -p "Diretório que receberá o template [gitops]: " TEMPLATE_DESTINATION
TEMPLATE_DESTINATION="${TEMPLATE_DESTINATION:-gitops}"

docker run --rm \
  --user "$(id -u):$(id -g)" \
  --env HOME=/tmp \
  --volume "${PWD}:/workspace" \
  --workdir /workspace \
  node:lts-alpine \
  npx --yes degit@latest \
  guesant/cluster-management-notes/templates/gitops#main \
  "${TEMPLATE_DESTINATION}"
```

O `degit` baixa um snapshot do subdiretório solicitado sem o histórico `.git` deste projeto. O `--user` evita que os arquivos sejam criados como `root`, enquanto `HOME=/tmp` fornece ao npm um diretório temporário gravável. Por segurança, não foi usado `--force`: se o destino já contiver arquivos, revise ou mova o diretório antes de repetir o comando. Os manifests do template usam caminhos relativos iniciados por `gitops/`; se escolher outro destino, atualize esses campos `spec.source.path`. As referências `node:lts-alpine` e `degit@latest` acompanham novas versões; em automações reproduzíveis, fixe versões ou digests após validá-los.

Leia [`templates/gitops/README.md`](../templates/gitops/README.md) antes do bootstrap. Os domínios `example.com`, a URL `example/cluster-config`, as versões das dependências e os nomes dos Services são exemplos e devem ser revisados no repositório de destino.
