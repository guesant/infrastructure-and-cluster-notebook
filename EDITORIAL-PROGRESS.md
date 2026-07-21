# Progresso da revisão editorial

Rastreamento da aplicação do guia [EDITORIAL.md](./EDITORIAL.md) em todas as páginas de `src/content/docs/`.

## Protocolo de trabalho

1. Leia `EDITORIAL.md` por completo antes de editar qualquer página.
2. Trabalhe um lote por vez: escolha a próxima seção com itens não marcados, na ordem deste arquivo.
3. Para cada página: leia o arquivo inteiro, reescreva conforme o guia, marque `[x]` aqui.
4. Registre pendências técnicas na seção "Pendências" no final deste arquivo, com o caminho do arquivo e a dúvida objetiva.
5. Ao final do lote, pare e apresente o resumo das mudanças. Não faça commit sem autorização explícita.
6. Validação por lote: `./jail-exec.sh bun run build` deve passar antes de considerar o lote pronto.

Regras do repositório: nunca execute comandos no host, use `./jail-exec.sh`; zero comentários em código; componentes como ScriptHelper/FileWriter só funcionam em `.mdx` (em `.md` somem silenciosamente, não os introduza em `.md`).

## Páginas

### contributing
- [x] src/content/docs/contributing/adding-content.md
- [x] src/content/docs/contributing/documentation-style.md
- [x] src/content/docs/contributing/local-development.md
- [x] src/content/docs/contributing/testing-content.md

### getting-started
- [x] src/content/docs/getting-started/create-a-k3s-cluster.md
- [x] src/content/docs/getting-started/planning.md

### guides/blueprints/dns-and-reverse-proxy
- [x] src/content/docs/guides/blueprints/dns-and-reverse-proxy/index.mdx

### guides/blueprints/docker-swarm
- [x] src/content/docs/guides/blueprints/docker-swarm/application-deployment.md
- [x] src/content/docs/guides/blueprints/docker-swarm/architecture.md
- [x] src/content/docs/guides/blueprints/docker-swarm/backup-and-recovery.md
- [x] src/content/docs/guides/blueprints/docker-swarm/index.md
- [x] src/content/docs/guides/blueprints/docker-swarm/managers-and-workers.md
- [x] src/content/docs/guides/blueprints/docker-swarm/networking.md
- [x] src/content/docs/guides/blueprints/docker-swarm/persistent-data.md
- [x] src/content/docs/guides/blueprints/docker-swarm/secrets-and-configs.md
- [x] src/content/docs/guides/blueprints/docker-swarm/updates-and-rollbacks.md

### guides/blueprints/k3s-multinode
- [x] src/content/docs/guides/blueprints/k3s-multinode/additional-servers.mdx
- [x] src/content/docs/guides/blueprints/k3s-multinode/agents.mdx
- [x] src/content/docs/guides/blueprints/k3s-multinode/api-endpoint.mdx
- [x] src/content/docs/guides/blueprints/k3s-multinode/architecture.mdx
- [x] src/content/docs/guides/blueprints/k3s-multinode/failure-and-recovery.mdx
- [x] src/content/docs/guides/blueprints/k3s-multinode/first-server.mdx
- [x] src/content/docs/guides/blueprints/k3s-multinode/index.mdx
- [x] src/content/docs/guides/blueprints/k3s-multinode/network-requirements.mdx
- [x] src/content/docs/guides/blueprints/k3s-multinode/node-maintenance.mdx
- [x] src/content/docs/guides/blueprints/k3s-multinode/topologies.mdx
- [x] src/content/docs/guides/blueprints/k3s-multinode/validation.mdx

### guides/blueprints/k3s-single-node-gitops
- [x] src/content/docs/guides/blueprints/k3s-single-node-gitops/architecture.md
- [x] src/content/docs/guides/blueprints/k3s-single-node-gitops/backup-and-recovery.md
- [x] src/content/docs/guides/blueprints/k3s-single-node-gitops/implementation.md
- [x] src/content/docs/guides/blueprints/k3s-single-node-gitops/index.md
- [x] src/content/docs/guides/blueprints/k3s-single-node-gitops/limitations.md
- [x] src/content/docs/guides/blueprints/k3s-single-node-gitops/operations.md
- [x] src/content/docs/guides/blueprints/k3s-single-node-gitops/prerequisites.md
- [x] src/content/docs/guides/blueprints/k3s-single-node-gitops/templates.md
- [x] src/content/docs/guides/blueprints/k3s-single-node-gitops/validation.md
- [x] src/content/docs/guides/blueprints/k3s-single-node-gitops/variables.md

### guides/tasks/backup
- [x] src/content/docs/guides/tasks/backup/install-velero.md
- [x] src/content/docs/guides/tasks/backup/velero-complete-setup.md

### guides/tasks/certificates
- [x] src/content/docs/guides/tasks/certificates/create-acme-clusterissuer.md
- [x] src/content/docs/guides/tasks/certificates/install-cert-manager.mdx

### guides/tasks/databases
- [x] src/content/docs/guides/tasks/databases/access-postgresql-with-gui-client.md
- [x] src/content/docs/guides/tasks/databases/configure-application-credentials.md
- [x] src/content/docs/guides/tasks/databases/configure-postgresql-backups.md
- [x] src/content/docs/guides/tasks/databases/create-postgresql-cluster.md
- [x] src/content/docs/guides/tasks/databases/expose-postgresql-for-administration.md
- [x] src/content/docs/guides/tasks/databases/install-cloudnative-pg-operator.md
- [x] src/content/docs/guides/tasks/databases/restore-postgresql-cluster.md

