---
title: Observabilidade e alertas
sidebar:
  order: 1
---

Este guia transforma os itens de observabilidade do [guia de operação contínua](../../checklists/cluster-operational-checklist/) em um desenho operacional verificável. A escolha de produtos é secundária: primeiro defina quais perguntas precisam ser respondidas, quem age quando algo falha e quais evidências demonstram que o caminho completo funciona.

Para cada serviço crítico, registre pelo menos o responsável, os objetivos de disponibilidade, as dependências, os sinais coletados, os dashboards, os alertas e os runbooks. A instrumentação da aplicação deve acompanhar sua [prontidão para produção](../../checklists/application-readiness/), em vez de ser acrescentada somente depois de um incidente.

## Sinais e seus usos

Os sinais se complementam e não são intercambiáveis:

| Sinal | O que representa | Uso principal | Limitação importante |
| --- | --- | --- | --- |
| Métricas | Amostras numéricas organizadas como séries temporais | Alertas, agregações, capacidade e tendências | Dimensões sem limite causam alta cardinalidade e custo |
| Logs | Registros discretos, preferencialmente estruturados | Diagnóstico detalhado e investigação de uma execução | Volume, retenção e dados sensíveis precisam ser controlados |
| Traces | Caminho e duração de uma operação distribuída, dividido em spans | Localizar latência e falhas entre serviços | Amostragem pode omitir requisições; não substitui métricas de conjunto |
| Eventos do Kubernetes | Registros da API sobre mudanças ou condições observadas em objetos | Contexto rápido para scheduling, probes, imagens e controladores | São transitórios e não substituem logs persistentes nem auditoria |

Correlacione os sinais por tempo, cluster, namespace, workload e, quando adotado, `trace_id`. Um identificador de requisição pode ser útil em logs, traces ou exemplars, mas não deve virar label de métrica: isso criaria uma série para cada requisição.

## Cobertura por camada

O inventário precisa cobrir o serviço e as camadas das quais ele depende. Uma visão apenas de Pods pode permanecer verde enquanto o usuário não consegue acessar a aplicação.

| Camada | O que observar | Exemplos de condições importantes |
| --- | --- | --- |
| Hosts | CPU, memória, disco, inodes, rede, relógio, kernel e serviços do sistema | Falta de espaço, pressão de memória, erro de disco, perda de conectividade ou serviço K3s parado |
| K3s e control plane | API, scheduler, controllers, certificados e datastore usado pela topologia | API indisponível ou lenta, falha de reconciliação, perda de quorum quando houver etcd, crescimento ou erro do datastore |
| Nós e serviços do cluster | Estado `Ready`, kubelet, runtime, CNI, DNS, capacidade alocável e pressão | Nó `NotReady`, runtime indisponível, erro de rede, DNS degradado ou Pods acima da capacidade segura |
| Workloads | Réplicas, probes, reinícios, scheduling, Jobs e sinais da aplicação | `CrashLoopBackOff`, `OOMKilled`, Pods pendentes, falha de readiness, Job atrasado ou taxa de erro elevada |
| Armazenamento | PVCs, capacidade, latência, erros, saúde de réplicas e backups | Volume cheio, PVC pendente, réplica degradada, I/O lento ou backup ausente; veja [Longhorn](../../../guides/tasks/storage/install-longhorn/) |
| Dependências | DNS, registry, banco, fila, identidade, APIs externas e certificados | Resolução ou autenticação falha, dependência lenta, limite externo atingido ou certificado próximo do vencimento; veja [cert-manager](../../../guides/tasks/certificates/install-cert-manager/) |

Em um cluster single-node, a perda do host também remove control plane, workloads e monitoramento local. Em um cluster multinode, acompanhe quorum, distribuição de réplicas e domínios de falha; a mera existência de várias réplicas não prova disponibilidade.

## Sinais de serviço e disponibilidade

Comece pelos quatro sinais de serviço e pela disponibilidade percebida pelo consumidor:

