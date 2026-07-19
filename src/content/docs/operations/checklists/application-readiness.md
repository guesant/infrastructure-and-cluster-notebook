---
title: Prontidão para produção
sidebar:
  order: 1
---

Este guia transforma os itens de prontidão do [guia de operação contínua](../cluster-operational-checklist/) em decisões, validações e evidências aplicáveis a Deployments, StatefulSets, Jobs e CronJobs. Consulte também os [conceitos fundamentais do Kubernetes](../../../learn/clusters/kubernetes/) antes de adaptar os exemplos.

Prontidão não é uma propriedade permanente. Revise o workload antes da primeira implantação, depois de mudanças relevantes e periodicamente com base no consumo, nas falhas e no comportamento observados. Em um cluster de nó único, réplicas, distribuição e PodDisruptionBudget ainda documentam a intenção, mas não criam alta disponibilidade contra a perda do host.

## Responsabilidade e criticidade

Antes do manifesto, registre informações que permitam decidir quem responde e quanto risco é aceitável:

| Informação | Pergunta que deve ser respondida |
| --- | --- |
| Responsável e escalonamento | Qual equipe recebe o alerta e quem decide por rollback ou indisponibilidade planejada? |
| Criticidade | O serviço é crítico, importante ou tolerante a interrupções? Qual impacto técnico e de negócio ocorre? |
| Dependências | Quais bancos, filas, APIs, Secrets, volumes e serviços externos são necessários? |
| Objetivos | Quais disponibilidade, latência, RTO e RPO foram acordados? |
| Mudança e recuperação | Onde estão os procedimentos de deploy, rollback, restauração e operação degradada? |
| Dados e acesso | Qual a classificação dos dados e quais identidades precisam acessar o workload? |

Labels e annotations podem facilitar inventário e automação, mas não substituem um catálogo ou runbook acessível durante a indisponibilidade. Se adotar chaves próprias como `example.com/owner` e `example.com/criticality`, defina valores permitidos e quem os mantém.

## Requests, limits e QoS

Defina recursos a partir de teste de carga e consumo observado, incluindo inicialização, picos e tarefas de manutenção. Revise-os depois de mudanças na aplicação ou no perfil de tráfego.

| Campo | Efeito principal | Falha típica |
| --- | --- | --- |
| `requests.cpu` e `requests.memory` | Reservam capacidade para a decisão de agendamento | O Pod fica `Pending` quando nenhum nó possui capacidade solicitada disponível |
| `limits.cpu` | Limita o tempo de CPU disponível ao container | A aplicação sofre throttling e aumenta sua latência, sem necessariamente reiniciar |
| `limits.memory` | Limita a memória utilizável pelo container | O processo pode terminar como `OOMKilled` ao ultrapassar o limite |

As classes de QoS influenciam a ordem de eviction sob pressão no nó, mas não são uma garantia de disponibilidade:

- `Guaranteed`: todos os containers possuem requests e limits de CPU e memória, com valores iguais para cada recurso;
- `Burstable`: ao menos um request ou limit existe, sem atender integralmente aos critérios de `Guaranteed`;
- `BestEffort`: nenhum container declara requests ou limits de CPU ou memória.

Não aumente automaticamente um limit após `OOMKilled`. Confirme primeiro se houve crescimento esperado, pico legítimo, cache sem limite ou vazamento de memória. Da mesma forma, um Pod `Pending` pode resultar de requests incompatíveis com a capacidade, mas também de taints, afinidade rígida, falta de volume ou restrições de topologia.

Use estas consultas durante a análise:

```bash
kubectl --namespace <namespace> describe pod <pod>
kubectl --namespace <namespace> get pod <pod> \
  --output jsonpath='{.status.qosClass}{"\n"}'
kubectl --namespace <namespace> top pod <pod> --containers
kubectl get events --all-namespaces --sort-by=.lastTimestamp
```yaml

`kubectl top` depende de um pipeline de métricas, como metrics-server, e mostra uma amostra recente; combine-o com séries históricas e testes de carga.

## Réplicas e distribuição

Mais de uma réplica só reduz indisponibilidade quando a aplicação suporta execução concorrente e as réplicas não permanecem no mesmo domínio de falha. Avalie:

- capacidade do banco, filas e dependências para receber concorrência adicional;
- estado de sessão, arquivos locais e operações que exigem eleição ou exclusão mútua;
- quantidade real de nós e zonas disponíveis;
- capacidade livre para reagendar uma réplica depois da perda de um nó;
- política de rollout e tempo necessário para uma nova réplica ficar Ready.

`topologySpreadConstraints` distribui Pods por labels como `kubernetes.io/hostname` ou `topology.kubernetes.io/zone`. `ScheduleAnyway` expressa uma preferência e evita bloquear o workload quando há poucos domínios; `DoNotSchedule` transforma o limite de assimetria em requisito e pode deixar Pods `Pending`. Confirme que os nós possuem os labels usados.

Pod anti-affinity também separa réplicas. A forma `requiredDuringSchedulingIgnoredDuringExecution` é rígida e pode impedir o agendamento; `preferredDuringSchedulingIgnoredDuringExecution` apenas influencia a escolha. Topology spread costuma ser mais flexível quando a intenção é controlar a distribuição entre vários domínios.

Nenhuma dessas opções cria novos domínios. Três réplicas em um único nó continuam sujeitas à perda simultânea.

## PodDisruptionBudget e seus limites

Um PodDisruptionBudget (PDB) limita quantos Pods selecionados podem ficar indisponíveis durante **disrupções voluntárias** que usam a API de Eviction, como um `kubectl drain`. Escolha `minAvailable` ou `maxUnavailable` de acordo com a capacidade mínima real do serviço e verifique se o seletor corresponde ao workload.

Um PDB:

- não protege contra falha física, perda de rede ou pressão de recursos no nó;
- não adiciona réplicas nem garante que elas estejam em nós distintos;
- pode impedir uma manutenção quando não há capacidade para reagendar os Pods;
- não impede a exclusão direta de Pods ou do controller;
- não controla sozinho a disponibilidade durante o rollout de um Deployment, que também depende de `maxUnavailable` e `maxSurge` da estratégia.

Teste o drain em homologação. Um PDB impossível, como `minAvailable` igual ao número de réplicas sem capacidade adicional, pode bloquear todas as evictions voluntárias.

## Startup, readiness e liveness probes

Cada probe responde a uma pergunta diferente:

| Probe | Pergunta | Consequência da falha |
| --- | --- | --- |
| `startupProbe` | A aplicação terminou a inicialização? | Depois do limite de falhas, o container é reiniciado; enquanto não tiver sucesso, liveness e readiness não atuam |
| `readinessProbe` | O Pod pode receber novas requisições agora? | O Pod deixa de ser um endpoint Ready do Service, sem reinício por essa falha |
| `livenessProbe` | A aplicação entrou em um estado irrecuperável que um reinício corrige? | Depois do limite de falhas, o container é reiniciado |

Use startup probe quando a inicialização pode ultrapassar com segurança o período aceitável da liveness. Meça o pior tempo esperado e configure `failureThreshold × periodSeconds` com margem explícita.

A readiness deve ser rápida e refletir a capacidade de atender novas requisições. Inclua somente dependências sem as quais a réplica realmente não consegue servir; uma dependência opcional não deveria retirar todas as réplicas do tráfego.

A liveness deve verificar o processo local e uma condição recuperável por reinício. Não faça a liveness depender de banco, DNS, Internet ou outra API compartilhada: a indisponibilidade externa poderia reiniciar todas as réplicas em cascata. Se um reinício não corrige a condição, liveness é o mecanismo errado.

Antipadrões frequentes:

- copiar intervalos de outro serviço sem medir inicialização e recuperação;
- usar o mesmo endpoint e a mesma semântica para as três probes;
- executar consultas caras ou com efeitos colaterais;
- usar timeout menor que a latência normal sob carga;
- considerar a porta aberta como prova suficiente de prontidão funcional;
- adicionar probes a Jobs apenas para satisfazer um checklist.

## Encerramento gracioso

