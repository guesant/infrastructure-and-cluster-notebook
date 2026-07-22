---
title: Transferência de arquivos
description: Catálogo de ferramentas para copiar, sincronizar e navegar em filesystems remotos (SCP, SFTP, rsync, FileZilla, sshfs, MinIO Client), com o que avaliar antes de escolher cada uma.
sidebar:
  order: 1
---

> **Para quem é:** operadores que precisam copiar, sincronizar ou navegar visualmente em arquivos entre máquinas.

As alternativas mais comuns para copiar arquivos entre hosts se dividem em quatro famílias: cópia pontual sobre SSH (SCP e SFTP, sem servidor adicional), sincronização incremental (rsync, que só transfere o que mudou), navegação visual do filesystem remoto (interfaces gráficas como FileZilla, ou montagem local via `sshfs`) e sincronização com armazenamento de objetos (clientes S3-compatíveis, como o MinIO Client). A escolha depende menos de qual é "melhor" e mais de qual operação está sendo feita: uma cópia pontual não precisa da complexidade de uma ferramenta de sincronização, e uma sincronização recorrente não deveria depender de um comando de cópia repetido manualmente.

## SCP: cópia pontual via SSH

```bash
# Do host remoto para o local
scp user@host:/remote/file.txt ./local/

# Do local para o host remoto
scp ./local/file.txt user@host:/remote/path/

# Recursivo (diretório inteiro)
scp -r user@host:/remote/dir ./local/
```

**Quando usar:** copiar um arquivo ou diretório pontualmente, sem precisar de nenhuma configuração além de acesso SSH já existente ao host de destino.

**Considerações:** o SCP usa o mesmo canal criptografado do SSH, então não exige nenhum serviço adicional no servidor. Em compensação, não mostra progresso detalhado da transferência por padrão e não retoma uma transferência interrompida; para arquivos grandes ou conexões instáveis, prefira rsync.

**Modelo de acesso e privilégios:** herda a mesma identidade e o mesmo nível de privilégio da sessão SSH usada para autenticar; não há controle de acesso próprio além do que a conta remota já permite.

**Licença e plataformas:** mesmas do OpenSSH (BSD/ISC), do qual o `scp` faz parte; nativo em Linux, macOS e BSD, incluído no Windows 10+.

## SFTP: sessão interativa sobre SSH

```bash
sftp user@host
```

Dentro da sessão SFTP, os comandos mais usados são `put arquivo` (enviar), `get arquivo` (baixar), `ls`/`cd`/`pwd` (navegação) e `quit` (sair).

**Quando usar:** quando a tarefa envolve navegar pelo filesystem remoto antes de decidir o que copiar, em vez de já saber o caminho exato do arquivo, como no SCP.