| Dimensão | Pergunta | Medidas usuais |
| --- | --- | --- |
| Latência | Quanto tempo operações válidas levam? | Histogramas e percentis por tipo de operação, separados entre sucesso e erro quando necessário |
| Tráfego | Quanto trabalho chega ou é concluído? | Requisições, mensagens, bytes, itens processados ou execuções por segundo |
| Erros | Qual parcela do trabalho falha? | Razão de falhas sobre tentativas, códigos de resposta e erros por operação |
| Saturação | Quão perto está o limite do recurso? | Filas, concorrência, throttling, pools, CPU, memória, disco, inodes e conexões |
| Disponibilidade | O consumidor consegue concluir a função esperada? | Probes sintéticos, razão de respostas válidas e indicadores ligados ao objetivo do serviço |

Readiness, liveness e o estado `Running` são sinais internos; isoladamente, não comprovam disponibilidade. Para um fluxo crítico, prefira medir uma operação representativa a partir da perspectiva do consumidor e definir o que conta como sucesso. Se houver SLO, ligue dashboards e alertas ao indicador e ao orçamento de erro correspondente.

### Capacidade e tendência

Um limite instantâneo detecta urgência; a tendência permite agir antes dela. Para cada recurso finito:

- registre capacidade total, uso, reserva operacional e margem necessária para manutenção ou falha de um nó;
- acompanhe valores por nó, volume, pool e workload, não somente a média do cluster;
- calcule taxa de crescimento e tempo estimado até a exaustão em janelas compatíveis com a sazonalidade;
- revise CPU, memória, disco, inodes, volumes, séries ativas, ingestão, filas e cotas externas;
- compare previsão e consumo real depois de mudanças de carga ou retenção.

A plataforma de observabilidade entra no mesmo planejamento: ela também pode ficar sem disco, memória, capacidade de ingestão ou tempo de consulta.

## Retenção, persistência e continuidade

Defina retenção por pergunta operacional, obrigação de segurança e tempo esperado para investigação. Manter tudo indefinidamente aumenta custo e exposição; reter pouco pode apagar a única evidência de um problema intermitente.

- estime ingestão, número de séries, volume diário e crescimento antes de dimensionar armazenamento;
- configure persistência para os dados que precisam sobreviver ao reinício ou reagendamento dos componentes;
- alerte sobre capacidade, erros de escrita, compactação, filas, consultas e falhas de envio remoto;
- documente a perda aceitável de telemetria e o procedimento de recuperação;
- aplique expiração e exclusão compatíveis com a classificação dos dados.

Retenção não é backup, réplica não é backup e a TSDB local do Prometheus tem limites de durabilidade de um único nó. Se o histórico for requisito de recuperação ou análise prolongada, projete uma cópia ou armazenamento externo e teste sua leitura. Logs e traces normalmente precisam de backends próprios; persistir métricas não os torna persistentes.

## Template opcional do kube-prometheus-stack

O repositório apresenta um template opcional de `kube-prometheus-stack` nos [templates de deploy](../../../guides/blueprints/k3s-single-node-gitops/templates/). Ele reúne Prometheus Operator, Prometheus, Alertmanager, Grafana e exporters, servindo como ponto de partida para métricas, dashboards e alertas.

Adotar o template não conclui o desenho operacional. Antes de produção, revise versões, recursos, retenção, volumes persistentes, seleção de monitores e regras, acesso às interfaces, receptores reais e políticas de rede. O template não fornece, por si só, pipeline de logs, backend de traces, backup nem monitoramento externo.

Os recursos a seguir dependem das CRDs do Prometheus Operator. Labels, namespaces e seletores devem corresponder à instância instalada; os valores abaixo são ilustrativos.

### Descoberta mínima com ServiceMonitor