Ao terminar um Pod, o Kubernetes inicia o período de graça, executa o hook `preStop` quando configurado e envia `SIGTERM` ao processo principal. Ao final de `terminationGracePeriodSeconds`, processos restantes podem receber `SIGKILL`. O tempo usado pelo `preStop` faz parte do mesmo prazo.

A aplicação deve tratar `SIGTERM` e, dentro do período configurado:

1. deixar de aceitar trabalho novo ou sinalizar falta de readiness;
2. concluir requisições, mensagens ou transações já aceitas;
3. persistir ou devolver trabalho não concluído de forma segura;
4. fechar conexões e encerrar o processo com código apropriado.

Use `preStop` somente quando houver uma ação complementar clara, como avisar um registro externo ou conceder um intervalo curto para propagação da retirada de endpoints. Um `sleep` não corrige uma aplicação que ignora `SIGTERM`, e containers distroless podem nem possuir shell. Meça a duração real do shutdown antes de definir o prazo.

## Jobs e CronJobs

Jobs representam trabalho finito e devem terminar com sucesso ou falha observável. Configure conforme o caso:

- `restartPolicy: Never` ou `OnFailure` e um `backoffLimit` finito;
- `activeDeadlineSeconds` para impedir execução indefinida;
- `ttlSecondsAfterFinished` ou retenção externa suficiente para diagnóstico e auditoria;
- paralelismo e completions compatíveis com idempotência e capacidade das dependências;
- alertas para falha, atraso e ausência de uma execução esperada.

Probes não indicam conclusão de uma tarefa. Readiness normalmente não tem utilidade para um Job que não recebe tráfego; startup ou liveness só fazem sentido quando detectam uma condição interna específica e um reinício do container é a recuperação correta.

Para CronJobs, defina também:

- `concurrencyPolicy: Forbid` quando execuções não podem sobrepor, ou `Replace` somente quando interromper a anterior é seguro;
- `startingDeadlineSeconds` de acordo com o atraso tolerado;
- limites de histórico de Jobs bem-sucedidos e com falha;
- timezone explícito quando o horário local faz parte do requisito;
- operação idempotente, pois o agendamento é aproximado e uma execução pode ocorrer mais de uma vez ou deixar de ser criada em certas condições.

Não use `concurrencyPolicy` como trava entre CronJobs diferentes; ela se aplica apenas às execuções do mesmo recurso.

## ServiceAccount e securityContext

Use uma ServiceAccount dedicada por workload ou fronteira de privilégio. Se o Pod não chama a API Kubernetes, desabilite a montagem automática do token. Se chama, conceda apenas os recursos e verbos necessários e valide-os conforme o guia de [identidade e RBAC](../../../guides/tasks/kubernetes/configure-rbac/).

Adote um `securityContext` compatível com a imagem e com o perfil Restricted do Pod Security Standards sempre que possível:

- execute como usuário não root e use IDs conhecidos pela imagem;
- defina `allowPrivilegeEscalation: false`;
- remova capabilities, começando por `drop: ["ALL"]`;
- use `seccompProfile.type: RuntimeDefault`;
- habilite `readOnlyRootFilesystem` e monte volumes graváveis apenas onde forem necessários;
- não use `privileged`, `hostPID`, `hostIPC` ou `hostNetwork` sem justificativa e controles compensatórios.

Esses controles não substituem a política de tráfego. Defina também a [NetworkPolicy](../../../guides/tasks/networking/configure-network-policies/) mínima para DNS, dependências e entrada esperada.

## Exemplo mínimo coerente

O exemplo combina uma ServiceAccount sem token, três réplicas, rollout conservador, topology spread preferencial, probes distintas, encerramento gracioso, recursos, security context, Service e PDB. Substitua namespace, imagem, endpoints, recursos, IDs e prazos pelos valores validados para a aplicação. Gerencie versão e digest conforme o [ciclo de vida de imagens](../../../learn/containers/image-lifecycle/).

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: catalog-api
  namespace: apps
automountServiceAccountToken: false
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalog-api
  namespace: apps
  labels:
    app.kubernetes.io/name: catalog-api
    app.kubernetes.io/part-of: catalog
  annotations:
    example.com/owner: team-catalog
    example.com/criticality: high
