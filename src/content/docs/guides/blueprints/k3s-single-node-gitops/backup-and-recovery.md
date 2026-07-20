---
title: Backup e recuperação
sidebar:
  order: 9
---

Este blueprint não define seu próprio procedimento de backup: ele adota o runbook geral em [backup e recuperação](../../../operations/backups/backup-and-recovery/) e o procedimento de [backup do etcd](../../../operations/backups/backup-k3s-etcd/). Esta página só destaca o que muda em uma topologia de nó único.

## O que precisa de backup neste blueprint

- **Snapshot do etcd embarcado**: contém todo o estado do cluster (Secrets, ConfigMaps, estado das Applications do Argo CD). Sem ele, a recuperação depois da perda do host reconstrói o cluster do zero.
- **Token do K3s**: necessário para reintegrar ou reinstalar um servidor a partir de um snapshot restaurado.
- **Repositório GitOps**: já é sua própria cópia versionada fora do cluster; o Git é, por natureza, o backup do estado desejado das aplicações.
- **Volumes persistentes**, se o cluster usa Longhorn ou outro provisionador: o snapshot do etcd não inclui os dados dos volumes.
- **Credenciais e segredos** gerados fora do Git (ex.: chave privada da conta ACME, credencial do provedor DNS): sem um gerenciador de segredos, ficam apenas no cluster e no snapshot.

## Por que nó único muda o risco

Em uma topologia HA, a perda de um manager não é um evento de perda de dados, porque os demais membros do etcd mantêm o quorum. Em nó único, a perda do host é a perda simultânea do único membro do datastore. Um snapshot desatualizado ou nunca copiado para fora do host equivale a não ter backup: o snapshot local se perde junto com o disco que falhou.

Copie cada snapshot para fora do host imediatamente após gerá-lo; não deixe essa cópia como uma etapa separada e adiável.

## Teste de recuperação

Backup não testado não é backup confiável. Periodicamente, restaure o snapshot mais recente em um host de teste isolado e confirme que o cluster restaurado inicializa, que o Argo CD volta a reconciliar as Applications e que o token restaurado é o mesmo usado pelos nós que dependerão dele em uma expansão futura.

## Checkpoint

- [ ] Snapshot do etcd gerado e copiado para fora do host, conforme [backup do etcd](../../../operations/backups/backup-k3s-etcd/).
- [ ] Token do K3s guardado em um gerenciador de segredos.
- [ ] Volumes persistentes (se houver) com backup próprio, fora do escopo do snapshot do etcd.
- [ ] Um teste de restauração já foi executado com sucesso, não apenas planejado.

## Fontes e leitura adicional

- [K3s: Backup and Restore](https://docs.k3s.io/datastore/backup-restore): referência oficial de `etcd-snapshot`, restauração e comportamento do token.
