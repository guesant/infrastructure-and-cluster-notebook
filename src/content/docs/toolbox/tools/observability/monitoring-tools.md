---
title: Ferramentas complementares de observabilidade
description: Catálogo de clientes de consulta, exportadores adicionais, backend de traces e serviços de monitoramento externo que complementam o kube-prometheus-stack já documentado.
sidebar:
  order: 1
---

> **Para quem é:** quem já tem o `kube-prometheus-stack` (Prometheus, Grafana, Alertmanager) e o Loki instalados, seguindo [instalar o kube-prometheus-stack](../../../guides/tasks/observability/install-prometheus-stack/) e [instalar o Loki](../../../guides/tasks/observability/install-loki/), e precisa de uma ferramenta específica que esses guias não cobrem.

Esta página não repete o desenho operacional completo, tratado em [observabilidade e alertas](../../../operations/observability/observability-and-alerting/), nem os conceitos de métricas, logs e traces, tratados em `learn/observability/`. Ela cataloga ferramentas pontuais que preenchem uma lacuna específica: consultar dados já coletados pela linha de comando, capturar métricas de algo que ainda não expõe métricas nativamente, armazenar traces, ou observar o cluster de fora dele.

## Clientes de consulta

`promtool` e `logcli` consultam, respectivamente, Prometheus e Loki diretamente do terminal, sem abrir o Grafana. Ambos vêm como binários separados nas releases oficiais de cada projeto (não são instalados junto do Helm chart).

```bash
# promtool: validar regras de alerta antes de aplicá-las, e consultar instantâneos
promtool check rules regras-de-alerta.yml
promtool query instant http://localhost:9090 'up'

# logcli: consultar logs do Loki com a mesma linguagem de consulta (LogQL) usada no Grafana
logcli query '{namespace="monitoring"}' --limit=50
```

**Quando usar:** validar um arquivo de regras de alerta em um pipeline de CI antes de aplicá-lo ao cluster (`promtool check rules` não precisa de acesso ao Prometheus rodando para isso), ou consultar logs/métricas rapidamente por script, sem depender da disponibilidade do Grafana.

**Modelo de acesso:** `promtool query` e `logcli query` precisam alcançar a API do Prometheus/Loki (porta `9090`/`3100` por padrão) com as mesmas credenciais ou política de rede que qualquer outro cliente; `promtool check rules` sozinho não faz nenhuma chamada de rede, só valida a sintaxe do arquivo local.

**Riscos:** nenhum específico; ambos são clientes de leitura (consulta), sem operação destrutiva sobre o Prometheus ou o Loki.

**Licença e plataformas:** `promtool` é Apache 2.0 (projeto Prometheus). `logcli` é AGPLv3 (Loki foi relicenciado de Apache 2.0 para AGPLv3 em 2021, junto com o Grafana e o Tempo). Ambos disponíveis para Linux, macOS e Windows.

## Exportador adicional: blackbox-exporter

Os componentes já cobertos por este notebook (CloudNativePG, node-exporter, kube-state-metrics) expõem métricas Prometheus nativamente; a maioria dos serviços não precisa de um exportador dedicado. O `blackbox-exporter` cobre o caso oposto: sondar um endpoint HTTP, TCP, ICMP ou DNS que não expõe métricas próprias, transformando o resultado (respondeu, código de status, tempo de resposta) em métricas Prometheus.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install blackbox-exporter prometheus-community/prometheus-blackbox-exporter \
  --namespace monitoring