### guides/tasks/gitops
- [x] src/content/docs/guides/tasks/gitops/access-argocd.md
- [x] src/content/docs/guides/tasks/gitops/bootstrap-gitops.mdx
- [x] src/content/docs/guides/tasks/gitops/connect-git-repository.md
- [x] src/content/docs/guides/tasks/gitops/create-root-application.md
- [x] src/content/docs/guides/tasks/gitops/install-argocd.mdx
- [x] src/content/docs/guides/tasks/gitops/structure-gitops-repository.md

### guides/tasks/host
- [x] src/content/docs/guides/tasks/host/configure-automatic-security-updates.md
- [x] src/content/docs/guides/tasks/host/configure-dns.md
- [x] src/content/docs/guides/tasks/host/configure-fail2ban.md
- [x] src/content/docs/guides/tasks/host/configure-firewalld.md
- [x] src/content/docs/guides/tasks/host/configure-hostname.md
- [x] src/content/docs/guides/tasks/host/configure-persistent-journal.md
- [x] src/content/docs/guides/tasks/host/configure-time-synchronization.md
- [x] src/content/docs/guides/tasks/host/configure-ufw.mdx
- [x] src/content/docs/guides/tasks/host/disable-unnecessary-services.md
- [x] src/content/docs/guides/tasks/host/harden-ssh.mdx
- [x] src/content/docs/guides/tasks/host/prepare-debian-server.md
- [x] src/content/docs/guides/tasks/host/validate-host-requirements.md

### guides/tasks/kubernetes
- [x] src/content/docs/guides/tasks/kubernetes/configure-k3s-firewall-rules.mdx
- [x] src/content/docs/guides/tasks/kubernetes/configure-k3s-server-options.md
- [x] src/content/docs/guides/tasks/kubernetes/configure-kubeconfig.md
- [x] src/content/docs/guides/tasks/kubernetes/configure-rbac.mdx
- [x] src/content/docs/guides/tasks/kubernetes/configure-tls-san.md
- [x] src/content/docs/guides/tasks/kubernetes/install-first-k3s-server.mdx
- [x] src/content/docs/guides/tasks/kubernetes/join-k3s-agent.mdx
- [x] src/content/docs/guides/tasks/kubernetes/join-k3s-server.mdx
- [x] src/content/docs/guides/tasks/kubernetes/remove-k3s-node.md
- [x] src/content/docs/guides/tasks/kubernetes/uninstall-k3s.md
- [x] src/content/docs/guides/tasks/kubernetes/validate-k3s-cluster.md

### guides/tasks/networking
- [x] src/content/docs/guides/tasks/networking/configure-network-policies.mdx
- [x] src/content/docs/guides/tasks/networking/configure-traefik-gateway-api.mdx
- [x] src/content/docs/guides/tasks/networking/coredns-local-reverse-proxy.md
- [x] src/content/docs/guides/tasks/networking/setup-coredns-internal.mdx
- [x] src/content/docs/guides/tasks/networking/setup-reverse-proxy-localhost.mdx

### guides/tasks/observability
- [x] src/content/docs/guides/tasks/observability/collect-logs-with-alloy.md
- [x] src/content/docs/guides/tasks/observability/configure-alertmanager.md
- [x] src/content/docs/guides/tasks/observability/configure-external-availability-monitoring.md
- [x] src/content/docs/guides/tasks/observability/configure-pod-monitor.md
- [x] src/content/docs/guides/tasks/observability/configure-service-monitor.md
- [x] src/content/docs/guides/tasks/observability/expose-traefik-metrics.md
- [x] src/content/docs/guides/tasks/observability/install-loki.md
- [x] src/content/docs/guides/tasks/observability/install-prometheus-stack.md
- [x] src/content/docs/guides/tasks/observability/monitor-cloudnative-pg.md
- [x] src/content/docs/guides/tasks/observability/monitor-k3s-nodes.md
- [x] src/content/docs/guides/tasks/observability/monitor-longhorn.md

### guides/tasks/secrets
- [x] src/content/docs/guides/tasks/secrets/bootstrap-secret-management.mdx
- [x] src/content/docs/guides/tasks/secrets/configure-cloudflare-token.mdx
- [x] src/content/docs/guides/tasks/secrets/configure-openbao-auto-unseal.mdx
- [x] src/content/docs/guides/tasks/secrets/configure-openbao-high-availability.mdx
- [x] src/content/docs/guides/tasks/secrets/configure-sops-with-age.mdx
- [x] src/content/docs/guides/tasks/secrets/create-kubernetes-secret.mdx
- [x] src/content/docs/guides/tasks/secrets/install-external-secrets-operator.mdx
- [x] src/content/docs/guides/tasks/secrets/install-infisical.mdx
- [x] src/content/docs/guides/tasks/secrets/install-openbao.mdx
- [x] src/content/docs/guides/tasks/secrets/install-sealed-secrets.mdx
- [x] src/content/docs/guides/tasks/secrets/openbao-advanced-ha.md
- [x] src/content/docs/guides/tasks/secrets/rotate-application-secret.mdx
- [x] src/content/docs/guides/tasks/secrets/use-sops-with-argocd.mdx

### guides/tasks/storage
- [x] src/content/docs/guides/tasks/storage/configure-longhorn-node.md
- [x] src/content/docs/guides/tasks/storage/configure-volume-backup.md
- [x] src/content/docs/guides/tasks/storage/create-filesystem-and-mount.md
- [x] src/content/docs/guides/tasks/storage/create-storage-class.md
- [x] src/content/docs/guides/tasks/storage/expand-persistent-volume.md
- [x] src/content/docs/guides/tasks/storage/install-longhorn.mdx
- [x] src/content/docs/guides/tasks/storage/prepare-host-disk.md
- [x] src/content/docs/guides/tasks/storage/restore-volume-backup.md

### (raiz)
- [x] src/content/docs/index.mdx

