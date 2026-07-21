---
title: "Docker vs. Podman: critérios de escolha"
description: Daemon vs. daemonless, rootful vs. rootless na prática, o socket como superfície de risco, e compatibilidade de CLI — critérios para escolher, não um vencedor universal.
sidebar:
  order: 12
---

> **Para quem é:** quem já entende a [pilha de engine e runtime](../engines-and-runtimes/) e o [modelo rootless vs. rootful](../user-namespaces/#rootless-vs-rootful-na-prática), e precisa decidir qual dos dois usar em um host específico.

Docker Engine e Podman produzem o mesmo resultado final, um processo confinado a partir de uma imagem OCI, por arquiteturas diferentes: um com daemon central, o outro sem. Essa diferença arquitetural, não a lista de flags de cada CLI (quase idênticas), é o que deveria orientar a escolha.

## Comparação por critério

| Critério | Docker Engine | Podman |
| --- | --- | --- |
| Arquitetura | Daemon (`dockerd`) sempre em execução, delega a `containerd` | Sem daemon; cada comando roda, executa e termina, via `conmon` |
| Modo padrão | Rootful, salvo configuração explícita de `userns-remap` | Rootless por padrão, sem configuração adicional |
| Socket | Um daemon root exposto via socket Unix; acesso ao socket equivale a acesso root ao host | Sem socket root central por padrão; uma API remota opcional existe, com modelo de exposição próprio |
| Integração com systemd | Possível, mas exige gerar as units manualmente | Suporte nativo (`podman generate systemd`, ou Quadlet em versões recentes) |
| Compose | Plugin `docker compose` (v2), mantido pela própria Docker Inc. | `podman-compose` (projeto separado da comunidade) ou compatibilidade via `podman machine` |
| Compatibilidade de CLI | Referência histórica do formato de comando | Compatibilidade extensa e deliberada com a sintaxe do `docker` |

## Daemon vs. daemonless na prática

Um daemon central significa mais um processo para manter atualizado, monitorado e reiniciado quando necessário, mas também um ponto único onde toda a atividade de containers do host passa, o que simplifica auditoria centralizada em ambientes que já esperam esse modelo. Sem daemon, cada `podman run` é só mais um processo filho de quem o invocou (via `conmon`, como já detalhado em [engines e runtimes](../engines-and-runtimes/#engine-docker-engine-e-podman)): não há serviço para reiniciar ou atualizar separadamente, mas também não há um ponto central único para auditar toda a atividade de containers do host de uma vez, exceto compondo os logs de cada invocação individual.

## Rootful vs. rootless na prática

O mapeamento de UID/GID entre rootful e rootless já foi detalhado em [user namespaces](../user-namespaces/#rootless-vs-rootful-na-prática); o que muda entre Docker e Podman é o esforço para chegar lá. Podman roda rootless por padrão, sem nenhuma configuração adicional: um usuário comum já executa containers com o modelo de user namespace mais contido, sem precisar de nenhum passo extra. Docker também suporta rootless, mas como um modo de instalação separado (`dockerd-rootless`), que substitui a instalação padrão rootful em vez de ser um comportamento padrão; adotar rootless no Docker é uma decisão de instalação deliberada, não o caminho de menor esforço.

## O socket como superfície de risco

O socket do Docker Engine é, na prática, uma interface de administração completa do host: qualquer processo com acesso de escrita a ele pode pedir um container montando qualquer caminho do host e rodando como root, sem precisar de mais nenhuma credencial. É exatamente por isso que este repositório proíbe montar esse socket em qualquer execução automatizada sem autorização explícita, uma regra citada com o mesmo raciocínio em [user namespaces](../user-namespaces/#rootless-vs-rootful-na-prática). Podman, sem um daemon root central, não tem um socket equivalente exposto por padrão; a API remota do Podman é opcional, precisa ser habilitada explicitamente, e mesmo assim herda o modelo rootless do usuário que a expõe, em vez de sempre equivaler a root do host.

## Compatibilidade de CLI

Podman foi desenhado deliberadamente para aceitar a mesma sintaxe de comando do `docker`: `podman run`, `podman ps`, `podman build` e a grande maioria das flags se comportam de forma equivalente, o que torna `alias docker=podman` uma prática comum e geralmente segura para uso interativo do dia a dia. Essa compatibilidade não é absoluta: recursos específicos do ecossistema de plugins do Docker, ou comportamentos particulares do Docker Compose v2, podem não ter equivalente 1:1 no Podman; confirme um fluxo específico antes de assumir paridade completa em automação que dependa de um comportamento exato, em vez de só do resultado observável do comando.

## Quando Docker tende a ser mais direto

Times já padronizados em torno do ecossistema Docker (imagens de terceiros com instruções assumindo `docker`, integrações de CI que esperam o socket do Docker disponível, ferramentas de desenvolvimento que só suportam Docker Desktop) tendem a ter menos atrito seguindo com Docker Engine, evitando reconciliar diferenças de comportamento com uma ferramenta compatível, mas não idêntica.

## Quando Podman tende a ser mais adequado

Ambientes onde rodar sem um daemon root permanente é um requisito de segurança, ou onde a integração nativa com `systemd` (rodar um container como uma unit gerenciada pelo próprio init do sistema) é desejada sem trabalho manual adicional, tendem a se beneficiar mais do modelo do Podman. O mesmo vale para hosts de administrador único, sem necessidade de um daemon compartilhado entre múltiplos usuários do sistema.

## O que não muda com a escolha

As duas ferramentas consomem [imagens OCI](../oci-specifications/#oci-image-specification-o-formato-da-imagem) e falam com [registries](../container-registries/) da mesma forma, porque ambas implementam os mesmos padrões abertos; migrar de uma para outra não exige reconstruir imagens nem trocar de registry. No fim da pilha, as duas terminam invocando o mesmo tipo de runtime de baixo nível (`runc` ou `crun`), então o comportamento de isolamento de kernel que um container recebe (namespaces, cgroups, capabilities) não muda pela escolha do engine, só a forma como esse engine chega até lá.

## Páginas relacionadas

- [Engines, runtimes e a pilha de camadas](../engines-and-runtimes/), para a diferença arquitetural completa entre os dois caminhos.
- [User namespaces: rootless vs. rootful](../user-namespaces/), para o mecanismo de mapeamento de UID/GID por trás do modo padrão de cada ferramenta.

## Referências

- [Docker Engine: documentação oficial](https://docs.docker.com/engine/): arquitetura do daemon e configuração de `userns-remap`.
- [Podman: documentação oficial](https://docs.podman.io/en/latest/): arquitetura sem daemon, modo rootless por padrão e geração de units systemd.
- [Podman: Basic Setup and Use](https://podman.io/docs): compatibilidade de comandos com o Docker CLI.
