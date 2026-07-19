---
title: Backup do etcd do K3s
sidebar:
  order: 1
---

> **Pré-requisitos:** acesso root a um nó manager com etcd embarcado.
> **Versões testadas:** K3s v1.36.1+k3s1.

Esta página cobre o procedimento de criar, copiar e restaurar um snapshot do etcd embarcado do K3s. Para inventário completo de ativos, matriz de proteção, RPO/RTO e o roteiro de restore drill, veja a política geral em [backup e recuperação](../backup-and-recovery/) — esta página é a referência procedural que ela cita.

Um snapshot do etcd protege o estado da API Kubernetes (objetos, ConfigMaps, Secrets, metadados). Ele não contém dados gravados em volumes persistentes, arquivos externos aos nós nem imagens de containers — veja [limites do snapshot K3s](../backup-and-recovery/#limites-do-snapshot-k3s).

## Criar um snapshot

> **Executar em:** um nó manager com etcd embarcado, como `root`.

```bash
k3s etcd-snapshot save --name "manual-$(date +%Y%m%d-%H%M%S)"
k3s etcd-snapshot list
```yaml

Crie um snapshot manual antes de qualquer atualização ou mudança de configuração relevante, além dos snapshots agendados automaticamente pelo K3s.

## Copiar para fora do host

Um snapshot que permanece apenas no disco local não protege contra a perda do host — é a mesma falha que ele deveria mitigar. Copie o snapshot e o token do servidor (`/var/lib/rancher/k3s/server/token`) para um destino externo:

> **Executar em:** o mesmo nó manager, ou a partir de uma estação com acesso SSH a ele.

```bash
LATEST_SNAPSHOT="$(ls -t /var/lib/rancher/k3s/server/db/snapshots/ | head -n1)"
scp "/var/lib/rancher/k3s/server/db/snapshots/${LATEST_SNAPSHOT}" \
  usuario@destino-externo:/caminho/de/backup/
```yaml

Ajuste o comando ao destino real (outro host, object storage, etc.) — o essencial é que o destino esteja fora do mesmo disco e, idealmente, fora do mesmo domínio de falha físico do host original.

## Agendamento automático

O K3s já agenda snapshots automaticamente por padrão (a cada 12 horas, retendo 5). Para ajustar, adicione ao `config.yaml` (veja [configurar opções do servidor](../../../guides/tasks/kubernetes/configure-k3s-server-options/)):

```yaml
etcd-snapshot-schedule-cron: "0 */12 * * *"
etcd-snapshot-retention: 5
```yaml

O agendamento automático não copia os snapshots para fora do host sozinho — combine com uma rotina externa (cron, systemd timer) que sincronize o diretório de snapshots para o destino externo, ou configure `etcd-s3` para enviar diretamente a um storage compatível com S3.

## Restaurar um snapshot

:::danger
Restaurar um snapshot substitui o estado atual do datastore. Faça isso apenas em um ambiente isolado de teste ou durante um incidente aprovado — nunca como teste em um cluster de produção ativo.
:::

> **Executar em:** o nó manager que se tornará o novo (ou único) membro do cluster restaurado, como `root`.

```bash
systemctl stop k3s

k3s server \
  --cluster-reset \
  --cluster-reset-restore-path=/caminho/para/o/snapshot

systemctl start k3s
```yaml

Em um cluster com múltiplos managers, restaure em apenas um deles com `--cluster-reset`; os demais precisam ser removidos e reintegrados como servidores novos depois que o restaurado estiver `Ready` — não inicie os outros managers antigos apontando para o mesmo datastore restaurado.

## Validação

> **Executar em:** o nó restaurado.

```bash
systemctl status k3s
k3s kubectl get nodes
k3s kubectl get pods --all-namespaces
```yaml

Compare os recursos restaurados com o que era esperado no ponto do snapshot. Lembre que controllers, volumes ou endpoints externos referenciados pelos objetos restaurados podem não estar automaticamente disponíveis — veja a [ordem de recuperação completa](../backup-and-recovery/#ordem-de-recuperação).

## Troubleshooting

Se `k3s server --cluster-reset` falhar por diretório de dados já existente, confirme que o serviço foi parado (`systemctl stop k3s`) antes do comando — o etcd não pode estar em uso durante o reset.

## Rollback

Não há rollback de uma restauração — ela substitui o estado. Se a restauração usar o ambiente isolado recomendado, simplesmente descarte esse ambiente sem afetar produção.

## Próximo passo

[Backup e recuperação (política geral)](../backup-and-recovery/) para o restante do inventário e o roteiro de restore drill.

## Fontes e leitura adicional

- [K3s — `etcd-snapshot`](https://docs.k3s.io/cli/etcd-snapshot): referência completa de agendamento, retenção, storage S3 e restauração.
- [K3s — Backup and Restore](https://docs.k3s.io/datastore/backup-restore): documenta o processo de `--cluster-reset` e o comportamento em topologias HA.