```

**Quando usar:** monitorar, a partir de dentro do cluster, a disponibilidade de um endpoint interno (outro Service, um endpoint de terceiros) sem instrumentar esse endpoint. Isso é diferente de [configurar monitoramento externo de disponibilidade](../../../guides/tasks/observability/configure-external-availability-monitoring/): o `blackbox-exporter` roda dentro do cluster e falha junto com ele em uma perda total do host, então não substitui uma verificação externa, apenas complementa a cobertura interna de disponibilidade.

**Modelo de acesso e privilégios:** roda como Pod comum no cluster, sondando os endpoints configurados na sua própria configuração; não precisa de credenciais especiais além do que os próprios endpoints sondados exigem (ex.: um endpoint HTTP com autenticação exigiria configurar isso no módulo de sondagem).

**Riscos:** sondagens configuradas contra hosts externos ao cluster geram tráfego de rede recorrente e podem ser confundidas, do lado do destino, com varredura ou abuso, se muito frequentes; ajuste o intervalo de sondagem ao necessário, não ao mínimo tecnicamente possível.

**Licença e plataformas:** Apache 2.0. Distribuído como imagem de container; roda em qualquer cluster Kubernetes.

## Backend de traces: Grafana Tempo

[Jaeger](../../../learn/observability/distributed-tracing/#jaeger-como-backend) já é o backend de tracing tratado em profundidade em `learn/observability/`. O Grafana Tempo é uma alternativa que se integra diretamente ao Grafana já instalado neste notebook (mesmo painel usado para métricas e logs), recebendo spans via OTLP do mesmo jeito que qualquer backend compatível com OpenTelemetry.

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm upgrade --install tempo grafana/tempo --namespace monitoring
```

**Quando usar:** quando manter um único painel Grafana para métricas, logs e traces pesa mais na decisão do que os recursos específicos de exploração de traces do Jaeger; a escolha entre os dois depende mais de onde a equipe já centraliza a observação do que de uma diferença técnica decisiva entre eles.

**Modelo de acesso e privilégios:** roda como componente comum do cluster (Helm chart), recebendo spans via OTLP de qualquer aplicação instrumentada; o acesso de consulta é o mesmo acesso já configurado para o Grafana.

**Riscos:** nenhum específico além do já coberto pelo restante da stack de observabilidade (Prometheus/Grafana); armazenamento de traces cresce proporcionalmente ao volume de spans recebidos, o mesmo cuidado de amostragem já descrito em [distributed tracing](../../../learn/observability/distributed-tracing/#amostragem) se aplica aqui.

**Licença e plataformas:** AGPLv3 (Tempo foi relicenciado junto com Grafana e Loki em 2021). Distribuído como imagem de container; roda em qualquer cluster Kubernetes.

## Monitoramento externo (uptime e checagem sintética)

[Configurar monitoramento externo de disponibilidade](../../../guides/tasks/observability/configure-external-availability-monitoring/) é deliberadamente genérico sobre qual ferramenta usar. Três categorias cobrem a maioria dos casos: serviços SaaS de uptime (verificam um endpoint público em intervalos regulares e alertam por e-mail/webhook quando ele para de responder), serviços de heartbeat (o inverso: esperam que um job periódico avise "terminei", e alertam quando o aviso não chega no prazo, útil para cron jobs e backups agendados) e um servidor de uptime autogerenciado (roda fora do cluster monitorado, o requisito central de qualquer verificação externa neste notebook).

**O que avaliar antes de adotar:** se o serviço externo precisa alcançar um endpoint privado (exige VPN ou IP liberado no firewall, o que reduz o valor de "fora do domínio de falha") ou só um endpoint já público; o limite de frequência de checagem e o número de monitores do plano gratuito, quando aplicável; e, para um servidor autogerenciado, onde ele roda e se sua própria indisponibilidade é percebida por outro canal (um monitor não pode ser o único ponto de verificação de si mesmo).

## Referências

- [`promtool` — documentação oficial do Prometheus](https://prometheus.io/docs/prometheus/latest/command-line/promtool/): referência completa de subcomandos.
- [`logcli` — documentação oficial do Loki](https://grafana.com/docs/loki/latest/query/logcli/): instalação e sintaxe de consulta.
- [`blackbox-exporter` — repositório oficial](https://github.com/prometheus/blackbox_exporter): configuração de módulos de sondagem (HTTP, TCP, ICMP, DNS).
- [Grafana Tempo — documentação oficial](https://grafana.com/docs/tempo/latest/): arquitetura, ingestão via OTLP e integração com Grafana.