### learn/backups
- [x] src/content/docs/learn/backups/backup-fundamentals.md
- [x] src/content/docs/learn/backups/cluster-state-vs-application-data.md
- [x] src/content/docs/learn/backups/off-cluster-backups.md
- [x] src/content/docs/learn/backups/restore-testing.md
- [x] src/content/docs/learn/backups/retention-strategies.md
- [x] src/content/docs/learn/backups/rpo-and-rto.md

### learn/backup
- [x] src/content/docs/learn/backup/velero-overview.md

### learn/clusters
- [x] src/content/docs/learn/clusters/advanced-ha.md
- [x] src/content/docs/learn/clusters/docker-compose-vs-swarm-vs-kubernetes.md
- [x] src/content/docs/learn/clusters/docker-swarm-vs-kubernetes.md
- [x] src/content/docs/learn/clusters/eks-overview.md
- [x] src/content/docs/learn/clusters/embedded-vs-external-datastore.mdx
- [x] src/content/docs/learn/clusters/k3s-architecture.mdx
- [x] src/content/docs/learn/clusters/kine-overview.md
- [x] src/content/docs/learn/clusters/kubernetes-distributions.md
- [x] src/content/docs/learn/clusters/kubernetes.mdx
- [x] src/content/docs/learn/clusters/managed-vs-selfhosted.md
- [x] src/content/docs/learn/clusters/quorum.mdx
- [x] src/content/docs/learn/clusters/rke2-vs-k3s.md

### learn/containers
- [x] src/content/docs/learn/containers/image-lifecycle.md

### learn/infrastructure
- [x] src/content/docs/learn/infrastructure/iac-overview.md

### learn/networking
- [x] src/content/docs/learn/networking/cilium-vs-calico.md

### learn/networking/firewalls
- [x] src/content/docs/learn/networking/firewalls/docker-published-ports.mdx
- [x] src/content/docs/learn/networking/firewalls/firewalld.mdx
- [x] src/content/docs/learn/networking/firewalls/linux-firewall-fundamentals.mdx
- [x] src/content/docs/learn/networking/firewalls/ufw.mdx
- [x] src/content/docs/learn/networking/firewalls/ufw-vs-firewalld.mdx

### learn/networking
- [x] src/content/docs/learn/networking/reverse-proxy-basics.mdx
- [x] src/content/docs/learn/networking/service-mesh-overview.md
- [x] src/content/docs/learn/networking/split-horizon-dns.mdx

### learn/observability
- [x] src/content/docs/learn/observability/alerting.md
- [x] src/content/docs/learn/observability/application-health.md
- [x] src/content/docs/learn/observability/blackbox-vs-whitebox-monitoring.md
- [x] src/content/docs/learn/observability/distributed-tracing.md
- [x] src/content/docs/learn/observability/logs-and-metrics.md
- [x] src/content/docs/learn/observability/metrics-logs-and-traces.md
- [x] src/content/docs/learn/observability/observability-for-small-clusters.md
- [x] src/content/docs/learn/observability/prometheus-architecture.md
- [x] src/content/docs/learn/observability/retention.md

### learn/secrets-management
- [x] src/content/docs/learn/secrets-management/bootstrap-problem.mdx
- [x] src/content/docs/learn/secrets-management/encryption-vs-secret-store.mdx
- [x] src/content/docs/learn/secrets-management/external-secrets.mdx
- [x] src/content/docs/learn/secrets-management/openbao-and-vault.mdx
- [x] src/content/docs/learn/secrets-management/openbao-auto-unseal.mdx
- [x] src/content/docs/learn/secrets-management/openbao-high-availability.mdx
- [x] src/content/docs/learn/secrets-management/overview.mdx
- [x] src/content/docs/learn/secrets-management/recovery-strategies.mdx
- [x] src/content/docs/learn/secrets-management/secret-rotation.mdx
- [x] src/content/docs/learn/secrets-management/secrets-in-git.mdx
- [x] src/content/docs/learn/secrets-management/sops-vs-sealed-secrets.mdx

### learn/security
- [x] src/content/docs/learn/security/policy-enforcement.md

### learn/storage
- [x] src/content/docs/learn/storage/database-storage.md
- [x] src/content/docs/learn/storage/kubernetes-storage-model.md
- [x] src/content/docs/learn/storage/local-vs-distributed-storage.md
- [x] src/content/docs/learn/storage/longhorn-overview.md
- [x] src/content/docs/learn/storage/persistent-volumes.md
- [x] src/content/docs/learn/storage/replication-is-not-backup.md

### learn/tools
- [x] src/content/docs/learn/tools/visual-management.md

### operations/backups
- [x] src/content/docs/operations/backups/backup-and-recovery.md
- [x] src/content/docs/operations/backups/backup-gitops-bootstrap-data.md
- [x] src/content/docs/operations/backups/backup-k3s-etcd.md
- [x] src/content/docs/operations/backups/backup-kubernetes-resources.md
- [x] src/content/docs/operations/backups/backup-longhorn-volumes.md
- [x] src/content/docs/operations/backups/backup-postgresql.md
- [x] src/content/docs/operations/backups/protect-age-keys.md
- [x] src/content/docs/operations/backups/setup-velero-backups.md
- [x] src/content/docs/operations/backups/validate-backups.md

### operations/checklists
- [x] src/content/docs/operations/checklists/application-readiness.md
- [x] src/content/docs/operations/checklists/automated-validation.md
- [x] src/content/docs/operations/checklists/backup-readiness.md
- [x] src/content/docs/operations/checklists/cluster-operational-checklist.md
- [x] src/content/docs/operations/checklists/cluster-security.md
- [x] src/content/docs/operations/checklists/disaster-recovery-readiness.md
- [x] src/content/docs/operations/checklists/host-security.md
- [x] src/content/docs/operations/checklists/observability-readiness.md
- [x] src/content/docs/operations/checklists/post-install-checklist.md
- [x] src/content/docs/operations/checklists/production-readiness.md
- [x] src/content/docs/operations/checklists/upgrade-readiness.md