spec:
  replicas: 3
  revisionHistoryLimit: 3
  minReadySeconds: 10
  progressDeadlineSeconds: 300
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: catalog-api
  template:
    metadata:
      labels:
        app.kubernetes.io/name: catalog-api
        app.kubernetes.io/part-of: catalog
    spec:
      serviceAccountName: catalog-api
      automountServiceAccountToken: false
      terminationGracePeriodSeconds: 30
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app.kubernetes.io/name: catalog-api
      containers:
        - name: app
          image: registry.example.com/catalog-api:1.4.2
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 8080
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          startupProbe:
            httpGet:
              path: /health/startup
              port: http
            timeoutSeconds: 2
            periodSeconds: 2
            failureThreshold: 30
          readinessProbe:
            httpGet:
              path: /health/ready
              port: http
            timeoutSeconds: 2
            periodSeconds: 5
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /health/live
              port: http
            timeoutSeconds: 2
            periodSeconds: 10
            failureThreshold: 3
          lifecycle:
            preStop:
              exec:
                command:
                  - /bin/sh
                  - -c
                  - sleep 5
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: catalog-api
  namespace: apps
spec:
  selector:
    app.kubernetes.io/name: catalog-api
  ports:
    - name: http
      port: 80
      targetPort: http
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: catalog-api
  namespace: apps
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app.kubernetes.io/name: catalog-api
```yaml

O `preStop` do exemplo pressupõe que a imagem contém `/bin/sh`. Prefira um hook entendido pela própria aplicação ou remova-o se o tratamento de `SIGTERM` já for suficiente. O registry e a imagem são ilustrativos e devem ser substituídos antes da validação.

## Validações

Antes da implantação:

```bash
kubectl apply --dry-run=server --filename workload.yaml
kubectl diff --filename workload.yaml
kubectl auth can-i --list \
  --namespace apps \
  --as system:serviceaccount:apps:catalog-api
```yaml

Depois da implantação:

```bash
kubectl --namespace apps rollout status deployment/catalog-api
kubectl --namespace apps get pods \
  --selector app.kubernetes.io/name=catalog-api \
  --output wide
kubectl --namespace apps get pod <pod> \
  --output jsonpath='{.status.qosClass}{"\n"}'
kubectl --namespace apps describe pod <pod>
kubectl --namespace apps get poddisruptionbudget catalog-api
kubectl --namespace apps get endpointslice \
  --selector kubernetes.io/service-name=catalog-api
