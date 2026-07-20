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

## Recuperação: perda de quorum (crítico)

Quando todos os managers, ou managers suficientes para impedir qualquer quorum, caem ao mesmo
tempo, o cluster não consegue mais tomar decisões e precisa ser reconstruído a partir de um
backup.

### Pré-requisito

Ter um backup do `/var/lib/docker/swarm/` de um manager que estava funcional antes da perda de
quorum. Sem esse backup, não há como recuperar o estado anterior: será necessário recriar o
cluster do zero, perdendo services, secrets e configs registrados nele.

### Procedimento

1. **No manager a ser restaurado** (ou em qualquer máquina que assumirá esse papel):

   ```bash
   sudo systemctl stop docker
   sudo rm -rf /var/lib/docker/swarm
   sudo tar -xzf /backup/swarm-20260718.tar.gz -C /
   sudo systemctl start docker
   ```

   **Atenção:** `rm -rf /var/lib/docker/swarm` apaga permanentemente o estado local do Swarm
   nessa máquina, incluindo certificados TLS do manager. É irreversível sem o backup que os
   comandos seguintes restauram; confirme que o arquivo de backup em `/backup/` é válido e
   corresponde ao snapshot esperado antes de prosseguir.

1. **Force o modo standalone para recriar o Swarm**, apenas se este for o primeiro manager
   restaurado e não houver outro manager ainda ativo com o mesmo estado:

   ```bash
   sudo docker swarm init --force-new-cluster
   ```

   **Atenção:** este comando descarta o histórico de consenso Raft anterior e inicia um cluster
   novo, usando o backup restaurado como ponto de partida único. Rodá-lo em mais de um manager
   simultaneamente cria dois clusters independentes e divergentes a partir do mesmo backup; rode-o
   uma única vez, no manager escolhido para liderar a recuperação.

1. **Traga de volta os outros managers**, cada um se juntando ao cluster recém-recriado como se
   fosse um manager novo:

   ```bash
   docker swarm join --token <MANAGER_TOKEN> <IP>:<PORT>
   ```

1. **Verifique o resultado**:

   ```bash
   docker node ls
   docker service ls
   ```

   O comando `docker node ls` deve listar o manager recuperado e cada manager que se juntou na
   etapa anterior, todos com status `Reachable`. Em `docker service ls`, confira se os services
   que existiam antes da perda de quorum aparecem com a contagem de réplicas esperada; um service
   ausente ou com réplicas zeradas indica que o backup usado era anterior à criação desse service,
   ou que o backup restaurado não era o mais recente disponível.

## Teste de restauração

Um procedimento de recuperação que nunca foi executado fora de uma emergência real é um
procedimento não testado. Antes de confiar nele em produção, valide o caminho completo em um
servidor descartável:

1. Faça backup de um manager de teste.
2. Restaure esse backup em uma máquina nova, seguindo o procedimento acima.
3. Rode `docker swarm init --force-new-cluster` nela.
4. Verifique que os services e configs esperados aparecem, exatamente como na etapa de
   verificação acima.
5. Tente reagendar um service existente para confirmar que o cluster restaurado agenda tarefas
   normalmente, não apenas que ele lista o estado antigo.

## Limitações

- **Sem backup de imagens**: se imagens foram deletadas ou tags movidas, redeploy busca novamente.
- **Sem backup automático nativo**: você é responsável. Configure cron ou observabilidade externa.
- **Sem replicação geográfica**: backups estão no mesmo datacenter por padrão.

Para operações críticas, considere replicar backups para storage remoto (S3, rsync).

## Referências

- [Swarm data persistence](https://docs.docker.com/engine/swarm/admin_guide/#recover-from-disaster): documentação oficial.
- [Backup strategies](https://docs.docker.com/storage/snapshots/#backup-strategies): estratégias de backup de volumes.