### operations/disaster-recovery
- [x] src/content/docs/operations/disaster-recovery/multinode-scenarios.mdx
- [x] src/content/docs/operations/disaster-recovery/rebuild-single-node-cluster.mdx
- [x] src/content/docs/operations/disaster-recovery/recover-secret-management.mdx
- [x] src/content/docs/operations/disaster-recovery/restore-k3s-etcd.mdx
- [x] src/content/docs/operations/disaster-recovery/restore-longhorn-volume.mdx
- [x] src/content/docs/operations/disaster-recovery/restore-postgresql.mdx

### operations/maintenance
- [x] src/content/docs/operations/maintenance/certificate-review.md
- [x] src/content/docs/operations/maintenance/disk-capacity-review.md
- [x] src/content/docs/operations/maintenance/drain-and-uncordon-node.md
- [x] src/content/docs/operations/maintenance/k3s-cluster-maintenance.md
- [x] src/content/docs/operations/maintenance/maintenance-runbook.md
- [x] src/content/docs/operations/maintenance/node-maintenance.md

### operations/observability
- [x] src/content/docs/operations/observability/observability-and-alerting.md

### operations/troubleshooting
- [x] src/content/docs/operations/troubleshooting/argocd-out-of-sync.md
- [x] src/content/docs/operations/troubleshooting/certificate-not-ready.md
- [x] src/content/docs/operations/troubleshooting/node-not-ready.md
- [x] src/content/docs/operations/troubleshooting/pod-pending.md

### operations/upgrades
- [x] src/content/docs/operations/upgrades/upgrade-k3s-multinode.mdx
- [x] src/content/docs/operations/upgrades/upgrade-k3s-single-node.mdx

### project
- [x] src/content/docs/project/content-policy.md
- [x] src/content/docs/project/decisions.md
- [x] src/content/docs/project/disclaimer.md

### project/experiments
- [x] src/content/docs/project/experiments/cmcli.md

### project
- [x] src/content/docs/project/scope.md

### reference
- [x] src/content/docs/reference/conventions.md

### resources
- [x] src/content/docs/resources/index.md

### technologies
- [x] src/content/docs/technologies/index.md

### toolbox/commands
- [x] src/content/docs/toolbox/commands/certificates.md
- [x] src/content/docs/toolbox/commands/containers.md
- [x] src/content/docs/toolbox/commands/dns.md
- [x] src/content/docs/toolbox/commands/filesystems.md
- [x] src/content/docs/toolbox/commands/git.md
- [x] src/content/docs/toolbox/commands/index.md
- [x] src/content/docs/toolbox/commands/kubernetes.md
- [x] src/content/docs/toolbox/commands/networking.md
- [x] src/content/docs/toolbox/commands/processes.md
- [x] src/content/docs/toolbox/commands/random-values.md
- [x] src/content/docs/toolbox/commands/systemd.md
- [x] src/content/docs/toolbox/commands/troubleshooting.md

### toolbox/snippets
- [x] src/content/docs/toolbox/snippets/bash.md
- [x] src/content/docs/toolbox/snippets/docker-compose.md
- [x] src/content/docs/toolbox/snippets/index.md
- [x] src/content/docs/toolbox/snippets/kubernetes.md

### toolbox/tools/automation
- [x] src/content/docs/toolbox/tools/automation/index.md

### toolbox/tools/container-management
- [x] src/content/docs/toolbox/tools/container-management/index.md

### toolbox/tools/database-clients
- [x] src/content/docs/toolbox/tools/database-clients/db-tools.md
- [x] src/content/docs/toolbox/tools/database-clients/index.md

### toolbox/tools/file-explorers
- [x] src/content/docs/toolbox/tools/file-explorers/index.md

### toolbox/tools/file-transfer
- [x] src/content/docs/toolbox/tools/file-transfer/index.md
- [x] src/content/docs/toolbox/tools/file-transfer/transfer-tools.md

### toolbox/tools/host-management
- [x] src/content/docs/toolbox/tools/host-management/cluster-tools.md
- [x] src/content/docs/toolbox/tools/host-management/index.md

### toolbox/tools/kubernetes-management
- [x] src/content/docs/toolbox/tools/kubernetes-management/command-line-tools.mdx

### toolbox/tools/networking
- [x] src/content/docs/toolbox/tools/networking/index.md

### toolbox/tools/observability
- [x] src/content/docs/toolbox/tools/observability/index.md

### toolbox/tools
- [x] src/content/docs/toolbox/tools/overview.md

### toolbox/tools/remote-access
- [x] src/content/docs/toolbox/tools/remote-access/index.md
- [x] src/content/docs/toolbox/tools/remote-access/ssh-clients.md

### toolbox/tools/security
- [x] src/content/docs/toolbox/tools/security/index.md

### toolbox/tools/troubleshooting
- [x] src/content/docs/toolbox/tools/troubleshooting/index.md

## Pendências

