---
title: Validar o cluster K3s
description: Como confirmar nós, componentes do sistema, etcd, DNS interno e agendamento de Pods depois de instalar, expandir ou reconfigurar um cluster K3s.
sidebar:
  order: 11
---

> **Pré-requisitos:** kubeconfig administrativo configurado (veja [acesso remoto](../configure-kubeconfig/)).
> **Versões testadas:** K3s v1.36.1+k3s1.

Esta página reúne as verificações usadas depois de instalar, expandir ou reconfigurar o cluster, antes de considerá-lo pronto para os módulos seguintes (rede, certificados, GitOps). Ela não substitui a [validação pós-instalação](../../../../operations/checklists/post-install-checklist/), que cobre também os componentes de plataforma instalados depois.

## Nós

> **Executar em:** estação administrativa.

```bash
kubectl get nodes -o wide
```

Todos os nós esperados devem aparecer como `Ready`. Em uma topologia HA, confirme que a quantidade de managers corresponde à decisão de quorum tomada no planejamento.

## Componentes do sistema

> **Executar em:** estação administrativa.

```bash
kubectl get pods --all-namespaces
kubectl get componentstatuses 2>/dev/null || true
```

Todos os Pods em `kube-system` devem estar `Running` ou `Completed`. `componentstatuses` está obsoleto em versões recentes do Kubernetes e pode não retornar nada; não é um sinal de erro.

## Etcd (topologia HA ou single-node com `cluster-init`)

> **Executar em:** um nó manager, como `root`.

```bash
k3s kubectl exec -n kube-system -it $(k3s kubectl get pods -n kube-system -l component=etcd -o jsonpath='{.items[0].metadata.name}' 2>/dev/null) -- etcdctl endpoint health 2>/dev/null \
  || k3s etcd-snapshot list
```

Quando o etcd embarcado não expõe um Pod inspecionável diretamente, `k3s etcd-snapshot list` confirma que o subsistema de datastore está funcional o suficiente para gerar snapshots.

## DNS interno do cluster

> **Executar em:** estação administrativa.

```bash
kubectl run dns-test --rm -it --restart=Never --image=busybox:1.36 -- nslookup kubernetes.default
```

Deve resolver para o ClusterIP do Service `kubernetes` no namespace `default`. Uma falha aqui indica problema no CoreDNS antes mesmo de testar aplicações.

## Agendamento e rede de Pods

> **Executar em:** estação administrativa.

```bash
kubectl run schedule-test --rm -it --restart=Never --image=busybox:1.36 -- true
```

Um Pod que inicia e termina com sucesso confirma agendamento, pull de imagem e rede básica funcionando ponta a ponta.

## Checklist resumido

- [ ] Todos os nós `Ready`.
- [ ] Pods de `kube-system` saudáveis.
- [ ] Datastore (etcd) respondendo ou snapshot listável.
- [ ] Resolução DNS interna funcionando.
- [ ] Um Pod de teste consegue ser agendado e executado.

## Troubleshooting

Se um teste falhar isoladamente (ex.: DNS funciona mas o Pod de teste não agenda), revise `kubectl describe node <nome>` para eventos de pressão de recursos ou taints inesperados antes de suspeitar de um problema mais amplo.

## Próximo passo

Com o cluster validado, siga para os módulos de plataforma: [Gateway API e Traefik](../../networking/configure-traefik-gateway-api/), [cert-manager](../../certificates/install-cert-manager/) ou [Argo CD](../../gitops/install-argocd/), conforme o [blueprint k3s single-node com GitOps](../../../blueprints/k3s-single-node-gitops/).

## Fontes e leitura adicional

- [Kubernetes: Debug a Cluster](https://kubernetes.io/docs/tasks/debug/debug-cluster/): referência oficial de diagnóstico de componentes do cluster.
- [K3s: Backup and Restore](https://docs.k3s.io/datastore/backup-restore): documenta `etcd-snapshot` e o estado esperado do datastore.
