---
title: Backup de recursos Kubernetes
sidebar:
  order: 2
---

> **Pré-requisitos:** kubeconfig com acesso de leitura aos recursos que serão exportados.
> **Versões testadas:** Kubernetes 1.36.

Um snapshot do etcd (veja [backup do etcd](../backup-k3s-etcd/)) protege o estado inteiro do cluster, mas restaurá-lo significa substituir o datastore inteiro — não é adequado para recuperar um namespace ou um recurso específico sem afetar o resto do cluster. Esta página cobre a exportação seletiva de recursos como complemento, não substituto, do snapshot do etcd.

Neste notebook, o estado desejado das aplicações já vive no Git via GitOps (veja [estruturar o repositório GitOps](../../../guides/tasks/gitops/structure-gitops-repository/)) — para recursos gerenciados pelo Argo CD, o próprio repositório já é o backup declarativo. Esta página é útil principalmente para recursos criados fora do fluxo GitOps ou para uma cópia adicional do estado observado.

## Exportar recursos de um namespace

> **Executar em:** estação administrativa com kubeconfig.

```bash
read -r -p "Namespace a exportar: " BACKUP_NAMESPACE
mkdir -p "backup-${BACKUP_NAMESPACE}-$(date +%Y%m%d)"

kubectl get all,configmap,secret,ingress,pvc \
  --namespace "${BACKUP_NAMESPACE}" \
  -o yaml > "backup-${BACKUP_NAMESPACE}-$(date +%Y%m%d)/resources.yaml"
```yaml

O export inclui campos gerenciados pelo cluster (`resourceVersion`, `uid`, status) que não devem ser reaplicados diretamente — trate o arquivo como referência para reconstrução manual ou para comparação, não como um manifesto pronto para `kubectl apply`.

:::caution
O comando acima inclui Secrets em texto claro no arquivo exportado. Proteja o destino do backup com o mesmo cuidado usado para as credenciais originais, e nunca versione esse arquivo em um repositório Git comum.
:::

## Exportar CRDs e recursos customizados

Para recursos de operators (cert-manager, Argo CD, Longhorn), inclua os CRDs relevantes explicitamente:

```bash
kubectl get crd -o name | grep -E 'cert-manager|argoproj|longhorn'
kubectl get certificates,clusterissuers --all-namespaces -o yaml > backup-cert-manager.yaml
kubectl get applications.argoproj.io --namespace argocd -o yaml > backup-argocd-applications.yaml
```yaml

## Copiar para fora do cluster

Como no snapshot do etcd, um export que permanece apenas na estação administrativa não é um backup até ser copiado para um destino externo e durável. Sincronize o diretório de export para o mesmo destino usado pelo snapshot do etcd.

## Validação

Confirme que o arquivo exportado contém os recursos esperados e pode ser lido:

```bash
kubectl apply --dry-run=client --filename resources.yaml
```yaml

Um erro de parsing nesta etapa indica um export corrompido ou incompleto — detecte isso no momento do backup, não durante uma restauração real.

## Troubleshooting

Se o `dry-run=client` falhar por campos imutáveis ou `resourceVersion` desatualizado, isso é esperado para um arquivo de export — ele não foi desenhado para reaplicação direta. Edite manualmente os campos gerenciados pelo cluster antes de reaplicar em um cenário de recuperação real.

## Próximo passo

[Backup e recuperação (política geral)](../backup-and-recovery/) para o inventário completo, RPO/RTO e o roteiro de restore drill.

## Fontes e leitura adicional

- [Kubernetes — kubectl apply](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_apply/): documenta `--dry-run` e o comportamento de aplicação de manifests.
- [Velero — How Velero Works](https://velero.io/docs/v1.18/how-velero-works/): alternativa mais completa para backup de recursos Kubernetes, avaliada em [backup e recuperação](../backup-and-recovery/#velero-como-ferramenta-a-avaliar).