```yaml

Confirme que:

- todas as réplicas ficam Ready dentro do prazo de rollout;
- a distribuição observada corresponde à quantidade de nós e aos labels de topologia;
- o PDB apresenta `ALLOWED DISRUPTIONS` compatível com a manutenção planejada;
- somente Pods Ready aparecem como endpoints prontos;
- não há reinícios, eventos de probe, throttling ou OOM inesperados;
- as permissões da ServiceAccount não excedem a necessidade do workload.

## Testes de falha

Execute em homologação ou em janela controlada, com critérios de interrupção e observabilidade ativos:

1. atrase a inicialização para validar a startup probe e o prazo do rollout;
2. torne uma dependência necessária indisponível e confirme a retirada por readiness sem reinícios em cascata;
3. simule um travamento interno recuperável e confirme que somente a liveness reinicia o container;
4. termine um Pod e meça `SIGTERM`, conclusão das requisições e duração do shutdown;
5. remova uma réplica e confirme reposição, disponibilidade e distribuição; lembre que exclusão direta não testa o PDB;
6. drene um nó em homologação e confirme eviction, PDB, capacidade de reagendamento e continuidade do serviço;
7. teste carga e pressão de CPU/memória para verificar latência, throttling e margem antes de OOM;
8. para CronJobs, simule atraso, sobreposição e repetição para confirmar deadline, concorrência, idempotência e alertas.

Registre o resultado negativo também. Uma proteção que nunca foi exercitada é apenas uma hipótese.

## Evidências para o checklist

Guarde evidências sem copiar Secrets, tokens ou dados pessoais:

| Item | Evidência útil |
| --- | --- |
| Ownership e criticidade | URL do catálogo ou runbook, responsável, escalonamento e data de revisão |
| Recursos | Manifesto versionado, teste de carga, percentis de consumo e justificativa da margem |
| Réplicas e topologia | Saída dos Pods por nó/zona, capacidade livre e resultado do teste de perda de nó |
| PDB | Manifesto, `ALLOWED DISRUPTIONS` antes da janela e resultado do drain |
| Probes | Tempos medidos, eventos esperados e resultado dos cenários de inicialização, dependência e travamento |
| Shutdown | Duração observada, requisições em andamento concluídas e ausência de erro durante terminação |
| Identidade e segurança | ServiceAccount, resultado de `auth can-i`, security context e política de rede associada |
| Jobs e CronJobs | Últimas execuções, duração, falhas, alertas e teste de idempotência |

Inclua versão ou commit do manifesto, ambiente, data, executor e conclusão. Saídas sem esse contexto envelhecem sem indicar o que realmente foi validado.

## Problemas comuns

| Sintoma | Verificações iniciais |
| --- | --- |
| Pod `Pending` | Eventos do scheduler, requests versus allocatable, taints, PVCs e restrições rígidas de topologia ou afinidade |
| `OOMKilled` | Limite, pico de uso, vazamento, cache, concorrência e memória usada por sidecars |
| Latência sem alto uso aparente | Throttling de CPU, timeout das probes, filas internas e saturação das dependências |
| `CrashLoopBackOff` após deploy | Logs anteriores, comando da imagem, configuração, Secret, startup/liveness e permissões de escrita |
| Todas as réplicas ficam NotReady | Dependência compartilhada na readiness, erro de configuração ou endpoint caro/lento |
| Reinícios durante falha externa | Liveness acoplada a banco, DNS ou API externa |
| Drain bloqueado | PDB incompatível, falta de capacidade, réplicas no mesmo domínio ou Pods sem controller |
| Rollout sem avançar | `maxUnavailable`, `maxSurge`, quota, capacidade, imagem, startup/readiness e `progressDeadlineSeconds` |
| `permission denied` com hardening | UID/GID da imagem, diretórios graváveis, capabilities removidas e filesystem somente leitura |
| CronJob duplicado ou atrasado | Idempotência, `concurrencyPolicy`, `startingDeadlineSeconds`, timezone e saúde do controller |

## Conteúdo relacionado

- [Guia de operação contínua](../cluster-operational-checklist/)
- [Conceitos fundamentais do Kubernetes](../../../learn/clusters/kubernetes/)
- [Ciclo de vida de imagens](../../../learn/containers/image-lifecycle/)
- [Identidade e RBAC](../../../guides/tasks/kubernetes/configure-rbac/)
- [Isolamento com NetworkPolicy](../../../guides/tasks/networking/configure-network-policies/)

## Fontes e leitura adicional

- [Kubernetes — Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) — Define requests, limits, agendamento, throttling de CPU e aplicação de limites de memória.
- [Kubernetes — Pod Quality of Service Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/) — Explica os critérios de `Guaranteed`, `Burstable` e `BestEffort` e sua relação com eviction.
- [Kubernetes — Pod Topology Spread Constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/) — Documenta distribuição por domínios, `maxSkew` e políticas de agendamento.
- [Kubernetes — Disruptions](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/) — Delimita disrupções voluntárias e involuntárias e o comportamento dos PodDisruptionBudgets.
- [Kubernetes — Liveness, Readiness, and Startup Probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/) — Define a finalidade, configuração e consequências de cada probe.
- [Kubernetes — Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination-flow) — Descreve o fluxo de terminação, o período de graça e o encerramento forçado.
- [Kubernetes — Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/) — Referência de retries, deadlines, paralelismo, conclusões e limpeza de Jobs.
- [Kubernetes — CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/) — Documenta agendamento, concorrência, deadlines, histórico e limitações de execução.
- [Kubernetes — Service Accounts](https://kubernetes.io/docs/concepts/security/service-accounts/) — Explica identidades de workloads e a montagem de credenciais para acesso à API.
- [Kubernetes — Configure a Security Context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/) — Detalha usuários, grupos, capabilities, seccomp e privilégios de containers.
