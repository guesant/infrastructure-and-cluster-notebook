---
title: Coletar logs com o Grafana Alloy
description: Como instalar o Grafana Alloy como DaemonSet para coletar logs de todos os Pods do nó e enviá-los ao Loki com os labels do Kubernetes já anexados.
sidebar:
  order: 10
---

> **Pré-requisitos:** [Loki instalado](../install-loki/).
> **Versões testadas:** Grafana Alloy 1.x.

Grafana Alloy é um coletor de telemetria (sucessor do Grafana Agent) que roda como DaemonSet, lendo logs de todos os Pods do nó e enviando-os ao Loki com os labels do Kubernetes já anexados.

## Instalar o Alloy

> **Executar em:** qualquer máquina com `KUBECONFIG`, Helm e acesso administrativo à API.

```bash
read -r -p "Versão do chart alloy: " ALLOY_VERSION

helm upgrade --install alloy alloy \
  --repo https://grafana.github.io/helm-charts \
  --version "${ALLOY_VERSION}" \
  --namespace monitoring
```

## Configurar a coleta de logs de Pods para o Loki

O chart padrão do Alloy já inclui uma configuração de exemplo para coleta de logs Kubernetes; ajuste o destino para o Loki instalado no mesmo cluster:

```bash
kubectl --namespace monitoring get configmap alloy -o yaml | grep -A5 "loki.write"
```

Se o destino não estiver configurado, edite os values do chart (`--set-string` ou um arquivo `values.yaml`) para apontar `loki.write` ao Service do Loki (`http://loki:3100/loki/api/v1/push`) e reaplique o `helm upgrade`.

## Validação

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace monitoring get daemonset alloy
kubectl --namespace monitoring logs daemonset/alloy --tail=50
```

O DaemonSet deve ter um Pod por nó, todos `Running`. No Grafana (`Explore` → Loki), confirme que logs de um namespace conhecido aparecem em uma consulta como `{namespace="kube-system"}`.

## Redigir dados sensíveis

Antes de coletar logs de aplicações que podem conter dados sensíveis (tokens, e-mails, IDs pessoais), configure regras de processamento no Alloy para redigir esses campos antes do envio: não trate essa etapa como opcional em produção.

## Troubleshooting

Se os logs não chegarem ao Loki, confirme conectividade de rede entre o namespace do Alloy e o Service do Loki (relevante se houver NetworkPolicy default-deny) e revise os logs do próprio Alloy para erros de envio.

## Rollback

```bash
helm --namespace monitoring uninstall alloy
```

## Próximo passo

Defina retenção do Loki compatível com a decisão registrada em [retenção e cardinalidade](../../../../learn/observability/retention/).

## Fontes e leitura adicional

- [Grafana Alloy: documentação oficial](https://grafana.com/docs/alloy/latest/): arquitetura, componentes e configuração.
- [Alloy: Collecting Kubernetes Pod logs](https://grafana.com/docs/alloy/latest/collect/logs-in-kubernetes/): referência oficial da coleta de logs de Pods.
