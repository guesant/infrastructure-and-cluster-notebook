# Checklist operacional

[Voltar ao guia principal](../README.md)

Antes de considerar a instalação concluída:

- [ ] O acesso SSH por chave funciona em uma nova sessão.
- [ ] A autenticação SSH por senha foi rejeitada.
- [ ] UFW e Fail2Ban estão ativos e com regras revisadas.
- [ ] Todos os nós K3s estão `Ready` e possuem nomes únicos.
- [ ] O endpoint estável da API funciona a partir dos nós e da estação administrativa.
- [ ] Os CRDs da Gateway API existem e o Traefik não registra erros do provider.
- [ ] Os namespaces isolados possuem deny por padrão, DNS funcional e permissões explícitas testadas para cada fluxo necessário.
- [ ] cert-manager, Longhorn e Argo CD possuem pods saudáveis.
- [ ] A Application `root` e as Applications selecionadas estão sincronizadas e saudáveis no Argo CD.
- [ ] O preflight do Longhorn passa em todos os nós de armazenamento.
- [ ] Um snapshot do etcd foi criado e copiado para fora do cluster.
- [ ] O token do K3s e o kubeconfig administrativo estão protegidos.
- [ ] A Machine Identity do Infisical possui privilégio mínimo, o Secret de bootstrap não está no Git, a rotação foi testada e os recursos de sincronização estão saudáveis.
- [ ] Cada pessoa possui uma identidade individual com validade limitada, RBAC revisado e kubeconfig protegido; o kubeconfig administrativo não é compartilhado.
- [ ] As versões realmente instaladas foram registradas.
- [ ] O procedimento de atualização e recuperação foi testado em homologação.