O `ServiceMonitor` seleciona um `Service`, não diretamente os Pods. O `Service` precisa expor uma porta nomeada `metrics`, selecionar os Pods corretos e produzir `EndpointSlices` válidos.

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  namespaceSelector:
    matchNames:
      - apps
  selector:
    matchLabels:
      app.kubernetes.io/name: api
  endpoints:
    - port: metrics
      path: /metrics
      interval: 30s
      scrapeTimeout: 10s
```yaml

Confirme também se `serviceMonitorSelector` e `serviceMonitorNamespaceSelector` da instância Prometheus aceitam esse objeto e se RBAC, TLS e NetworkPolicy permitem a coleta. Um manifesto aceito pela API não prova que o target foi descoberto nem que está `up`.

### Alerta mínimo com PrometheusRule

Este exemplo alerta quando mais de 5% das requisições têm erro por dez minutos, desde que exista tráfego suficiente para evitar ruído de uma amostra isolada. Adapte nomes e labels à instrumentação real.

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: api-alerts
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  groups:
    - name: api.rules
      rules:
        - alert: ApiHighErrorRate
          expr: |
            (
              sum(rate(http_requests_total{job="api",code=~"5.."}[5m]))
              /
              sum(rate(http_requests_total{job="api"}[5m]))
            ) > 0.05
            and
            sum(rate(http_requests_total{job="api"}[5m])) > 1
          for: 10m
          labels:
            severity: critical
            owner: time-api
            service: api
          annotations:
            summary: "API com taxa elevada de erros"
            description: "Mais de 5% das requisições falharam por 10 minutos; valor atual: {{ $value | humanizePercentage }}."
            runbook_url: "https://example.com/runbooks/api/high-error-rate"
```yaml

Uma regra acionável contém:

- uma expressão ligada a impacto ou risco real, com comportamento definido quando não há dados;
- `for` compatível com o tempo tolerável e com flutuações normais;
- labels estáveis para severidade, serviço, ambiente, cluster e responsável;
- annotations com resumo, impacto, valor observado e links úteis;
- runbook com confirmação, diagnóstico inicial, mitigação, rollback, escalonamento e critério de encerramento.

O endereço de exemplo do runbook deve ser substituído por um documento acessível durante a indisponibilidade. Não use annotations para copiar tokens, payloads, dados pessoais ou outros valores sensíveis.

## Severidade, responsabilidade e roteamento

Defina severidades pela resposta esperada, não pelo nome técnico do componente:

| Severidade | Critério | Resposta esperada |
| --- | --- | --- |
| `critical` | Impacto relevante em andamento, risco imediato de dados ou perda de redundância essencial | Acionar plantão imediatamente; existe uma ação possível |
| `warning` | Degradação ou tendência que exige ação antes de virar impacto | Encaminhar ao responsável dentro de prazo definido |
| `info` | Mudança ou condição útil sem ação urgente | Registrar em dashboard, relatório ou ticket; não paginar |

Todo alerta deve ter `owner`. Organize a árvore de roteamento por ambiente, severidade e responsável; agrupe instâncias do mesmo incidente e use inibição apenas quando um alerta de causa ampla torna os demais redundantes. Preserve informação suficiente para enxergar a extensão do impacto.

Silêncios são exceções temporárias. Exija responsável, motivo, referência da manutenção, início e expiração. Um silêncio sem prazo pode esconder uma falha nova; revise silêncios ativos e expirados periodicamente.

## Teste ponta a ponta e metamonitoramento

Validar somente a expressão deixa sem teste a maior parte do caminho. Em ambiente controlado, crie uma condição sintética identificável ou uma regra temporária e confirme:

1. ingestão da métrica e estado saudável do target;
2. carregamento e avaliação da regra;
3. transição do alerta de pendente para disparado após o `for`;
4. entrega ao Alertmanager e correspondência com a rota esperada;
5. recebimento no destino real, com links e labels corretos;
6. resolução e notificação de encerramento, quando configurada;
7. registro dos horários, responsável e evidências sem segredos.

Remova a regra temporária ao final. Não provoque uma indisponibilidade real apenas para testar notificações.