- `src/content/docs/toolbox/tools/kubernetes-management/command-line-tools.mdx`: bug técnico grave
  encontrado e corrigido. As seções de kubectl, Helm e Argo CD CLI instruíam o leitor a rodar
  `curl ... https://raw.githubusercontent.com/guesant/infrastructure-and-cluster-notebook/.../scripts/install/{kubectl,helm,argocd}.sh | bash -`,
  mas o diretório `scripts/install/` **não existe neste repositório** (confirmado por `find` direto
  no `src/scripts/`; só existe `src/scripts/*.sh` na raiz, sem subdiretório `install/`, e nenhum
  desses arquivos instala kubectl/Helm/argocd CLI). Qualquer leitor que executasse esses comandos
  receberia um 404 do GitHub. Substituí pelos métodos oficiais reais de cada ferramenta: kubectl via
  download de binário + verificação de checksum SHA-256 contra `dl.k8s.io` (documentação oficial já
  citada na página); Helm via `get-helm-3`, o script oficial mantido pelo próprio projeto Helm,
  com `DESIRED_VERSION` fixável; Argo CD CLI via download direto do binário nas releases oficiais do
  GitHub do projeto. Não fixei números de versão específicos para Helm/argocd (usei placeholders
  `<versão>`), já que não há acesso à rede nesta sessão para confirmar as versões estáveis atuais;
  para kubectl, mantive a opção de usar `stable.txt` (comportamento já descrito no texto original)
  com uma nota explicando como fixar uma versão específica em vez disso. Também corrigidos os
  fences ```yaml que continham bash, para ```bash.
  **Atualização (pesquisa de rede autorizada):** o Helm v4 tornou-se a série estável e o v3 entrou
  em modo de manutenção; o script de instalação foi trocado de `get-helm-3` para `get-helm-4`,
  com uma nota explicando a mudança de série. As versões placeholder de Helm e Argo CD CLI foram
  preenchidas com o padrão "até a escrita, é X; confira o changelog" (Helm `v4.2.3`, Argo CD CLI
  `v3.4.5`), conforme preferência registrada pelo usuário para não fixar números sem esse aviso.
- `src/content/docs/toolbox/tools/host-management/cluster-tools.md`: página duplicava quase
  integralmente `learn/tools/visual-management.md` (k9s, Lens, Rancher, Portainer, Headlamp), com
  informação pior e desatualizada. Corrigido: reescrita como o companheiro de instalação rápida,
  cross-referenciando a página `learn/` para a comparação conceitual em vez de repeti-la. Bugs reais
  corrigidos: comando do Headlamp usava `ghcr.io/kinvolk/headlamp:latest`, organização desatualizada
  (o projeto foi doado à CNCF e vive sob `kubernetes-sigs`, não mais sob o nome do mantenedor
  original) e tag flutuante `latest`; trocado por instalação via Helm com `--version` a preencher,
  igual ao padrão já usado no restante do notebook. Comando do Portainer montava
  `/var/run/docker.sock` sem nenhum aviso de que isso concede controle equivalente a root sobre o
  host; adicionada nota de segurança explícita, porta restrita a `127.0.0.1` e tag da imagem
  fixada (como placeholder a preencher, não inventei uma versão). Comando do Rancher não fixava a
  versão do chart; corrigido para exigir `--version` explícito. Mantida a mesma ressalva sobre
  licenciamento incerto do Lens já registrada na página `learn/` correspondente, sem repetir os
  detalhes, só linkando para lá.
  **Atualização (pesquisa de rede autorizada):** versões placeholder preenchidas no padrão "até a
  escrita, é X; confira o changelog": Rancher chart `2.14.3`, Portainer CE `2.39.5` (LTS), Headlamp
  chart `0.43.0`.
- `src/content/docs/toolbox/tools/file-transfer/transfer-tools.md`: bug técnico real corrigido. O
  texto original descrevia `rsync -avz --delete ...` como "Bidirecional (cuidado!)", mas rsync é,
  por natureza, uma ferramenta unidirecional; `--delete` apenas faz o destino espelhar exatamente a
  origem (removendo lá o que não existe mais aqui), sem sincronizar mudanças feitas no destino de
  volta para a origem. Corrigido para explicar o comportamento real e apontar Unison ou
  `rclone bisync` como caminhos para sincronização genuinamente bidirecional. Também: a seção
  "FTP/SFTP via navegador" descrevia o FileZilla, que é um cliente desktop, não algo acessado pelo
  navegador — cabeçalho corrigido. O exemplo do MinIO Client usava as credenciais padrão reais e
  publicamente conhecidas do MinIO (`minioadmin`/`minioadmin`) sem aviso; substituídas por
  placeholders com uma nota explícita para nunca usar essas credenciais fora de um ambiente de teste
  isolado. Removida a referência vaga a um cliente "Commander (Norton Commander-style)" não
  identificável/verificável.
- `src/content/docs/toolbox/tools/database-clients/db-tools.md`: bug técnico real corrigido. O
  exemplo `docker run -p 80:80 dpage/pgadmin4` estava incompleto: a imagem oficial do pgAdmin exige
  `PGADMIN_DEFAULT_EMAIL` e `PGADMIN_DEFAULT_PASSWORD` definidos como variáveis de ambiente, sem
  elas o container não inicia; o texto original ainda documentava credenciais padrão fixas
  (`admin@pgadmin.org` / `admin`) que não correspondem ao comportamento real da imagem. Corrigido
  para um comando funcional com as variáveis obrigatórias, publicando a porta só em `127.0.0.1` por
  padrão (consistente com a prática de segurança já usada no resto do notebook para interfaces
  administrativas). Também removido um preço específico da DataGrip (~$200/ano) que tende a ficar
  desatualizado; substituído por um link para a página oficial de preços. A página duplicava
  parcialmente `guides/tasks/databases/access-postgresql-with-gui-client.md` (já revisada); agora
  cross-referencia essa página para a conexão específica ao PostgreSQL deste notebook, em vez de
  repetir dados de conexão genéricos.
