---
title: Backup e recuperação
sidebar:
  order: 2
---

Este guia organiza a proteção e a recuperação de um cluster sem depender de uma única ferramenta. Ele detalha os itens do [guia de operação contínua](../../checklists/cluster-operational-checklist/) e deve ser adaptado à criticidade, aos dados e às dependências de cada ambiente.

Um backup só está comprovado quando uma restauração isolada recupera o serviço dentro dos objetivos definidos. A existência de um arquivo, snapshot ou Job com status de sucesso não demonstra isso sozinha.

## Réplica, snapshot e backup

Esses mecanismos resolvem problemas diferentes:

| Mecanismo | Objetivo principal | Limite |
| --- | --- | --- |
| Réplica | Manter o serviço disponível após a perda de uma instância, disco ou nó | Exclusão, corrupção lógica, ransomware ou credencial comprometida podem atingir todas as réplicas |
| Snapshot | Criar um ponto de retorno rápido de um volume ou datastore | Pode permanecer no mesmo storage e domínio de falha; sem coordenação com a aplicação, pode representar apenas o estado de um disco após uma queda abrupta |
| Backup | Manter uma cópia recuperável com retenção e controles próprios | Exige destino, credenciais, monitoramento, cadeia de retenção e procedimento de restauração independentes |

Alta disponibilidade reduz interrupções; backup limita perda permanente; um restore drill demonstra recuperabilidade. Nenhum substitui os outros.

## Inventário dos ativos

Comece pela recuperação completa, não pela ferramenta. Para cada serviço, identifique todos os ativos necessários:

| Ativo | O que deve ser protegido | Limite ou dependência importante |
| --- | --- | --- |
| Datastore K3s | Snapshot do etcd ou cópia do datastore adotado, token do servidor e versão/configuração necessárias à restauração | O snapshot contém recursos da API, mas não contém os dados dos PVs; o token original é necessário para dados confidenciais do snapshot |
| Estado declarativo | Repositórios Git, commits implantados, manifests, charts, CRDs, configuração de bootstrap e referências imutáveis de imagens | Um clone local ou o próprio cluster não pode ser a única cópia; dependências externas precisam continuar acessíveis |
| Volumes persistentes | Dados de cada PV/PVC, StorageClass, modo de acesso, capacidade e relação com o workload | Snapshot do volume pode ficar no mesmo domínio de falha e não garante consistência da aplicação |
| Bancos e aplicações stateful | Backup lógico ou físico suportado pela aplicação, logs de transação/WAL e metadados necessários | Copiar arquivos montados durante escrita pode produzir um conjunto irrecuperável ou incompleto |
| Credenciais e configuração | Fonte externa dos Secrets, bootstrap, chaves de criptografia, certificados, configuração não declarativa e acesso de emergência | Não grave valores sensíveis no Git ou nas evidências; confirme como recuperar a fonte de segredos sem depender do cluster perdido |
| Artefatos de execução | Imagens, digests, charts e pacotes necessários para reconstrução | Tags e registries indisponíveis podem impedir a recuperação mesmo com manifests e dados válidos |

Para descobrir lacunas sem imprimir valores sensíveis, use apenas metadados:

```bash
kubectl get storageclass
kubectl get persistentvolumeclaim --all-namespaces
kubectl get statefulset,deployment --all-namespaces
kubectl get cronjob --all-namespaces
kubectl get customresourcedefinition
```yaml

Não exporte Secrets em claro para “completar” o inventário. Registre a origem, o responsável e o procedimento de recuperação da credencial.

## Modelo de matriz de proteção

Mantenha uma linha por ativo e por método. Um banco protegido por backup físico e dump lógico, por exemplo, precisa de duas linhas porque possui frequências, retenções e restaurações diferentes.

