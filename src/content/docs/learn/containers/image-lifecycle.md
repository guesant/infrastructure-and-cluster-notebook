---
title: Ciclo de vida de imagens
sidebar:
  order: 1
---

Este guia transforma os itens de imagens do [guia de operação contínua](../../../operations/checklists/cluster-operational-checklist/) em um fluxo prático de avaliação, atualização, implantação e rollback. Antes de aplicá-lo a produção, confirme também os requisitos de [prontidão dos workloads](../../../operations/checklists/application-readiness/) e as [convenções deste repositório](../../../reference/conventions/).

O objetivo não é atualizar toda imagem assim que uma versão aparece. O objetivo é manter cada mudança identificável, revisável, compatível, observável e reversível dentro dos limites reais da aplicação.

## Estado desejado e estado observado

O **estado desejado** é o conteúdo versionado no Git: referência da imagem, `imagePullPolicy`, configuração do workload, estratégia de rollout e demais dependências. O **estado observado** é o que a API e o runtime informam sobre Deployments, ReplicaSets e Pods em execução.

Esses estados podem divergir. Um manifesto pode continuar declarando a mesma tag enquanto o registro passa a servir outro conteúdo, um rollout pode parar com réplicas indisponíveis ou Pods antigos podem permanecer em execução. O Argo CD compara os recursos do cluster com os manifests renderizados; ele não trata uma mudança invisível no conteúdo de uma tag como uma alteração no Git.

Para encerrar uma atualização, confirme pelo menos:

- a referência desejada registrada no Git;
- o digest esperado para a release e arquitetura adotadas;
- o `imageID` observado nos containers em execução;
- a revisão do workload e a quantidade de réplicas disponíveis;
- o resultado funcional, operacional e de segurança definido antes da mudança.

## Tags, digests e reprodutibilidade

| Referência | Exemplo | Propriedade principal | Uso recomendado |
| --- | --- | --- | --- |
| Tag explícita | `registry.example.com/team/api:2.4.1` | Comunica a versão, mas pode ser republicada se o registro permitir | Desenvolvimento ou produção somente com política que garanta imutabilidade e evidência do digest |
| Tag flutuante | `registry.example.com/team/api:stable` | Pode apontar para conteúdos diferentes sem alteração do manifesto | Evitar como versão efetiva em produção |
| Digest | `registry.example.com/team/api@sha256:...` | Identifica conteúdo imutável por hash | Produção quando a reprodutibilidade for necessária |
| Tag e digest | `registry.example.com/team/api:2.4.1@sha256:...` | Preserva uma versão legível e fixa o conteúdo pelo digest | Forma preferida quando o processo mantém tag e digest associados |

`latest`, `stable`, `lts`, nomes de canal e tags de branch são flutuantes, mesmo quando parecem estáveis. Uma tag numérica também não é imutável por definição: a garantia depende da política do registro e do processo de publicação.

Quando tag e digest aparecem juntos, o runtime usa o digest para selecionar o conteúdo. Mantenha a tag no inventário para relacionar a imagem às notas da release, mas use o digest como identidade do artefato implantado.

:::caution
Fixar um digest garante identidade e integridade do conteúdo recuperado; não comprova quem o produziu, se o processo de build era confiável, se a imagem está livre de vulnerabilidades ou se a aplicação é adequada ao ambiente.
:::

## `imagePullPolicy`

Defina a política explicitamente para que a intenção não dependa dos defaults aplicados na criação do objeto:

- `Always`: antes de iniciar o container, o kubelet consulta o registro para resolver a referência; camadas já presentes ainda podem ser reutilizadas. Isso não reinicia Pods existentes quando o conteúdo de uma tag muda.
- `IfNotPresent`: reutiliza a imagem disponível no nó. É apropriado para conteúdo fixado por digest, mas pode manter conteúdos diferentes entre nós quando combinado com tags mutáveis.
- `Never`: exige que a imagem já exista no nó e normalmente fica restrito a ambientes preparados para esse modelo.

Quando `imagePullPolicy` é omitido, o Kubernetes define um valor durante a criação do objeto com base na referência informada. Alterar a tag ou adicionar um digest posteriormente não atualiza automaticamente esse campo. Por isso, registre a política no manifesto em vez de depender dessa inferência.

