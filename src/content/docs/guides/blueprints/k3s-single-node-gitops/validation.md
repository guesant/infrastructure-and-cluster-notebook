---
title: Validação
sidebar:
  order: 7
---

Checklist final depois de concluir a [implementação](../k3s-single-node-gitops/implementation/). Cada item aponta para a validação detalhada na página correspondente; esta página só confirma que o conjunto funciona de ponta a ponta.

## Cluster-base

- [ ] `k3s kubectl get nodes` mostra o nó `Ready`.
- [ ] A checklist de [validar o cluster](../../../guides/tasks/kubernetes/validate-k3s-cluster/#checklist-resumido) está completa.

## Rede e certificados

- [ ] Os CRDs da Gateway API existem (`kubectl get crd gatewayclasses.gateway.networking.k8s.io`).
- [ ] O Traefik está `Running` com o provider `kubernetesGateway` habilitado.
- [ ] O `ClusterIssuer` ACME está `READY: True`.
- [ ] Um `Certificate` de teste referenciando o `ClusterIssuer` foi emitido com sucesso e removido depois do teste.

## GitOps

- [ ] A Application `root` está `Synced`/`Healthy`.
- [ ] Todas as Applications habilitadas em `gitops/applications/` estão `Synced`/`Healthy`.
- [ ] Nenhuma Application está com `prune: true` sem revisão explícita do risco de exclusão.

## Ponta a ponta

Publique um serviço de teste através do Gateway configurado e confirme:

> **Executar em:** estação administrativa com `KUBECONFIG` e acesso à API.

```bash
kubectl run smoke-test --image=nginx:1.29 --port=80 --restart=Never
kubectl expose pod smoke-test --port=80 --target-port=80
```yaml

Crie um `HTTPRoute` de teste apontando para o Service `smoke-test`, associado a um `Gateway` com listener TLS referenciando o `ClusterIssuer`. Acesse pelo hostname configurado e confirme que o certificado é válido e emitido pela cadeia esperada (Let's Encrypt).

Remova os recursos de teste depois de validar:

```bash
kubectl delete pod smoke-test
kubectl delete service smoke-test
```yaml

## Checkpoint final

Todos os itens acima estão marcados. O cluster está pronto para o [guia de operação contínua](../../../operations/checklists/cluster-operational-checklist/) e para a [validação pós-instalação](../../../operations/checklists/post-install-checklist/), que cobre também os módulos opcionais habilitados.

## Fontes e leitura adicional

- [cert-manager com Gateway API](https://cert-manager.io/docs/usage/gateway/): confirma o fluxo de emissão via listener TLS testado nesta página.
