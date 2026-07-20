---
title: Instalar Velero
description: Como instalar o Velero via Helm com MinIO como backend S3 local, criar o primeiro backup agendado e validar uma restauração de teste.
sidebar:
  order: 5
---

> **Para quem é:** operadores de K3s que querem backup de workloads e volumes, além do snapshot de etcd.
> **Pré-requisito:** K3s já em operação, acesso administrativo ao cluster, e um backend de armazenamento compatível com S3 (MinIO local ou um provedor de nuvem).

O Velero grava backups em qualquer backend compatível com a API S3, não apenas na AWS. Este
guia cobre a instalação com **MinIO** rodando dentro do próprio cluster, o caminho mais simples
para laboratório e ambientes sem um provedor de nuvem já disponível; a variante com AWS S3 real
está descrita mais abaixo, na seção "Configuração com AWS S3".

## Passo 1: Instalar o MinIO como backend de storage

Se for usar storage local em vez de um provedor de nuvem:

```bash
helm repo add minio https://charts.min.io
helm repo update

helm install minio minio/minio \
  --namespace minio \
  --create-namespace \
  --set auth.rootPassword=velero-admin \
  --set auth.rootUser=velero-admin \
  --set persistence.size=50Gi
```

**Atenção:** `velero-admin` como usuário e senha simultaneamente serve apenas para laboratório.
Antes de usar este setup com dados reais, gere uma senha própria e trate-a como qualquer outro
segredo do cluster.

Obtenha o endpoint interno do MinIO:

```bash
kubectl get svc -n minio minio
# O Velero vai apontar para: http://minio.minio.svc.cluster.local:9000
```

## Passo 2: Criar o bucket e as credenciais no MinIO

```bash
kubectl port-forward -n minio svc/minio 9000:9000 &
```

Com o port-forward ativo, acesse o console do MinIO em `http://localhost:9000` com o usuário e a
senha definidos no passo anterior, e crie um bucket chamado `velero` pela interface, ou via CLI:

```bash
mc alias set minio http://localhost:9000 velero-admin velero-admin
mc mb minio/velero
```

## Passo 3: Criar o Secret com as credenciais

O Velero autentica no backend S3 usando um arquivo de credenciais no formato do AWS CLI,
independentemente de o backend real ser MinIO, AWS ou outro provedor compatível:

```bash
cat > /tmp/velero-credentials << EOF
[default]
aws_access_key_id = velero-admin
aws_secret_access_key = velero-admin
EOF

kubectl create namespace velero

kubectl create secret generic velero-credentials \
  --from-file=/tmp/velero-credentials \
  -n velero
```

## Passo 4: Instalar o Velero via Helm

```bash
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm repo update

helm install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  --set configuration.backupStorageLocation.bucket=velero \
  --set configuration.backupStorageLocation.provider=aws \
  --set configuration.backupStorageLocation.config.s3Url=http://minio.minio.svc.cluster.local:9000 \
  --set configuration.backupStorageLocation.config.insecureSkipTLSVerify=true \
  --set schedules.daily.schedule='0 2 * * *' \
  --set schedules.daily.template.ttl=720h \
  --set schedules.daily.template.includedNamespaces='{*}'
```

O provider `aws` aqui não significa que o backup vai para a AWS: o Velero usa o plugin AWS para
falar com qualquer backend que implemente a API S3, incluindo o MinIO. `insecureSkipTLSVerify`
só é aceitável porque o MinIO deste exemplo não está atrás de TLS válido; remova essa flag ao
apontar para um endpoint HTTPS real.

## Passo 5: Verificar a instalação

```bash
velero plugin get
velero backup-location get
velero schedule get
```

Esses três comandos confirmam, respectivamente, que os plugins do provider foram carregados, que
o Velero enxerga o bucket configurado como local de backup e que o agendamento diário foi
registrado. Em seguida, gere um backup manual para validar o caminho completo, sem esperar pelo
agendamento:

```bash
velero backup create test-backup --wait
velero backup describe test-backup
velero backup logs test-backup
```

**Esperado:** `velero backup describe test-backup` mostra `Phase: Completed`. Qualquer outra fase
(`PartiallyFailed`, `Failed`) exige revisar `velero backup logs test-backup` antes de prosseguir,
já que um backup incompleto não é uma base confiável para restauração.