| ID | Ativo e responsável | Consistência/método | RPO | RTO | Frequência e retenção | Destino/domínio de falha | Proteção e acesso | Último restore testado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K3S-01 | Datastore K3s — `<equipe>` | Snapshot etcd + token correlacionado | `<definir>` | `<definir>` | `<agenda>` / `<retenção>` | `<destino externo>` | `<criptografia, imutabilidade, papéis>` | `<data, evidência>` |
| GIT-01 | Estado declarativo — `<equipe>` | Repositório remoto protegido + cópia independente | `<definir>` | `<definir>` | `<frequência>` / `<retenção>` | `<outro provedor ou conta>` | `<MFA, acesso, proteção contra exclusão>` | `<data, commit restaurado>` |
| PV-01 | `<PVC/aplicação>` — `<equipe>` | `<backup externo ou snapshot + cópia>` | `<definir>` | `<definir>` | `<agenda>` / `<retenção>` | `<destino>` | `<controles>` | `<data, validação>` |
| DB-01 | `<banco>` — `<equipe>` | `<dump consistente ou base backup + logs>` | `<definir>` | `<definir>` | `<agenda>` / `<janela>` | `<destino>` | `<controles>` | `<data, ponto recuperado>` |
| SEC-01 | Fonte de segredos — `<equipe>` | `<backup/export suportado + bootstrap>` | `<definir>` | `<definir>` | `<agenda>` / `<retenção>` | `<destino protegido>` | `<duplo controle, rotação>` | `<data, credencial de teste>` |

Acrescente, conforme necessário:

- versão e formato do backup;
- dependências e ordem de restauração;
- procedimento e responsável pela aprovação;
- tempo esperado de transferência e tamanho do conjunto;
- data do último backup válido e do próximo teste;
- alerta que detecta falha ou atraso.

## RPO e RTO

**RPO** é a perda máxima de dados tolerada, medida em tempo. Se o RPO é 15 minutos, o mecanismo precisa permitir recuperar um ponto com no máximo 15 minutos de defasagem; um backup diário não atende.

**RTO** é o tempo máximo para restabelecer o serviço. Conte todo o caminho: declarar o incidente, obter acesso, criar infraestrutura, transferir dados, restaurar dependências, validar a aplicação e reabrir o tráfego.

Não derive o RPO somente da expressão cron. Considere:

- duração e fila do backup;
- tempo até o artefato ficar durável no destino externo;
- atraso de logs incrementais ou WAL;
- falhas consecutivas antes do alerta e da resposta;
- último ponto que foi realmente restaurado e validado.

Não estime o RTO apenas pela velocidade do storage. Meça um drill desde o acionamento até a validação funcional e compare o resultado com o objetivo. Quando um serviço depende de banco, fila, Secrets e DNS, o RTO do serviço inclui a recuperação dessas dependências.

## Frequência e retenção

A frequência precisa atender ao RPO mesmo durante manutenção e falhas transitórias. A retenção precisa cobrir o período em que uma exclusão ou corrupção pode permanecer sem ser detectada.

Defina explicitamente:

- quantos pontos horários, diários, semanais ou mensais permanecem;
- por quanto tempo backups completos, incrementais e logs necessários formam uma cadeia restaurável;
- como uma falha no backup completo afeta os incrementais seguintes;
- quando e por quem uma retenção legal ou um hold pode ser removido;
- capacidade e custo antes que o destino fique cheio;
- procedimento para expiração sem apagar o último ponto conhecido como restaurável.

Uma política com muitos snapshots recentes e nenhuma cópia anterior à data de corrupção não atende ao incidente. Preserve diversidade temporal e teste pontos antigos dentro da janela declarada.

## Destino e controles de segurança

Mantenha ao menos uma cópia fora do cluster e do domínio de falha dos dados originais. “Outro bucket” no mesmo storage, conta e credencial pode continuar sujeito ao mesmo erro administrativo ou comprometimento.

Avalie para cada destino:

- região, datacenter, conta, projeto e credenciais independentes;
- criptografia em trânsito e em repouso, incluindo propriedade e recuperação das chaves;
- retenção imutável ou WORM quando suportada e compatível com a política;
- separação entre permissão de criar, ler e excluir backups;
- privilégio mínimo, credenciais curtas, MFA e acesso de emergência auditado;
- logs de acesso, exclusão e alteração de políticas;
- checksum, tamanho e cadeia de custódia dos artefatos;
- proteção contra overwrite, expiração acidental e custos inesperados.

O backup do datastore e o token K3s precisam estar correlacionados para a restauração, mas armazená-los juntos com a mesma credencial aumenta o impacto de um vazamento. Documente como os operadores autorizados obtêm ambos sob controle de acesso e auditoria.

