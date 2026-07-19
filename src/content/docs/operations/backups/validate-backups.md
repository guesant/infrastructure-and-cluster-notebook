---
title: Validar backups (rotina consolidada)
sidebar:
  order: 7
---

> **Pré-requisitos:** backups configurados para etcd, volumes Longhorn (se aplicável) e PostgreSQL (se aplicável).
> **Frequência sugerida:** semanal para verificação de execução; trimestral para teste completo de restauração.

Esta página consolida a rotina de verificação entre os diferentes tipos de backup deste notebook, para uso como checklist único em vez de percorrer cada página individualmente toda semana.

## Verificação semanal (execução, não restauração)

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
echo "== etcd =="
k3s etcd-snapshot list

echo "== Longhorn =="
kubectl --namespace longhorn-system get backups.longhorn.io --sort-by=.status.snapshotCreatedAt | tail -5

echo "== PostgreSQL =="
kubectl get backups --all-namespaces --sort-by=.status.stoppedAt | tail -5
```yaml

Para cada seção, confirme que existe uma execução recente e sem falha, dentro do RPO definido para o dado correspondente.

## Checklist semanal

- [ ] [Backup do etcd](../backup-k3s-etcd/) recente e copiado para fora do host.
- [ ] [Backup de volumes Longhorn](../backup-longhorn-volumes/) sem falhas recentes.
- [ ] [Backup do PostgreSQL](../backup-postgresql/) com WAL arquivado continuamente.
- [ ] Nenhum alerta de backup ausente ou atrasado pendente (veja [prontidão de observabilidade](../../checklists/observability-readiness/)).

## Checklist trimestral (teste completo de restauração)

- [ ] [Restaurar o etcd](../../disaster-recovery/restore-k3s-etcd/) testado em ambiente isolado.
- [ ] [Restaurar um volume Longhorn](../../disaster-recovery/restore-longhorn-volume/) testado.
- [ ] [Restaurar um cluster PostgreSQL](../../guides/tasks/databases/restore-postgresql-cluster/) testado.
- [ ] Chave age ou credencial de bootstrap de segredos testada (veja [proteger chaves age](../protect-age-keys/)).
- [ ] Duração e perda de dados de cada teste registradas e comparadas com RPO/RTO — veja [testes de restauração](../../../learn/backups/restore-testing/).

## Próximo passo

Se qualquer item falhar, trate como prioridade — um backup não verificado é indistinguível de nenhum backup até o momento em que é necessário.

## Fontes e leitura adicional

- [Backup e recuperação (runbook completo)](../backup-and-recovery/): matriz de proteção e roteiro completo de restore drill.