- `src/content/docs/toolbox/snippets/*`: as 4 páginas foram reescritas. Bug técnico real encontrado
  em `docker-compose.md`: o exemplo "Com volume" declarava `volumes: app_cache:` (o volume nomeado)
  aninhado *dentro* do serviço `app`, duplicando a chave `volumes:` já usada para os mounts do
  serviço; a declaração de volume nomeado precisa estar no nível raiz do arquivo, como irmã de
  `services:`. Corrigido. Em `kubernetes.md`, vários exemplos (ConfigMap, Secret, PVC) mostravam um
  segundo bloco YAML com `...` e campos soltos como se fosse um manifesto completo; adicionei um
  comentário explícito "(excerto, não um manifesto completo)" em cada um, conforme a regra do guia
  editorial de deixar claro quando um exemplo é parcial. Também substituí o snippet de `Ingress`
  clássico por um de `HTTPRoute` (Gateway API), já que este notebook usa Gateway API como padrão
  documentado (`guides/tasks/networking/configure-traefik-gateway-api.mdx`), mantendo uma nota
  explicando que `Ingress` continua válido para outros clusters, só não é o caminho documentado
  aqui. `index.md` tinha uma lista de 12 categorias como bullets em bold sem links (não eram links
  quebrados, só texto), das quais 9 nunca foram escritas; reescrito no mesmo padrão adotado em
  `toolbox/commands/index.md`: links reais para as 3 categorias existentes, lista em prosa (sem
  link) para as 9 planejadas. Todos os anchors novos entre páginas foram conferidos contra o HTML
  gerado pelo build.
- `src/content/docs/toolbox/commands/*`: lote grande (12 páginas) reescrito por completo. Além de
  travessão como pontuação e mistura de português/inglês em quase todo recipe, encontrei bugs
  técnicos reais: `networking.md` documentava `ping -w 5000` como "5 segundos", mas a flag `-w` do
  `ping` (iputils/Linux) define um prazo total em **segundos**, não milissegundos — o exemplo
  original configuraria um prazo de 5000 segundos (~83 minutos), não 5 segundos; corrigido para
  `ping -w 5`. `processes.md` tinha dois trechos corrompidos/sem sentido ("Atman (melhor
  interface)" como comentário acima de `htop`, e "Ódios: parent morreu, init adotou" na seção de
  zumbis, claramente devendo ser "Órfãos"); corrigidos. `systemd.md` e `troubleshooting.md` tinham
  vários cabeçalhos `**Relacionado:**` vazios (sem nenhum link ou conteúdo abaixo, seguidos
  imediatamente por `---`); removidos.
  `index.md` tinha dois problemas de link reais: os links de "Por categoria" usavam caminhos
  absolutos (`/toolbox/commands/...`) sem o `base` do site (`/infrastructure-and-cluster-notebook`),
  o que os deixava quebrados em produção (confirmado inspecionando o HTML gerado); corrigidos para
  links relativos. Cinco categorias linkadas (`cryptography`, `firewalls`, `disks-and-volumes`,
  `logs`, `helm`) nunca foram escritas como páginas — confirmado por `ls` no diretório e por
  referência ao plano de conteúdo interno (`.todo/phase-7-toolbox.md`, que lista essas mesmas
  páginas como parte do escopo da Fase 7, ainda não implementado); removidos os links quebrados e
  listadas essas categorias como planejadas, sem link, em vez de apontar para páginas inexistentes.
  Todos os anchors internos adicionados entre as páginas (`#criar-chave-ssh`,
  `#testar-resolução-dns-interna-do-k3s`) foram conferidos contra o HTML gerado pelo build, não
  apenas presumidos a partir do título.
- `src/content/docs/project/scope.md`: a página estava desatualizada de forma factual, não apenas
  estilística. Ela afirmava que "conteúdo sobre Docker e Docker Swarm está planejado, mas ainda não
  foi escrito", mas `guides/blueprints/docker-swarm/` já existe como um blueprint completo de 9
  páginas (já revisado em lote anterior deste processo editorial); movido da seção "fora do escopo"
  para "o que este projeto cobre hoje". Também afirmava que o notebook "ainda não cobre" RKE2,
  kubeadm, EKS, GKE ou AKS, mas `learn/clusters/rke2-vs-k3s.md`, `learn/clusters/eks-overview.md` e
  `learn/clusters/managed-vs-selfhosted.md` já existem (cobertura conceitual/comparativa); reescrito
  para refletir com precisão que existe cobertura conceitual em `learn/`, mas nenhum blueprint
  operacional completo equivalente ao de K3s para essas alternativas. Verificado por inspeção direta
  dos diretórios, não por suposição.
- `src/content/docs/project/decisions.md`: a decisão de migração de diretórios (2026-07-18) descrevia
  a migração como trabalho futuro ("até essa migração ser concluída..."), mas a árvore atual de
  `src/content/docs/` já corresponde integralmente à estrutura alvo (confirmado por inspeção direta
  do diretório). Atualizado com uma seção "Estado atual" registrando a conclusão, sem alterar o
  registro histórico da decisão original. Também confirmado que `toolbox/scripts/` e `toolbox/labs/`,
  previstos na árvore alvo original, nunca foram criados como seções do site; scripts vivem em
  `src/scripts/` e são incorporados via `ScriptHelper`/`FileWriter`. O mesmo ajuste foi refletido em
  `content-policy.md` (a linha sobre `toolbox/` citava `scripts/` como subseção, o que não existe).
- ~~`src/content/docs/project/disclaimer.md`~~: resolvido. O aviso citava "especificamente o
  ChatGPT" como a ferramenta de IA usada, desatualizado já que a própria revisão editorial usa
  Claude. Por decisão explícita do usuário, o texto não nomeia nenhuma ferramenta específica;
  usa apenas "assistentes de inteligência artificial" de forma genérica.