Monitore o próprio pipeline: saúde de scrapes, falhas de avaliação, recarga de configuração, fila e erros de notificações, séries descartadas, ingestão, TSDB, remote write, datasources e consultas de dashboard. Um alerta interno sobre o Prometheus não detecta a perda total do Prometheus que deveria avaliá-lo.

Use também um *dead-man switch* (ou watchdog): um alerta permanece deliberadamente ativo e um sistema fora do caminho monitorado espera recebê-lo. A ausência dessa notificação dentro do prazo indica possível falha de avaliação, roteamento ou entrega. O receptor e o canal externos precisam ser monitorados; apenas criar uma regra `vector(1)` dentro do cluster não fecha o circuito.

## Monitoramento externo

Mantenha pelo menos uma verificação fora do cluster e, de preferência, fora do mesmo domínio de falha da plataforma de observabilidade. Ela deve exercitar DNS, TLS, entrada de rede e uma resposta válida da aplicação. Para fluxos críticos, uma transação sintética pequena é mais representativa que um teste TCP.

O monitoramento externo detecta a indisponibilidade completa do cluster ou do caminho público, mas não explica a causa. Combine-o com sinais internos e, quando necessário, use mais de uma origem para distinguir falha regional de falha do serviço. Credenciais de probes devem ter privilégio mínimo, rotação e armazenamento seguro.

## Proteção de segredos e cardinalidade

Telemetria atravessa vários componentes e costuma aparecer em dashboards, notificações e evidências. Trate-a como dado potencialmente sensível.

- não use tokens, e-mails, IDs de usuário, sessão, requisição ou trace como labels de métricas;
- normalize rotas dinâmicas, por exemplo `/users/{id}`, em vez de registrar o caminho bruto como label;
- mantenha os valores possíveis de cada label limitados e acompanhe séries ativas e séries novas;
- redija ou remova segredos e dados pessoais antes de exportar logs, eventos ou atributos de traces;
- aplique amostragem de traces conscientemente e documente o que pode deixar de ser observado;
- restrinja interfaces, APIs e armazenamento com TLS, autenticação, RBAC e políticas de rede;
- proteja credenciais de scrape e receptores em Secrets ou no gerenciador adotado, nunca em regras ou repositório;
- revise templates de notificação: labels e annotations também podem vazar dados para terceiros.

Defina um orçamento de cardinalidade por serviço. Ao adicionar uma dimensão, estime o produto dos valores possíveis e verifique o efeito real após o deploy. Logs ou traces são opções mais adequadas para atributos não limitados.

## Validação e evidências

Antes de considerar a cobertura pronta:

- [ ] Hosts, control plane, nós, workloads, armazenamento e dependências críticas estão inventariados.
- [ ] Targets esperados foram descobertos, estão `up` e expõem métricas semanticamente válidas.
- [ ] Dashboards cobrem disponibilidade, latência, tráfego, erros, saturação, capacidade e tendência aplicáveis.
- [ ] Regras foram carregadas, avaliadas com dados reais e possuem responsável, destino e runbook.
- [ ] Ausência de dados e falha de coleta possuem comportamento explícito.
- [ ] Retenção, persistência, capacidade e perda aceitável da observabilidade estão registradas.
- [ ] Cardinalidade, acesso e exposição de segredos foram revisados.
- [ ] O teste ponta a ponta chegou ao receptor real e confirmou também a resolução.
- [ ] Monitoramento externo, metamonitoramento e dead-man switch foram exercitados.
- [ ] Cada silêncio de teste ou manutenção possui expiração.

Quando usar Prometheus Operator, estas consultas ajudam a localizar os objetos; a confirmação final ainda deve ocorrer nas páginas de targets, regras e alertas da instância correspondente:

```bash
kubectl get servicemonitors,podmonitors,prometheusrules -A
kubectl -n monitoring describe servicemonitor api
kubectl -n monitoring describe prometheusrule api-alerts
```yaml

Registre como evidência:

```text
Data e ambiente:
Responsável:
Revisões da configuração e da stack:
Cobertura e exceções justificadas:
Targets e regras validados:
Dashboards e consultas validados:
Teste ponta a ponta (horários de geração, recebimento e resolução):
Dead-man switch e verificação externa:
Retenção, armazenamento e cardinalidade observada:
Silêncios criados e respectivas expirações:
Falhas encontradas, responsável e prazo:
```yaml

Capturas, exports e notificações anexadas como evidência devem ser redigidos antes do armazenamento.

## Limitações e diagnóstico

| Sintoma | Verificações iniciais |
| --- | --- |
| `ServiceMonitor` não aparece | CRD instalada, namespace e labels do objeto, `serviceMonitorSelector` e `serviceMonitorNamespaceSelector` |
| Target não foi descoberto | Labels do `Service`, porta nomeada, `EndpointSlices`, namespace selecionado e RBAC |
| Target está `down` | Endpoint, path, DNS, TLS, autenticação, timeout, NetworkPolicy e processo que expõe métricas |
| Regra não aparece ou falha | `ruleSelector`, namespace, sintaxe PromQL, nomes e tipos das métricas e erros de avaliação |
| Alerta não dispara | Janela e `for`, tráfego mínimo, séries ausentes, labels diferentes dos esperados e relógios |
| Alerta dispara, mas não chega | Conexão Prometheus–Alertmanager, matchers, agrupamento, inibição, silêncio, receptor, credencial e saída de rede |
| Alertas oscilam ou geram ruído | Condição acionável, janela, `for`, limiar, agrupamento e efeito de `No Data` |
| Dashboard vazio | Datasource, intervalo de tempo, variáveis, permissões, retenção e consulta |
| Consultas lentas ou uso alto | Cardinalidade, intervalo consultado, retenção, regras de gravação, ingestão e capacidade da TSDB |

Ausência de uma série é ambígua: pode significar valor zero, objeto inexistente, target não coletado ou pipeline quebrado. Instrumente valores iniciais quando possível e trate `No Data` de forma deliberada, especialmente em alertas de disponibilidade.

Nenhuma ferramenta prova, sozinha, a correção do serviço. Eventos podem expirar, traces podem ser amostrados, logs podem ser perdidos antes da coleta e o próprio monitoramento pode falhar. Dashboards sem alertas acionáveis exigem vigilância humana; alertas sem testes e runbooks são apenas configuração não comprovada.

## Fontes e leitura adicional

- [Observability — Kubernetes](https://kubernetes.io/docs/concepts/cluster-administration/observability/): visão oficial de métricas, logs e traces no cluster.
- [Logging Architecture — Kubernetes](https://kubernetes.io/docs/concepts/cluster-administration/logging/): ciclo de vida, coleta e armazenamento de logs.
- [Event API — Kubernetes](https://kubernetes.io/docs/reference/kubernetes-api/core/event-v1/): semântica e campos dos eventos da API.
- [Instrumentation — Prometheus](https://prometheus.io/docs/practices/instrumentation/): tipos de serviço, instrumentação e cuidados com cardinalidade.
- [Alerting — Prometheus](https://prometheus.io/docs/practices/alerting/): princípios para alertas simples, acionáveis e ligados a sintomas.
- [Storage — Prometheus](https://prometheus.io/docs/prometheus/latest/storage/): retenção, TSDB local e integrações de armazenamento remoto.
- [Alertmanager — Prometheus](https://prometheus.io/docs/alerting/latest/alertmanager/): agrupamento, roteamento, inibição e silêncios.
- [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/): regras, avaliação, notificações e resposta a alertas.
- [Signals — OpenTelemetry](https://opentelemetry.io/docs/concepts/signals/): definições de métricas, logs e traces e sua correlação.
- [Design — Prometheus Operator](https://prometheus-operator.dev/docs/getting-started/design/): relação entre `ServiceMonitor`, `PrometheusRule` e os seletores das instâncias.