## Passo 6: Testar a restauração

```bash
kubectl delete namespace default
velero restore create --from-backup test-backup --wait
kubectl get ns
kubectl get pods
```

**Atenção:** `kubectl delete namespace default` é destrutivo e apaga todos os recursos desse
namespace antes de o Velero restaurá-los. Execute este teste apenas em um cluster descartável ou
em um namespace de teste, nunca em um ambiente com workloads reais em produção.

## Configuração com AWS S3

O caminho é o mesmo dos passos 3 e 4 acima, trocando apenas a origem das credenciais e o bucket:
use a chave de acesso real da AWS no Secret, e aponte o Helm chart para um bucket S3 existente em
vez do MinIO local.

```bash
cat > /tmp/velero-credentials << EOF
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
EOF

helm install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  --set configuration.backupStorageLocation.bucket=my-velero-bucket \
  --set configuration.backupStorageLocation.provider=aws \
  --set configuration.volumeSnapshotLocation.provider=aws \
  --set configuration.volumeSnapshotLocation.config.region=us-east-1
```

Sem `s3Url` nem `insecureSkipTLSVerify`, o plugin AWS assume o endpoint público padrão da região
configurada. O `volumeSnapshotLocation` adicional habilita snapshots nativos de EBS, um recurso
que o MinIO não oferece: nesse backend, o Velero usa apenas backup baseado em arquivos (veja a
seção sobre backup de sistema de arquivos, mais abaixo).

## Agendamento de backups

```bash
velero schedule create nightly \
  --schedule="0 2 * * *" \
  --include-namespaces='*' \
  --ttl 720h
```

`--schedule` usa a sintaxe cron padrão (aqui, todos os dias às 2h). `--ttl` define por quanto
tempo o Velero mantém o backup antes de expirá-lo automaticamente; 720h equivalem a 30 dias.

## Restauração seletiva

```bash
# Restaurar só um namespace
velero restore create --from-backup test-backup \
  --include-namespaces myapp \
  --wait

# Restaurar só um tipo de recurso
velero restore create --from-backup test-backup \
  --include-resources deployments,services \
  --wait
```

Essas duas formas de filtro são independentes: `--include-namespaces` restringe por namespace,
`--include-resources` restringe por tipo de recurso Kubernetes, e podem ser combinadas na mesma
restauração quando só uma fração específica do backup precisa voltar.

## Backup de volumes sem suporte a snapshot

Volumes que não usam um provisionador com suporte a snapshot CSI (como `hostPath` ou a maioria
dos volumes locais do K3s) não são cobertos pelo backup de objetos padrão do Velero. Para esses
casos, o Velero oferece um mecanismo de backup em nível de sistema de arquivos, que copia os
dados do volume em vez de depender de um snapshot do storage:

```bash
velero backup create with-fs-backup \
  --default-volumes-to-fs-backup
```

Esse mecanismo já foi chamado de "restic" nas versões mais antigas do Velero; a flag
`--default-volumes-to-restic` ainda aparece em documentação desatualizada, mas foi substituída por
`--default-volumes-to-fs-backup`. É mais lento que um snapshot nativo, porque copia os dados
byte a byte em vez de usar o mecanismo de cópia do storage, mas funciona com qualquer tipo de
volume.

## Troubleshooting

```bash
# Ver logs do controller Velero
kubectl logs -n velero deployment/velero -f

# Ver eventos de backup
kubectl get events -n velero

# Verificar status de um backup com detalhes completos
velero backup describe test-backup --details
```

Comece pelos logs do controller quando um backup fica preso em `InProgress` por mais tempo do que
o esperado; eventos do namespace `velero` costumam indicar falhas de autenticação com o backend
S3 antes mesmo de o backup começar a copiar dados.

## Referências

- [Velero: Basic Install](https://velero.io/docs/main/basic-install/): instalação oficial e lista de provedores suportados.
- [Velero: File System Backup](https://velero.io/docs/main/file-system-backup/): mecanismo de backup baseado em arquivos (antigo "restic").
- [Helm chart do Velero](https://github.com/vmware-tanzu/helm-charts/tree/main/charts/velero): valores disponíveis no chart oficial.
