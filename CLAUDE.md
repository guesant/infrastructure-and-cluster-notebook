# AGENTS.md

## Regras de execução

- Nunca execute comandos diretamente no host.
- Toda ferramenta, script, validação, build, teste, lint ou comando auxiliar deve ser executado dentro de um contêiner Docker ou Podman.
- **Use sempre o runner `./jail-exec.sh` na raiz do repositório** — ele já aplica todas as regras abaixo (detecção de Podman/Docker, menor privilégio, sem rede por padrão, idempotência dentro de contêiner). Só monte um comando `docker run`/`podman run` manual se o `jail-exec.sh` não cobrir o caso, mantendo os mesmos princípios.
- Prefira Podman quando estiver disponível e for compatível com o fluxo existente.
- Use imagens oficiais, confiáveis, versionadas e tão pequenas quanto possível.
- Nunca utilize `--privileged`.
- Conceda apenas as capacidades, dispositivos, volumes, portas e permissões estritamente necessários.
- Execute o contêiner como usuário não root sempre que possível.
- Não utilize `--network=host`, `--pid=host`, `--ipc=host` ou compartilhamento de namespaces do host, salvo quando isso for indispensável e estiver explicitamente autorizado.
- Não monte `/`, `/etc`, `/var/run`, `/run`, `/dev`, o diretório pessoal completo ou outros caminhos sensíveis do host.
- Nunca monte `/var/run/docker.sock` ou o socket do Podman, exceto quando houver autorização explícita.
- Monte arquivos e diretórios como somente leitura (`:ro`) sempre que não houver necessidade real de escrita.
- Limite o escopo dos volumes ao diretório específico necessário para a tarefa.
- Não publique portas no host quando a comunicação puder ocorrer apenas pela rede interna do contêiner.
- Quando uma porta precisar ser publicada, vincule-a a `127.0.0.1`, salvo quando o acesso externo for um requisito explícito.
- Remova capacidades Linux desnecessárias, preferencialmente começando com:

```bash
--cap-drop=ALL
```

- Adicione capacidades individualmente somente quando forem indispensáveis.
- Use filesystem raiz somente leitura sempre que possível:

```bash
--read-only
```

- Use `tmpfs` para diretórios temporários que precisem de escrita.
- Defina limites de CPU, memória, processos e arquivos quando aplicável.
- Não reutilize credenciais, chaves, tokens ou configurações pessoais do host dentro do contêiner.
- Nunca inclua segredos diretamente em comandos, imagens, Dockerfiles, arquivos versionados ou logs.
- Não execute imagens sem tag ou com a tag `latest`; fixe uma versão explícita e, quando relevante, um digest.
- Não faça download e execução direta de scripts remotos com construções como:

```bash
curl URL | sh
wget -qO- URL | bash
```

- Quando um artefato externo for necessário, faça o download dentro do contêiner, valide sua origem e integridade e somente então execute-o.
- Não instale pacotes, altere configurações, crie usuários, habilite serviços ou modifique o sistema operacional do host.
- Não utilize `sudo` no host.
- Não interrompa, reinicie ou altere serviços do host.
- Não remova arquivos ou volumes persistentes sem autorização explícita.

## Política de código

- Zero comentários em código (shell, TS/TSX, CSS, YAML, justfile etc.): o código deve ser limpo, organizado e legível por si mesmo — nomes descritivos, funções pequenas e estrutura clara no lugar de comentários.
- Diretivas funcionais não são comentários e devem ser mantidas quando necessárias (ex.: `# syntax=` em Containerfile, `// @ts-check`, `eslint-disable`).
- Documentação de uso pertence a arquivos de documentação (README, docs), não a comentários no código.

## Comportamento esperado

Use o runner do repositório para qualquer comando:

```bash
# comando padrão (sem rede, mínimo privilégio)
./jail-exec.sh bun run build

# rede é opt-in (necessária para bun install, bun audit etc.)
JAIL_NETWORK=1 ./jail-exec.sh bun install

# servidor de desenvolvimento com porta publicada em 127.0.0.1
JAIL_PUBLISH=4321 ./jail-exec.sh bun run dev -- --host 0.0.0.0

# trocar a imagem quando a tarefa exigir outra ferramenta
JAIL_IMAGE=docker.io/koalaman/shellcheck:v0.10.0 ./jail-exec.sh shellcheck /workspace/jail-exec.sh
```

A imagem padrão é construída do target `jail` de `.container/Containerfile` (único Containerfile do projeto; os devcontainers usam o serviço único `app` de `.container/compose.yml`, com o override `.container/compose.ci.yml` na CI): Bun como gerenciador de pacotes e runtime — a imagem tem um symlink `node -> bun`, então bins com shebang de node (astro etc.) rodam no runtime do Bun.

Comportamento do runner:

- Detecta o modo de execução automaticamente: dentro de contêiner → direto (`bare`); senão Podman (preferido), Docker ou Bubblewrap (`bwrap`); com Docker sem acesso ao socket, tenta `sudo docker` com aviso.
- `JAIL_MODE=auto|bare|podman|docker|bwrap` força o modo de execução.
- O modo `bwrap` sandboxa binários do host (user namespaces, sem sudo/daemon/imagem): filesystem mínimo somente leitura, `/home` invisível, sem rede por padrão. O comando precisa existir no host e a versão não é fixada — prefira podman/docker quando a imagem importa.
- `ALLOW_RUN_COMMANDS_IN_HOST=1` (atalho para `JAIL_MODE=bare`) pula o contêiner — use somente com autorização explícita do usuário.
- Padrões: imagem fixada, `--cap-drop=ALL`, `--security-opt=no-new-privileges`, rootfs somente leitura, tmpfs em `/tmp`, limites de pids/memória, `--network=none`.

Antes de executar qualquer comando:

1. Habilite rede ou portas apenas se a tarefa exigir (`JAIL_NETWORK`/`JAIL_PUBLISH`).
2. Troque a imagem (`JAIL_IMAGE`) em vez de instalar ferramentas no contêiner ou no host.
3. Mostre claramente qualquer operação destrutiva antes de executá-la.

## Exceções

Caso uma tarefa não possa ser realizada dentro de um contêiner:

- Não execute o comando diretamente no host.
- Explique qual limitação impede o uso de Docker ou Podman.
- Apresente o comando necessário apenas como instrução para revisão manual.
- Aguarde autorização explícita antes de qualquer ação que afete o host.
- Com autorização explícita, a execução no host pode ser feita via `ALLOW_RUN_COMMANDS_IN_HOST=1 ./jail-exec.sh COMANDO`, mantendo o fluxo único do runner.

A conveniência nunca deve prevalecer sobre o isolamento, a reprodutibilidade e o princípio de menor privilégio.