## Monitoramento e backups desatualizados

Monitore o resultado do Job e o artefato produzido. Um Job `Complete` não prova que o objeto chegou ao destino correto, possui tamanho plausível ou pode ser lido.

Para cada linha da matriz, registre e monitore:

- horário de início e conclusão;
- resultado completo, parcial ou falho;
- identificador, tamanho, checksum e destino do artefato;
- idade do último ponto recuperável;
- continuidade de incrementais, logs ou WAL;
- consumo e erros do destino;
- última restauração validada e duração observada.

Defina um limite de desatualização baseado em frequência, duração máxima e tolerância operacional. Dispare alerta quando `agora - conclusão do último backup válido` exceder esse limite. Assim, a ausência de uma execução também é detectada; alertar apenas Jobs com status `Failed` não cobre CronJob suspenso, controller indisponível ou agenda removida.

Alertas úteis incluem:

- execução ausente, atrasada, falha ou parcialmente concluída;
- backup ou snapshot mais antigo que o limite;
- WAL ou cadeia incremental interrompida;
- destino inacessível, cheio ou sem proteção esperada;
- falha de retenção ou exclusão inesperada;
- checksum, tamanho ou quantidade de objetos anormal;
- restore drill vencido.

Quando possível, valide a existência e a idade do backup por um monitor externo ao cluster. O mesmo incidente que derruba Kubernetes não pode apagar também a única evidência de saúde dos backups.

Consultas iniciais, adaptadas aos recursos instalados:

```bash
kubectl get cronjob,job --all-namespaces
kubectl get events --all-namespaces --sort-by=.lastTimestamp
kubectl get etcdsnapshotfile
kubectl get volumesnapshot --all-namespaces
```yaml

`ETCDSnapshotFile` e `VolumeSnapshot` podem não existir em todas as versões ou instalações. Mesmo quando existem, o objeto na API não substitui a verificação do artefato no destino externo.

## Limites do snapshot K3s

O snapshot do etcd protege o estado da API Kubernetes, incluindo objetos, metadados e Secrets presentes no datastore. Ele não contém dados gravados dentro de PVs, arquivos externos aos nós, imagens de containers ou dados mantidos por serviços fora do cluster.

O token original do servidor K3s deve ser protegido junto à estratégia de datastore. Ele é usado para dados confidenciais de bootstrap e é necessário ao restaurar em novos hosts. O snapshot e o token são materiais altamente sensíveis: quem obtém ambos pode alcançar credenciais e chaves do cluster.

Snapshots locais continuam sujeitos à perda do nó. O K3s pode enviar snapshots para storage compatível com S3, mas credenciais mantidas apenas em um Secret Kubernetes não ficam disponíveis quando a API ainda não foi restaurada. Mantenha fora do cluster os meios de acesso necessários ao modo de recuperação.

Use o [procedimento de backup do etcd](../backup-k3s-etcd/) para criação e recuperação do datastore. Registre a versão instalada, o token correspondente, o local do snapshot e a topologia original. Faça a restauração destrutiva somente no ambiente isolado ou durante um incidente aprovado.

## Limites do Longhorn

As réplicas síncronas do Longhorn aumentam a disponibilidade do volume, mas propagam exclusão e corrupção lógica. Um snapshot Longhorn pertence ao volume e ao ambiente de storage; ele oferece um ponto local rápido, não uma cópia independente por si só.

Um backup Longhorn usa um snapshot como origem e copia os blocos para um backupstore externo. Ainda assim:

- confirme que o backup target está fora do cluster e do domínio de falha;
- não presuma consistência de banco apenas porque o volume foi fotografado;
- restaure em um volume separado e valide filesystem e aplicação;
- monitore Jobs recorrentes, retenção, sincronização e integridade do backupstore;
- não presuma que o backup de volume inclui Deployment, CRDs, Secrets ou dependências externas;
- trate o system backup do Longhorn como proteção dos recursos operados pelo Longhorn, não como backup universal do cluster.

Snapshots CSI também podem permanecer no mesmo backend do PV original. Durabilidade e portabilidade dependem do driver, da `VolumeSnapshotClass` e do provedor. Consulte o [guia do Longhorn](../../../guides/tasks/storage/install-longhorn/) e teste a combinação exata adotada.