- `src/content/docs/operations/upgrades/upgrade-k3s-multinode.mdx`: reescrito por completo (era o
  único arquivo do lote `operations/upgrades`; `upgrade-k3s-single-node.mdx` já estava excelente e
  não precisou de edição). Problemas do original: blocos ```yaml contendo bash; emoji ✅/❌; script de
  automação de ~60 linhas inventado e colado inline em vez de reaproveitar os scripts já existentes
  do projeto (`src/scripts/upgrade-k3s-server.sh`, `upgrade-k3s-agent.sh`,
  `cordon-and-drain-node.sh`); afirmação simplificada demais de que "K3s suporta até 1 versão de
  diferença entre componentes", substituída por referência direta à Kubernetes Version Skew Policy
  (já citada em `maintenance-runbook.md`); troubleshooting de "quorum quebrado" original sugeria SSH
  manual e reinstalar uma versão anterior em um único servidor como solução, o que pode piorar uma
  perda de quorum real; substituído por um apontamento para o procedimento correto de restauração via
  `disaster-recovery/multinode-scenarios.mdx#perda-de-quorum-crítico` (já revisado em lote anterior).
  A página agora usa os componentes `ScriptHelper` com os scripts reais do projeto, no mesmo padrão já
  usado por `upgrade-k3s-single-node.mdx` e por `drain-and-uncordon-node.md`.
- `src/content/docs/operations/disaster-recovery/multinode-scenarios.mdx`: reescrito por completo
  (era o único arquivo do lote `operations/disaster-recovery` fora do padrão editorial; os outros
  cinco já estavam em ótima forma). Problemas do original: blocos de comando marcados como ```yaml
  contendo shell/bash; emoji ✅/❌ em tabela; checklist final em pseudo-YAML com `☐`; ausência de
  callouts "Executar em"; duplicava, em versão pior, o conteúdo já bem escrito em
  `guides/blueprints/k3s-multinode/failure-and-recovery.mdx` (que a própria página já linkava como
  "mais detalhes estão em"). Reescrita como runbook de resposta rápida que aponta para o blueprint em
  vez de duplicar as explicações e os comandos completos, seguindo o mesmo padrão já usado por
  `restore-longhorn-volume.mdx` e `restore-postgresql.mdx` neste mesmo diretório. Também alinhado o
  numero e o escopo dos cenários ao blueprint (a versão antiga tinha um "Cenário 5: Corrupção de
  etcd" que não existe no blueprint e faltava o "Cenário 4: Recuperação de datastore externo" que
  existe lá); corrupção de etcd foi tratada como o mesmo caminho de recuperação da perda de quorum,
  já que usa o mesmo procedimento de restauração por snapshot.
- `src/content/docs/operations/checklists/automated-validation.md`: reescrito por completo (era o
  único arquivo do lote `operations/checklists` fora do padrão editorial já estabelecido nos demais).
  Corrigido um link quebrado real: `[quality-criteria.md](../../../project/quality-criteria/)` apontava
  para uma página que nunca foi publicada em `src/content/docs/project/` (o arquivo correspondente
  existe apenas como nota interna de planejamento em `.todo/quality-criteria.md`, fora do conteúdo
  publicado); a referência foi removida. Também corrigido o link para
  `check-cluster-health.sh`, que apontava para `../../../scripts/check-cluster-health.sh` (rota
  inexistente dentro de `src/content/docs/`, já que o script vive em `src/scripts/` e não é copiado
  para o site publicado); substituído por um link direto ao arquivo no repositório GitHub. As demais
  afirmações técnicas da página (formato do JSON de saída, checks cobertos, jobs do workflow de CI)
  foram conferidas contra `src/scripts/check-cluster-health.sh` e `.github/workflows/scripts.yml`
  diretamente e estavam corretas.
- `src/content/docs/operations/backups/setup-velero-backups.md`: reescrito por completo (era o único
  arquivo do lote `operations/backups` com problemas técnicos reais, não apenas de estilo). Corrigidos:
  cron de 6 campos inválido (`0 4 0 * * 0`) trocado por sintaxe de 5 campos; afirmação de que
  `--include-namespaces`/`--exclude-namespaces` aceitam glob (`prod-*`) removida, pois o Velero exige
  nomes exatos de namespace (substituído por exemplo com `--selector` de label); hooks de backup que
  o texto original declarava dentro de `BackupStorageLocation` foram corrigidos para o local correto
  (anotações no Pod), já que `BackupStorageLocation` descreve apenas o destino do backup, não hooks; o
  exemplo original de hook usava `pg_dump` manual sobre um banco CloudNativePG, redundante e
  potencialmente inconsistente com o backup nativo do operator já documentado em
  `backup-postgresql.md` — trocado por uma recomendação de usar o mecanismo nativo do operator. Não foi
  possível confirmar nesta sessão (sem rede) os nomes exatos das métricas Prometheus expostas pelo
  Velero v1.18 nem a chave Helm correta para habilitar o node-agent/fs-backup na versão do chart que o
  projeto viria a adotar; o texto evita agora afirmar esses nomes como fato e orienta a conferir contra
  a versão instalada antes de escrever regras de alerta. Como as demais páginas do lote, mantém a
  postura de "Velero como ferramenta a avaliar" já estabelecida em `backup-and-recovery.md`, em vez de
  presumir que Velero já é a escolha definitiva do projeto.
- ~~`src/content/docs/learn/tools/visual-management.md`~~: resolvido. O repositório Helm do Headlamp
  (`https://kubernetes-sigs.github.io/headlamp/`) e a existência do chart `headlamp/headlamp`
  não foram confirmados por acesso direto ao repositório nesta sessão (sem rede habilitada no
  runner); a URL segue o padrão esperado após a doação do projeto à CNCF/kubernetes-sigs, mas
  deve ser validada antes de tratar o comando como copiável sem revisão. Nenhuma versão de
  referência do chart do Headlamp está fixada em `reference/conventions.md`; o texto já orienta
  o leitor a confirmar a versão nas releases do projeto antes de instalar.
  **Atualização (pesquisa de rede autorizada):** confirmado que
  `https://kubernetes-sigs.github.io/headlamp/` é um repositório Helm real com o chart
  `headlamp/headlamp` publicado (versão mais recente `0.43.0` no Artifact Hub, até a escrita).
  Texto atualizado para citar essa versão no padrão "até a escrita, confira o changelog".
