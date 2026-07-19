---
title: Backup de dados de bootstrap do GitOps
sidebar:
  order: 5
---

> **Pré-requisitos:** [repositório GitOps estruturado](../../guides/tasks/gitops/structure-gitops-repository/).
> **Frequência sugerida:** revisão a cada mudança na estrutura de bootstrap; trimestral por padrão.

O repositório GitOps em si já é a proteção do estado desejado — mas alguns dados de bootstrap ficam **fora** do repositório por design (chave SSH do Argo CD, credencial de bootstrap de segredos) e precisam de sua própria estratégia de backup, distinta do próprio Git.

## O que precisa de backup fora do repositório

| Dado | Onde vive | Por quê fica fora do Git |
| --- | --- | --- |
| Chave SSH do Argo CD | Gerenciador de segredos/estação administrativa | Credencial de acesso ao próprio repositório GitOps |
| Credencial de bootstrap de segredos | Gerenciador de segredos | Veja [o problema do bootstrap](../../../learn/secrets-management/bootstrap-problem/) |
| Token do K3s | Gerenciador de segredos | Necessário antes mesmo de o cluster existir |
| Chave age (se SOPS for usado) | Gerenciador de segredos | Decifra os segredos versionados no próprio repositório |

## Verificar a cópia do repositório

Além do backup dos dados acima, confirme que o próprio repositório Git tem redundância adequada (hospedagem gerenciada já replica, mas um clone local adicional protege contra exclusão acidental da conta/organização):

```bash
git clone --mirror "$(git -C gitops/ remote get-url origin)" gitops-mirror-backup.git
```yaml

Armazene o mirror em um destino diferente do provedor Git principal (outra máquina, outro provedor).

## Checklist

- [ ] Chave SSH do Argo CD guardada em um gerenciador de segredos, não apenas na estação administrativa.
- [ ] Credencial de bootstrap de segredos (Universal Auth, chave age, etc.) guardada separadamente.
- [ ] Token do K3s guardado junto com o snapshot do etcd (veja [backup do etcd](../backup-k3s-etcd/)).
- [ ] Um mirror do repositório Git existe fora do provedor principal.

## Troubleshooting

Se a organização/conta do provedor Git principal for perdida (exclusão acidental, suspensão), o mirror local é o único caminho de recuperação do histórico completo — teste periodicamente que ele está atualizado.

## Próximo passo

[Recuperar o gerenciamento de segredos](../../disaster-recovery/recover-secret-management/) documenta o procedimento completo de uso desses dados durante um incidente real.

## Fontes e leitura adicional

- [Cluster bootstrapping — Argo CD](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/): referência do padrão de bootstrap usado neste notebook.