## Bancos e consistência da aplicação

Escolha um mecanismo suportado pelo próprio banco ou operator. Antes de confiar em um snapshot de volume, determine se o serviço precisa ser pausado, colocado em modo de backup ou coordenado com logs de transação.

Para PostgreSQL:

- `pg_dump` produz um dump lógico consistente de um banco no início da execução, mas roles e tablespaces globais exigem tratamento separado;
- dumps de bancos diferentes não formam automaticamente um ponto atômico comum;
- backup físico combinado com arquivamento contínuo de WAL permite recuperação point-in-time, desde que a cadeia necessária esteja completa;
- copiar diretamente o diretório de dados enquanto o servidor escreve não substitui um procedimento físico suportado;
- monitore atraso e falha do arquivamento, pois WAL ausente pode impedir o ponto desejado e encher o disco de origem.

Quando CloudNativePG for adotado, siga a API e o método documentados para a versão do operator. A recuperação física cria um novo cluster a partir do backup, em vez de alterar o cluster existente no lugar. Backups em object storage, snapshots e PITR possuem requisitos diferentes; as credenciais e Secrets necessários continuam precisando de proteção separada.

Faça a validação na camada da aplicação: abra o banco restaurado, verifique schema, constraints, usuários necessários, contagens ou checksums conhecidos e uma operação funcional de leitura e escrita. A existência do PVC ou o processo PostgreSQL iniciado não comprova integridade lógica.

## Credenciais, configuração e fonte de segredos

Recuperar objetos Secret do etcd não garante que a fonte externa, as identidades e as credenciais de bootstrap ainda funcionem. Para soluções como o [Infisical](../../../guides/tasks/secrets/install-infisical/), documente:

- backup e recuperação suportados pela plataforma que armazena os valores;
- projeto, ambiente, caminhos e políticas necessários;
- Machine Identity ou mecanismo de autenticação de emergência;
- credencial inicial mantida fora do Git e fora do cluster;
- ordem para reinstalar o operator, autenticar e ressincronizar Secrets;
- rotação das credenciais usadas durante o incidente.

Não inclua valores secretos no runbook, no ticket ou nas evidências. Registre onde obtê-los, quem autoriza e como auditar o acesso.

## Velero como ferramenta a avaliar

:::note[TODO — avaliar Velero]
Avaliar Velero em homologação antes de escolher versão, provider, plugins, classes CSI, data mover, escopo e política de retenção. Esta página não presume uma implementação.
:::

Velero pode copiar recursos Kubernetes para object storage e coordenar a proteção de volumes persistentes. Ele pode ser útil para recuperação de namespaces, migração e reconstrução de recursos, mas não transforma automaticamente todos os dados em um backup application-consistent ou atômico.

Na avaliação, confirme:

- quais recursos, namespaces, CRDs e versões de API entram no backup;
- qual plugin oficial ou mantido pelo provedor dá acesso ao object storage escolhido;
- compatibilidade entre versões de Velero, Kubernetes e plugins;
- suporte do CSI driver a snapshots `v1` e a `VolumeSnapshotClass` selecionada;
- durabilidade real do snapshot CSI fora do domínio do PV;
- necessidade de mover dados do snapshot para backup storage ou usar file-system backup;
- hooks necessários para quiescer e validar cada aplicação stateful;
- credenciais, RBAC, criptografia, retenção e modo somente leitura durante restore;
- ordem de restauração de CRDs, operators, volumes e workloads;
- comportamento diante de recursos já existentes e APIs removidas.

Nas versões atuais do Velero, o suporte CSI está integrado ao projeto, mas ainda depende de habilitação, driver e classes compatíveis. Plugins continuam relevantes para object storage e integrações de provedores. Fixe as versões somente depois de verificar a matriz oficial e testar backup e restore.

Velero não substitui:

- snapshot do datastore e token K3s quando a estratégia exige restaurar o control plane;
- backup nativo e PITR do banco;
- cópia externa e testada dos dados Longhorn;
- proteção da fonte de segredos e das credenciais de bootstrap;
- inventário, RPO/RTO, monitoramento e restore drills.

## Ordem de recuperação

Registre um grafo simples das dependências. Uma ordem inicial comum é:

1. declarar o incidente, preservar evidências, limitar escritas e escolher o ponto de recuperação;
2. obter infraestrutura, rede, DNS, identidade e acesso somente leitura aos backups;
3. restaurar o control plane K3s **ou** construir um cluster limpo; escolha uma estratégia antes de aplicar Git para não misturar estados incompatíveis;
4. instalar CRDs, controllers de storage, operators e componentes de segurança exigidos pelos recursos seguintes;
5. restaurar volumes, bancos, filas e demais serviços de dados;
6. recuperar a fonte de segredos, credenciais de bootstrap e configuração externa;
7. reconciliar workloads na ordem das dependências: dados, serviços internos, APIs, workers, gateway e tráfego externo;
8. validar integridade, segurança, observabilidade, alertas e funções críticas;
9. reabrir tráfego gradualmente e manter uma janela de observação.

Ao restaurar um snapshot etcd, muitos objetos já reaparecem na API, mas seus controllers, imagens, volumes ou endpoints externos podem continuar ausentes. Ao reconstruir por Git, o estado vivo que não estava declarado pode não reaparecer. Documente essas duas estratégias separadamente.

Para cada dependência, registre:

| Componente | Depende de | Sinal de pronto | Bloqueia |
| --- | --- | --- | --- |
| `<storage/operator>` | `<CRDs, nós, credenciais>` | `<condição e teste>` | `<PVs/bancos>` |
| `<fonte de segredos>` | `<identidade, rede>` | `<autenticação e sync testados>` | `<workloads>` |
| `<banco>` | `<storage, Secret, backup>` | `<integridade e query funcional>` | `<API/workers>` |
| `<aplicação>` | `<banco, fila, configuração>` | `<probes e teste funcional>` | `<gateway/tráfego>` |

## Ambiente isolado de restauração

O drill não deve escrever em produção nem disputar nomes, filas, buckets ou DNS com o ambiente original. Prepare:

- cluster, namespace, rede ou conta isolados;
- DNS e endpoints que não recebam tráfego real;
- credenciais de leitura dos backups e destinos novos para qualquer escrita;
- egress bloqueado ou redirecionado para email, pagamentos, webhooks e filas externas;
- capacidade suficiente para medir um RTO realista;
- relógio, timezone e ponto de recuperação registrados;
- dados protegidos com o mesmo nível de acesso do ambiente original;
- plano de descarte aprovado depois da coleta de evidências.

Uma restauração no mesmo cluster pode esconder dependências já existentes e não testa perda total. Periodicamente, restaure em infraestrutura nova, com acesso obtido pelo procedimento de emergência.

## Roteiro de restore drill

Copie este roteiro para uma issue ou runbook executável:

### Preparação

- [ ] Definir cenário: perda de Pod, volume, banco, credencial, nó ou cluster inteiro.
- [ ] Registrar responsável, participantes, janela, critérios de interrupção e canal de comunicação.
- [ ] Selecionar backup e timestamp sem consultar apenas o cluster de origem.
- [ ] Registrar RPO e RTO esperados e iniciar o cronômetro no acionamento.
- [ ] Confirmar isolamento, capacidade, versões e acesso somente leitura ao conjunto de recuperação.
- [ ] Proteger o ambiente original contra alterações acidentais.

### Recuperação

- [ ] Recuperar o acesso de emergência sem expor credenciais no ticket ou terminal compartilhado.
- [ ] Verificar identificador, checksum, tamanho, retenção e cadeia necessária do backup.
- [ ] Restaurar infraestrutura e controllers na ordem documentada.
- [ ] Restaurar datastore, volumes e bancos usando os procedimentos específicos da versão.
- [ ] Restaurar ou ressincronizar configuração e Secrets pela fonte autorizada.
- [ ] Implantar workloads e liberar dependências progressivamente.
- [ ] Registrar início, fim, erro, repetição e decisão de cada etapa.

### Validação