- ~~`src/content/docs/guides/tasks/networking/setup-coredns-internal.mdx` e
  `setup-reverse-proxy-localhost.mdx`~~: resolvido neste lote. Os links quebrados para
  `../validate-dns-and-proxy/` foram removidos; cada página já tem sua própria seção de
  Validação, consistente com o que `dns-and-reverse-proxy/index.mdx` já documentava
  ("não existe uma página de validação separada").
- ~~`src/content/docs/guides/blueprints/dns-and-reverse-proxy/index.mdx`~~: resolvido. O
  blueprint usava `.cluster.local` como domínio administrativo de exemplo (`grafana.cluster.local`
  etc.), o mesmo sufixo que o Kubernetes/K3s usa de verdade para resolver Services e Pods via
  plugin `kubernetes` do CoreDNS; declarar uma zona adicional para esse sufixo pode sobrepor esse
  plugin e quebrar a resolução real do cluster. Todos os exemplos e diagramas foram atualizados
  para `.internal` (RFC 9476), alinhando com o que `setup-coredns-internal.mdx` e
  `setup-reverse-proxy-localhost.mdx` já usavam. O parágrafo de segurança que justificava a
  escolha do sufixo foi reescrito para explicar a colisão real com `cluster.local`, em vez de
  tratá-lo como "um domínio arbitrário".
- ~~`src/content/docs/guides/blueprints/k3s-multinode/index.mdx`~~: corrigido neste lote
  (link tinha um `../` a mais; profundidade correta confirmada no HTML gerado).
- ~~`src/content/docs/guides/blueprints/k3s-multinode/first-server.mdx` e `validation.mdx`~~:
  resolvido. O texto original assumia que o etcd do K3s roda como pod em `kube-system` (comandos
  como `kubectl exec ... etcdctl member list` e `k3s check-etcd`), o que não corresponde ao etcd
  embarcado do K3s (roda dentro do processo `k3s`, sem pod dedicado). Em lote anterior isso foi
  suavizado para não afirmar um comando não verificado. **Atualização (pesquisa de rede
  autorizada):** confirmado, contra a wiki oficial do Rancher (mantenedor do K3s) sobre uso de
  `etcdctl` com o etcd embarcado, o comando real de inspeção usando os certificados que o K3s já
  gera em `/var/lib/rancher/k3s/server/tls/etcd/`. `validation.mdx` agora traz o comando completo
  (`etcdctl member list` com `--cacert`/`--cert`/`--key` apontando para esses caminhos) e o
  resultado esperado; `first-server.mdx` aponta para esse comando em vez de repeti-lo.
- ~~`src/content/docs/guides/tasks/backup/install-velero.md` e `velero-complete-setup.md`~~:
  resolvido. Bugs reais corrigidos em lote anterior via documentação oficial (verificado com
  WebFetch): repositório Helm `https://charts.velero.io` não resolve (DNS inexistente), substituído
  por `https://vmware-tanzu.github.io/helm-charts` (oficial); chaves `--set
  configuration.schedules.daily...` estavam com prefixo errado (corrigido para `schedules.daily...`,
  sem `configuration.`); flag `--default-volumes-to-restic` estava desatualizada, substituída por
  `--default-volumes-to-fs-backup`. **Atualização (pesquisa de rede autorizada):** confirmado
  contra o `README.md` e o `values.yaml` reais do chart (`vmware-tanzu/helm-charts`) que
  `backupStorageLocation` é uma lista; a forma achatada (`configuration.backupStorageLocation.bucket`,
  sem índice) estava errada e foi corrigida em todos os `--set` do arquivo para
  `configuration.backupStorageLocation[0].bucket` (e o mesmo para `volumeSnapshotLocation[0]`).
  Também identificado que o backup por sistema de arquivos (`--default-volumes-to-fs-backup`)
  depende do DaemonSet `node-agent`, que o chart não instala por padrão (`deployNodeAgent: false`);
  adicionado o `helm upgrade --set deployNodeAgent=true` que faltava antes do exemplo de uso da
  flag, sem o qual o comando documentado não teria efeito real. A métrica
  `velero_backup_failure_total`, citada no checklist de `velero-complete-setup.md`, foi confirmada
  como um nome real exposto pelo Velero.
- ~~`src/content/docs/learn/secrets-management/openbao-high-availability.mdx`~~: resolvido. O
  texto original listava PostgreSQL, etcd, S3+DynamoDB e MySQL como storage backends do OpenBao
  para HA, além de Consul; em lote anterior isso foi reduzido a Raft e Consul por falta de
  confirmação. **Atualização (pesquisa de rede autorizada):** confirmado contra a documentação
  oficial (`openbao.org/docs/configuration/storage/`) que os backends atualmente documentados são
  Filesystem, In-Memory, Integrated Storage (Raft) e PostgreSQL (este último com suporte a HA).
  Também confirmado que o Consul deixou de ser o backend de armazenamento primário recomendado
  depois que o projeto Consul mudou para uma licença não aprovada pela OSI; hoje ele aparece
  principalmente como coordenador de lock (`ha_storage`) combinado com outro backend de dados, não
  mais como opção padrão de armazenamento. O texto foi corrigido para não apresentar o Consul como
  alternativa equivalente ao Integrated Storage, e passou a linkar a página oficial de storage para
  o leitor conferir o estado atual antes de adotar um backend externo.