Exemplo reduzido de um Deployment com versão legível, digest fixo e rollout conservador:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  progressDeadlineSeconds: 600
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: api
  template:
    metadata:
      labels:
        app.kubernetes.io/name: api
    spec:
      containers:
        - name: api
          image: registry.example.com/team/api:2.4.1@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 8080
          readinessProbe:
            httpGet:
              path: /ready
              port: http
```yaml

Substitua a referência ilustrativa pelo registro, versão e digest verificados. A probe também precisa representar a prontidão real da aplicação; não copie o endpoint sem validar sua semântica.

## Inventário de componentes

Não use a versão do chart como sinônimo da versão do software em execução. Registre separadamente:

| Item | Evidência mínima |
| --- | --- |
| Chart Helm ou revisão de manifests | Nome, origem, versão ou commit e valores relevantes |
| Controller ou operator | Versão declarada pelo projeto e imagens de todos os seus containers |
| CRDs | Grupo, recurso, versões servidas ou armazenadas, origem e ordem de atualização |
| Imagens | Registro, repositório, tag, digest desejado e `imageID` observado |
| Containers auxiliares | Imagens de init containers, sidecars, Jobs de migração e webhooks |
| Origem da mudança | PR, commit, release upstream, responsável e data |

Um chart pode atualizar templates sem trocar todas as imagens, usar versões diferentes por componente ou instalar CRDs cujo ciclo de vida não acompanha o rollback do chart. O inventário separado permite avaliar compatibilidade e restaurar o conjunto correto.

## Proveniência, assinatura, SBOM e vulnerabilidades

Defina quais evidências são exigidas pelo risco do ambiente, sem presumir que uma ferramenta isolada resolva a cadeia de suprimentos:

- **origem:** confirme o registro, o namespace e o processo de publicação reconhecidos pelo mantenedor;
- **assinatura:** valide que o digest foi assinado por uma identidade ou chave aceita pela política do ambiente;
- **proveniência:** registre fonte, processo e parâmetros de build disponíveis e avalie o nível de confiança necessário;
- **SBOM:** use a lista de componentes para conhecer dependências e apoiar investigações, sem tratá-la como prova de ausência de vulnerabilidades;
- **vulnerabilidades:** registre data, base consultada, severidade, exploração conhecida, exposição no ambiente, mitigação e decisão de aceite ou bloqueio;
- **exceções:** toda aceitação de risco deve ter justificativa, responsável, prazo e condição de revisão.

Assinatura confirma uma relação criptográfica dentro de uma política de confiança; ela não assegura que o código assinado seja seguro. Proveniência descreve como o artefato foi produzido, mas ainda precisa ser avaliada. Um scanner apresenta conhecimento disponível naquele momento e pode mudar depois que novas vulnerabilidades são publicadas.

## Avaliar a release e a compatibilidade

Antes de propor a atualização, responda e registre:

1. Qual problema funcional ou de segurança justifica a mudança?
2. A release e sua base ainda possuem suporte?
3. Quais mudanças incompatíveis, deprecações, migrações ou novos defaults existem?
4. A imagem suporta a arquitetura dos nós e a versão de Kubernetes/K3s do ambiente?
5. Chart, controller, operator, CRDs, webhooks e imagens formam uma combinação suportada?
6. Há alteração de esquema, dados, configuração, permissões, portas, probes ou consumo de recursos?
7. O downgrade é suportado depois da migração? Se não for, qual recuperação substitui o rollback de imagem?
8. As evidências de origem, proveniência, assinatura, SBOM e vulnerabilidades atendem à política definida?

Notas de release e uma matriz declarada pelo fornecedor são o ponto de partida, não substitutos da homologação. Quando não houver matriz ou procedimento de downgrade, registre explicitamente a incerteza e reduza o alcance inicial da mudança.

## Atualização por PR e GitOps

Use uma mudança no estado desejado para iniciar o rollout. Uma automação pode descobrir releases e abrir uma proposta, mas não deve trocar silenciosamente a imagem efetiva de produção.

Fluxo recomendado:

1. inventarie a referência desejada e o `imageID` observado antes da mudança;
2. avalie release, compatibilidade e evidências da cadeia de suprimentos;
3. associe a tag escolhida ao digest correto para as plataformas adotadas;
4. altere imagem, inventário e configuração dependente no mesmo branch;
5. descreva no PR escopo, risco, homologação, critérios de sucesso, interrupção e rollback;
6. revise o diff renderizado e a ordem de atualização entre CRDs, controllers e workloads;
7. homologue exatamente o digest proposto;
8. aprove e integre o PR; então permita que o [Argo CD](../../../guides/tasks/gitops/install-argocd/) reconcilie a mudança conforme o [bootstrap GitOps](../../../guides/tasks/gitops/bootstrap-gitops/);
9. acompanhe o rollout e a janela de observação;
10. anexe a evidência final ao PR, ticket ou registro operacional.

Evite usar `kubectl set image`, editar o Deployment diretamente ou reiniciar Pods para fazer a atualização normal. Essas ações criam estado fora do Git ou apenas recriam containers sem registrar uma nova versão desejada. Mudanças emergenciais ainda devem produzir um commit revisável e reconciliar o repositório assim que o procedimento extraordinário permitir.

## Homologação, canary e rolling update

### Homologação

Use os mesmos manifests renderizados, digest e configurações dependentes que irão para produção. Exercite inicialização, probes, tráfego essencial, integrações, migrações, consumo de recursos, observabilidade e rollback. Dados ou escala reduzidos precisam preservar os riscos que a mudança pretende validar.

### Canary

Um canary expõe uma parcela controlada do tráfego ou dos usuários à nova versão e compara seu comportamento com a versão anterior. Um Deployment comum com rolling update não oferece, sozinho, divisão ponderada de tráfego ou análise automática. Defina como as versões serão separadas, como o tráfego será direcionado, quais métricas serão comparadas e quando ampliar ou encerrar o canary.

### Rolling update

Em um rolling update, `maxUnavailable` limita a indisponibilidade durante a substituição e `maxSurge` controla a capacidade temporária adicional. Verifique antes se há réplicas suficientes, capacidade livre e readiness confiável. Para mudanças stateful ou de esquema, confirme compatibilidade entre versões enquanto Pods antigos e novos coexistirem.

Escolha a estratégia pelo risco:

| Condição | Estratégia inicial |
| --- | --- |
| Mudança de baixo risco, stateless e compatível | Rolling update observado |
| Mudança com efeito incerto ou alto tráfego | Canary com alcance e duração definidos |
| Migração incompatível ou rollback destrutivo | Janela controlada, backup validado e plano específico de migração ou recuperação |

## Critérios de sucesso e interrupção

Defina limites numéricos e uma janela de observação antes do merge. “Parece saudável” não é um critério reproduzível.

| Continuar ou concluir | Interromper e avaliar rollback |
| --- | --- |
| Rollout concluiu no prazo e todas as réplicas esperadas estão disponíveis | Rollout excedeu o prazo ou réplicas permanecem indisponíveis |
| Pods usam o digest esperado e não há mistura imprevista de revisões | `imageID` inesperado, arquitetura incorreta ou revisão não planejada |
| Readiness, liveness e startup permanecem dentro do comportamento medido | Falhas de probe, `CrashLoopBackOff`, reinícios ou `OOMKilled` acima do limite |
| Erros, latência, saturação e recursos permanecem dentro dos limites definidos | SLO, taxa de erros, latência ou saturação ultrapassam o limite de interrupção |
| Fluxos críticos, integrações e dados passam nas validações | Regressão funcional, erro de migração ou incompatibilidade com dependências |
| Alertas e telemetria continuam disponíveis e confiáveis | A mudança não pode ser observada por falha do monitoramento ou dos alertas |

Se um critério de interrupção for atingido, não amplie o canary nem continue etapas do rollout enquanto a causa e a capacidade de recuperação não forem compreendidas.

## Inspeção e validação com `kubectl`

Os comandos abaixo apenas consultam ou acompanham recursos; não alteram o estado do cluster. Ajuste namespace, nome e seletor antes de executá-los:

```bash
NAMESPACE="example"
DEPLOYMENT="api"
SELECTOR="app.kubernetes.io/name=api"