- [ ] Confirmar saúde de nós, controllers, volumes, Pods e Jobs.
- [ ] Medir o ponto de dados efetivamente recuperado e calcular a perda observada.
- [ ] Validar schema, integridade, contagens/checksums e uma transação funcional.
- [ ] Executar os fluxos críticos definidos na [prontidão de workloads](../../checklists/application-readiness/).
- [ ] Confirmar identidades, RBAC, certificados, NetworkPolicies e ausência de Secrets em logs.
- [ ] Validar métricas, logs, alertas e um teste externo do serviço.
- [ ] Parar o cronômetro somente quando o serviço estiver funcional, não quando a cópia terminar.

### Encerramento

- [ ] Comparar perda observada com RPO e duração total com RTO.
- [ ] Anexar evidências, sem dados sensíveis, e registrar lacunas com responsável e prazo.
- [ ] Atualizar matriz, dependências, estimativas, capacidade e runbooks.
- [ ] Rotacionar credenciais de emergência usadas no exercício, quando aplicável.
- [ ] Descartar o ambiente isolado somente após aprovação e preservação das evidências.

## Evidências mínimas

Para cada execução de backup ou drill, guarde:

| Evidência | Conteúdo mínimo |
| --- | --- |
| Identificação | Ativo, ambiente, versão, backup ID, timestamp e ponto solicitado |
| Proteção | Destino e confirmação de criptografia, retenção e imutabilidade, sem revelar credenciais |
| Integridade | Tamanho, checksum ou verificação equivalente e cadeia completa |
| Execução | Responsável, início, fim, etapas, erros, retries e alterações no plano |
| Dados | Última transação ou timestamp recuperado e perda observada |
| Serviço | Probes, consulta funcional, logs, métricas e validação externa |
| Objetivos | RPO/RTO definidos, medidos e resultado aprovado ou reprovado |
| Ações | Lacuna, risco, prioridade, responsável e prazo |

Um screenshot isolado de “Completed” não comprova integridade, destino, ponto recuperado ou função da aplicação.

## Conteúdo relacionado

- [Guia de operação contínua](../../checklists/cluster-operational-checklist/)
- [Backup do etcd do K3s](../backup-k3s-etcd/)
- [Manutenção e atualização do K3s](../../maintenance/k3s-cluster-maintenance/)
- [Longhorn](../../../guides/tasks/storage/install-longhorn/)
- [Segredos GitOps com Infisical](../../../guides/tasks/secrets/install-infisical/)
- [Prontidão de workloads](../../checklists/application-readiness/)

## Fontes e leitura adicional

- [K3s — Backup and Restore](https://docs.k3s.io/datastore/backup-restore) — Define o conteúdo do datastore, a exigência do token original e os procedimentos por tipo de backend.
- [K3s — `etcd-snapshot`](https://docs.k3s.io/cli/etcd-snapshot) — Documenta agendamento, retenção, storage compatível com S3, restauração e riscos de segurança dos snapshots.
- [Kubernetes — Volume Snapshots](https://kubernetes.io/docs/concepts/storage/volume-snapshots/) — Explica os objetos CSI de snapshot, suas classes, ciclo de vida e dependência do driver.
- [Velero — How Velero Works](https://velero.io/docs/v1.18/how-velero-works/) — Delimita backup de objetos, snapshots, hooks, retenção, restauração e ausência de atomicidade estrita.
- [Velero — CSI Snapshot Support](https://velero.io/docs/v1.18/csi/) — Lista pré-requisitos, integração CSI e ressalvas de durabilidade e portabilidade dos snapshots.
- [Longhorn — Backups and Secondary Storage](https://longhorn.io/docs/1.12.0/concepts/#3-backups-and-secondary-storage) — Diferencia réplicas, snapshots e backups copiados para um backupstore externo.
- [Longhorn — Backup and Restore](https://longhorn.io/docs/1.12.0/snapshots-and-backups/backup-and-restore/) — Documenta backup targets, criação de backups e restauração de volumes.
- [PostgreSQL — Backup and Restore](https://www.postgresql.org/docs/current/backup.html) — Compara dump SQL, backup em nível de filesystem e arquivamento contínuo com PITR.
- [CloudNativePG — Backup](https://cloudnative-pg.io/documentation/current/backup/) — Apresenta backups agendados, object storage, volume snapshots e interfaces suportadas pelo operator.
- [CloudNativePG — Recovery](https://cloudnative-pg.io/documentation/current/recovery/) — Explica recuperação em novo cluster, WAL, PITR e requisitos separados para Secrets.
