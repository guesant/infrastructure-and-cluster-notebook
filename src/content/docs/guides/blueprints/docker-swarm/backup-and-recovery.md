---
title: Backup e recuperação
sidebar:
  order: 8
---

> **Para quem é:** operadores protegendo o estado de configuração de um cluster Swarm contra perda de managers.

Swarm armazena estado (services, secrets, configs, redes) em um banco de dados Raft gerenciado pelos managers. Se todos os managers caem, o estado se perde (a menos que tenha backup).

## O que é backed up

Diretório `/var/lib/docker/swarm/` do manager contém:

- Banco de dados Raft (todos os services, tasks, configs, secrets).
- Certificados TLS do manager.

**Não** inclui:

- Dados de volumes (sua responsabilidade).
- Imagens Docker (redownload happens automaticamente).
- Logs de containers (ephemeral).

## Procedimento de backup

Parar o Docker, fazer cópia atômica, reiniciar:

```bash
sudo systemctl stop docker
sudo tar -czf /backup/swarm-$(date +%s).tar.gz /var/lib/docker/swarm/
sudo systemctl start docker
```

Ou, sem downtime (menos seguro, snapshot pode estar inconsistente):

```bash
# Sem parar Docker (snapshot pode estar em estado intermediário)
sudo tar -czf /backup/swarm-snapshot.tar.gz /var/lib/docker/swarm/

# Testar backup
tar -tzf /backup/swarm-snapshot.tar.gz | head
```

## Automatizar backup

Cron job diário (na máquina de um manager):

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_DIR=/backups/swarm
mkdir -p $BACKUP_DIR

# Para Docker, faz backup, restart
systemctl stop docker
tar -czf $BACKUP_DIR/swarm-$DATE.tar.gz /var/lib/docker/swarm/
systemctl start docker

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "swarm-*.tar.gz" -mtime +7 -delete
```

## Recuperação: perda de um manager (ainda há quorum)

Manager offline mas outros managers funcionam:

```bash
# Remover o manager offline
docker node rm --force <node_id>

# Reparar o nó offline (fora do cluster)
systemctl restart docker
# ou reinstalar Docker se necessário

# Rejuntar ao cluster
docker swarm join --token <MANAGER_TOKEN> <IP>:<PORT>
```

## Recuperação: perda de quorum (CRÍTICO)

Todos os managers ou quase todos caem. Restaurar de backup:

### Pré-requisito

Ter backup do `/var/lib/docker/swarm/` de um manager que era funcional.

### Procedimento

1. **No manager a ser restaurado** (ou em qualquer máquina):

   ```bash
   # Parar Docker
   sudo systemctl stop docker

   # Remover banco de dados antigo/corrompido
   sudo rm -rf /var/lib/docker/swarm

   # Restaurar backup
   sudo tar -xzf /backup/swarm-20260718.tar.gz -C /

   # Reiniciar Docker
   sudo systemctl start docker
   ```

1. **Force o servidor em modo standalone** (se precisa recrear o Swarm):

   ```bash
   sudo docker swarm init --force-new-cluster
   ```

   Isso reinitializa o cluster com um novo Raft, usando o backup como base.

1. **Trazer de volta outros managers**:

   ```bash
   docker swarm join --token <MANAGER_TOKEN> <IP>:<PORT>
   ```

1. **Verificar**:

   ```bash
   docker node ls
   docker service ls  # services foram restaurados?
   ```

## Teste de restauração

Antes de colocar em produção, testar o procedimento:

```bash
# Em um servidor de teste:
1. Fazer backup de um manager
1. Restaurar em nova máquina
1. docker swarm init --force-new-cluster
1. Verificar que services e configs estão lá
1. Tentar deslocar um service
```

## Limitações

- **Sem backup de imagens**: se imagens foram deletadas ou tags movidas, redeploy busca novamente.
- **Sem backup automático nativo**: você é responsável. Configure cron ou observabilidade externa.
- **Sem replicação geográfica**: backups estão no mesmo datacenter por padrão.

Para operações críticas, considere replicar backups para storage remoto (S3, rsync).

## Referências

- [Swarm data persistence](https://docs.docker.com/engine/swarm/admin_guide/#recover-from-disaster): documentação oficial.
- [Backup strategies](https://docs.docker.com/storage/snapshots/#backup-strategies): estratégias de backup de volumes.