# Referência e política declaradas no template do Deployment.
kubectl --namespace "${NAMESPACE}" get deployment "${DEPLOYMENT}" \
  --output jsonpath='{range .spec.template.spec.containers[*]}{.name}{"\t"}{.image}{"\t"}{.imagePullPolicy}{"\n"}{end}'

# Progresso, condições e histórico de revisões.
kubectl --namespace "${NAMESPACE}" rollout status \
  "deployment/${DEPLOYMENT}" \
  --timeout=5m
kubectl --namespace "${NAMESPACE}" get deployment "${DEPLOYMENT}" \
  --output wide
kubectl --namespace "${NAMESPACE}" rollout history \
  "deployment/${DEPLOYMENT}"

# Imagem desejada e imageID observado por container em cada Pod.
kubectl --namespace "${NAMESPACE}" get pods \
  --selector "${SELECTOR}" \
  --output custom-columns='POD:.metadata.name,READY:.status.containerStatuses[*].ready,IMAGEM:.spec.containers[*].image,IMAGE_ID:.status.containerStatuses[*].imageID,REINICIOS:.status.containerStatuses[*].restartCount'

# ReplicaSets e eventos ajudam a explicar um rollout incompleto.
kubectl --namespace "${NAMESPACE}" get replicasets \
  --selector "${SELECTOR}" \
  --sort-by=.metadata.creationTimestamp