**Considerações:** o cliente `sftp` de linha de comando já vem com o pacote OpenSSH na maioria das distribuições. Para uma interface gráfica, o [FileZilla](#filezilla-cliente-gráfico-multiplataforma) é a opção mais usada; para navegar pelo filesystem remoto com o gerenciador de arquivos local em vez de uma interface dedicada, veja [sshfs](#sshfs-montar-um-filesystem-remoto), abaixo.

**Modelo de acesso, privilégios e licença:** mesmo modelo do SCP acima (herda a identidade da sessão SSH); mesma licença e plataformas do OpenSSH.

## Rsync: sincronização incremental

```bash
# Sincronizar local -> remoto, só o que mudou
rsync -avz /local/path/ user@host:/remote/path/

# Espelhar o destino: também remove no remoto o que não existe mais no local
rsync -avz --delete /local/ user@host:/remote/

# Excluindo padrões específicos
rsync -avz --exclude='*.tmp' /local/ user@host:/remote/
```

**Quando usar:** sincronização recorrente entre dois diretórios, onde retransferir tudo a cada execução seria desperdício de tempo e banda.

**Considerações:** o rsync compara os arquivos de origem e destino e transfere apenas as diferenças, o que o torna eficiente em execuções repetidas. O rsync é, por natureza, uma ferramenta de sincronização unidirecional: mesmo com `--delete`, a direção da cópia continua sendo da origem informada primeiro para o destino informado depois; `--delete` apenas faz o destino espelhar exatamente o conteúdo da origem, removendo lá o que não existe mais aqui, e não passa a sincronizar mudanças feitas no destino de volta para a origem. Uma sincronização genuinamente bidirecional (mudanças em ambos os lados sendo propagadas e conflitos resolvidos) exige uma ferramenta diferente, como Unison ou `rclone bisync`. O rsync precisa estar instalado nos dois hosts envolvidos.

**Modelo de acesso e privilégios:** quando usado sobre SSH (o transporte padrão neste notebook), herda a identidade e o privilégio da sessão SSH; o `--delete` remove arquivos no destino com esse mesmo privilégio, então um comando invertido por engano pode apagar dados no lado errado.

**Licença e plataformas:** GPL-3.0. Disponível para Linux, macOS e BSD nativamente; no Windows, normalmente via WSL ou Cygwin.

## FileZilla: cliente gráfico multiplataforma

```text
Protocolo: SFTP
Host: example.com
Usuário: admin
Porta: 22
```

**Quando usar:** transferências manuais frequentes onde uma interface visual com arrastar-e-soltar, fila de transferências e sincronização de pastas é mais conveniente que a linha de comando.

**Considerações:** suporta FTP, FTPS e SFTP no mesmo cliente; para acesso a um servidor deste notebook, prefira sempre SFTP (sobre SSH) em vez de FTP ou FTPS simples, que expõem credenciais e dados em texto claro na rede quando mal configurados.

**Modelo de acesso e privilégios:** herda a identidade e o privilégio da conta usada para autenticar no protocolo escolhido (SFTP/FTP/FTPS); o próprio FileZilla não introduz um nível de acesso adicional.

**Riscos:** o FileZilla guarda credenciais de conexões salvas em um arquivo local não criptografado por padrão (`sitemanager.xml`); trate a máquina onde ele roda com o mesmo cuidado dado a qualquer cofre de credenciais.

**Licença e plataformas:** GPL-2.0. Windows, macOS e Linux (o servidor FileZilla Server, um produto separado, é Windows apenas).

## sshfs: montar um filesystem remoto

```bash
sudo apt install sshfs

mkdir -p ~/mnt/remote
sshfs user@host:/remote/path ~/mnt/remote

# Desmontar
fusermount -u ~/mnt/remote
```

**Quando usar:** navegar pelo filesystem remoto com o gerenciador de arquivos gráfico local (Nautilus, Dolphin, ou o Finder no macOS via macFUSE), ou abrir e editar arquivos remotos diretamente em qualquer aplicativo que espera um caminho comum de sistema de arquivos, sem depender de uma interface dedicada como o FileZilla.

**Considerações:** `sshfs` monta o filesystem remoto sob demanda através de FUSE; cada leitura ou escrita vira uma requisição SFTP por trás dos panos, então a latência de rede afeta diretamente a responsividade, ao contrário de um filesystem local de verdade. Diferente do FileZilla, que baixa uma cópia local antes de editar, `sshfs` edita o arquivo remoto diretamente através do ponto de montagem; um editor que salva de forma atômica (grava em um arquivo temporário e renomeia por cima do original) pode se comportar de forma inesperada sobre uma conexão instável. Ao contrário de SCP e rsync, `sshfs` não foi feito para mover um lote de arquivos de uma vez, é adequado para navegação e edição pontual, não para sincronização ou backup; para isso, prefira rsync. Desmonte corretamente (`fusermount -u`, ou `umount` em outros sistemas) antes de perder a conexão de rede; um ponto de montagem que perde a conexão sem ser desmontado costuma travar em um estado inconsistente ("transport endpoint is not connected") até ser forçado a desmontar.

**Modelo de acesso e privilégios:** herda a identidade e o privilégio da sessão SSH usada para montar; qualquer aplicativo local com acesso ao ponto de montagem tem, na prática, o mesmo acesso ao filesystem remoto que essa sessão SSH teria.

**Riscos:** um ponto de montagem `sshfs` esquecido ativo em uma máquina compartilhada expõe o filesystem remoto a qualquer outro usuário local com permissão de leitura sobre o ponto de montagem; desmonte ao terminar, não deixe a montagem persistente sem necessidade real.

**Licença e plataformas:** GPL-2.0 (projeto libfuse). Linux nativamente; macOS via macFUSE (projeto separado, licença própria); sem suporte nativo no Windows.

## MinIO Client (mc): sincronização com object storage

```bash
mc alias set minio http://localhost:9000 <access-key> <secret-key>
mc mirror /local/path/ minio/backup/
```

**Quando usar:** backup ou sincronização de arquivos locais para um destino compatível com S3 (MinIO, ou qualquer outro provedor que implemente a mesma API).

**Considerações:** `access-key` e `secret-key` no exemplo são placeholders; nunca use as credenciais padrão de instalação do MinIO (`minioadmin`/`minioadmin`) além de um ambiente de teste totalmente isolado, já que são públicas e amplamente conhecidas. `mc mirror` sincroniza em uma direção (local para o bucket, no exemplo acima); inverta a ordem dos argumentos para sincronizar do bucket para o local.

**Modelo de acesso e privilégios:** autenticação por par access-key/secret-key configurado via `mc alias set`; o alias fica salvo localmente (`~/.mc/config.json`) com as credenciais em texto claro, então proteja esse arquivo com o mesmo cuidado dado a qualquer credencial de object storage.

**Licença e plataformas:** o cliente `mc` é AGPLv3 (o servidor MinIO também migrou para AGPLv3 em 2021; os SDKs cliente para outras linguagens permanecem Apache 2.0). Disponível para Linux, macOS e Windows.

## Referências

- [OpenSSH: scp](https://man.openbsd.org/scp): manual oficial.
- [rsync](https://rsync.samba.org/): documentação completa, incluindo todas as opções de exclusão e comparação.
- [FileZilla](https://filezilla-project.org/): download e documentação.
- [sshfs](https://github.com/libfuse/sshfs): repositório oficial, opções de montagem e requisitos de FUSE.
- [MinIO Client (mc)](https://min.io/docs/minio/linux/reference/minio-mc.html): referência de comandos.
