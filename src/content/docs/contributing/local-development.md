---
title: Executar a documentação localmente
description: Como rodar, validar e visualizar o site Astro Starlight sem instalar Node.js na máquina.
sidebar:
  order: 1
---

O site é gerado com [Astro](https://astro.build/) e [Starlight](https://starlight.astro.build/),
com [Bun](https://bun.sh/) como runtime e gerenciador de pacotes. Como o restante do projeto
(ver `AGENTS.md`/`CLAUDE.md` na raiz do repositório), nenhum comando roda direto na máquina host:
tudo passa pelo runner [`jail-exec.sh`](https://github.com/guesant/infrastructure-and-cluster-notebook/blob/main/jail-exec.sh),
que detecta Podman ou Docker automaticamente e executa dentro de um container com privilégio
mínimo.

## Via `jail-exec.sh`

```bash
# Instala as dependências (necessário antes das outras recipes; precisa de rede)
JAIL_NETWORK=1 ./jail-exec.sh bun install

# Sobe o servidor de desenvolvimento com live reload, publicado em 127.0.0.1:4321
JAIL_PUBLISH=4321 ./jail-exec.sh bun run dev -- --host 0.0.0.0

# Gera o build de produção em dist/
./jail-exec.sh bun run build

# Roda o lint (Markdown + MDX)
./jail-exec.sh bun run lint
```yaml

A imagem padrão (`jail`) não tem `git`; o build local não preenche a data de última revisão de
cada página (`lastUpdated`, baseada no histórico do Git) por esse motivo — isso só acontece no
CI, que usa a imagem `ci` (com `git`) e faz checkout com histórico completo.

## Via Dev Container

Para quem prefere abrir o projeto num ambiente já pronto (VS Code Dev Containers ou GitHub
Codespaces), o repositório inclui
[`.devcontainer/code/devcontainer.json`](https://github.com/guesant/infrastructure-and-cluster-notebook/blob/main/.devcontainer/code/devcontainer.json).
Ao abrir o repositório no Dev Container, as dependências são instaladas automaticamente
(`bun install --frozen-lockfile`) e a porta `4321` já fica encaminhada — basta rodar
`bun run dev` dentro do container.

## Estrutura do conteúdo

- O conteúdo das páginas fica em `src/content/docs/`, organizado por categoria (uma pasta por
  seção da barra lateral).
- Componentes reutilizáveis ficam em `src/components/`.
- A navegação da barra lateral é definida em `astro.config.mjs`; a maioria das seções usa
  `autogenerate`, então basta adicionar um arquivo `.md`/`.mdx` na pasta correta para que ele
  apareça automaticamente, na ordem definida pelo campo `sidebar.order` do frontmatter.

## Antes de abrir um PR

Rode `./jail-exec.sh bun run lint` e `./jail-exec.sh bun run build` — os mesmos passos do
workflow [`Documentação`](https://github.com/guesant/infrastructure-and-cluster-notebook/blob/main/.github/workflows/docs.yml),
que também roda a verificação de links quebrados (`lychee`) sobre o HTML gerado. Todos rodam
automaticamente no CI a cada push ou pull request que altere a documentação — rodar localmente
antes só evita descobrir o problema depois de abrir o PR.