kubectl --namespace "${NAMESPACE}" describe deployment "${DEPLOYMENT}"
kubectl --namespace "${NAMESPACE}" get events \
  --sort-by=.metadata.creationTimestamp
```yaml

O formato de `imageID` depende do runtime. Em imagens multi-arquitetura, o digest fixado pode identificar um índice OCI, enquanto o runtime registra o manifesto específico da plataforma. Nesse caso, valide a relação entre ambos em vez de exigir igualdade textual sem contexto.

## Rollback

O rollback normal em GitOps é uma nova mudança versionada que restaura o último conjunto conhecido como bom:

1. identifique o commit, a configuração, o chart, os CRDs e o digest anteriores;
2. confirme se migrações executadas permitem voltar à versão anterior;
3. reverta o commit ou abra um PR de rollback com a justificativa e o alcance;
4. permita que o Argo CD reconcilie o estado restaurado;
5. acompanhe o rollout usando os mesmos critérios objetivos;
6. registre o resultado e mantenha aberta a investigação da causa.

`kubectl rollout undo` não é o procedimento principal neste modelo: ele altera o cluster sem alterar o Git, e o Argo CD pode restaurar novamente a versão que continua declarada no repositório.

Rollback de imagem não desfaz automaticamente CRDs, esquemas de banco, dados, Secrets, filas, formatos de mensagem nem chamadas externas. Se a mudança não for retrocompatível, a recuperação pode exigir restauração de backup ou uma correção para frente. Preserve o artefato anterior e os backups pelo tempo necessário à janela de observação, mas não prometa rollback até que ele tenha sido exercitado.

## Modelo de evidência

Use um registro semelhante no PR, ticket ou runbook:

```text
Mudança / PR:
Responsável e janela:
Ambiente, namespace e workload:

Estado anterior:
- commit ou revisão:
- chart / controller / CRDs:
- imagem com tag e digest:
- imageID observado:

Estado proposto:
- release e justificativa:
- chart / controller / CRDs:
- imagem com tag e digest:
- compatibilidade avaliada:

Cadeia de suprimentos:
- origem:
- assinatura e identidade esperada:
- proveniência:
- SBOM:
- vulnerabilidades, data da análise e exceções:

Implantação:
- homologação:
- estratégia e alcance inicial:
- critérios de sucesso:
- critérios de interrupção:
- referência e procedimento de rollback:

Resultado:
- horários de início, conclusão e fim da observação:
- digest / imageID observado:
- réplicas, probes, métricas, alertas e testes funcionais:
- decisão final e ações pendentes:
```yaml

Não inclua tokens, conteúdo de Secrets, credenciais do registro ou outros dados sensíveis na evidência.

## Fontes e leitura adicional

- [Imagens de containers no Kubernetes](https://kubernetes.io/docs/concepts/containers/images/): semântica de nomes, tags, digests, cache e `imagePullPolicy`.
- [Deployments no Kubernetes](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/): rolling update, acompanhamento, histórico, falhas e rollback de Deployments.
- [OCI Image Format](https://github.com/opencontainers/image-spec): especificação de manifests, índices, configuração e identificação de conteúdo por digest.
- [SLSA Provenance](https://slsa.dev/spec/v1.1/provenance): modelo de proveniência para relacionar um artefato ao processo e às entradas do build.
- [Visão geral do Sigstore](https://docs.sigstore.dev/about/overview/): fundamentos de assinatura, identidade e transparência para artefatos de software.
- [Sincronização automatizada do Argo CD](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/): comportamento de reconciliação, self-heal e prune no fluxo GitOps.
