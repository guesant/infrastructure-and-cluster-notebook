---
title: Testar conteúdo antes de publicar
description: Como validar uma página nova ou alterada — build, lint, links e os comandos em si — antes de abrir um PR.
sidebar:
  order: 3
---

"Testar documentação" aqui significa duas coisas separadas: o **site compila e não tem link
quebrado**, e **os comandos da página realmente fazem o que ela diz**. As duas são necessárias;
nenhuma substitui a outra.

## Build, lint e links

```bash
./jail-exec.sh bun run lint
./jail-exec.sh bun run build
```yaml

- `lint` roda `markdownlint-cli2` (Markdown) e `eslint` com `eslint-plugin-mdx` (MDX).
- `build` falha alto e claro em front matter inválido, import quebrado (`?raw` ou de
  componente) ou erro de sintaxe MDX — não falha silenciosamente. Se o build passou, isso não
  significa que os links internos estão certos (ver abaixo).
- Verificação de links quebrados (`lychee`) só roda no CI hoje, sobre o HTML gerado em `dist/`
  (ver [`.github/workflows/docs.yml`](https://github.com/guesant/infrastructure-and-cluster-notebook/blob/main/.github/workflows/docs.yml)).
  Para checar localmente antes de abrir o PR, rode o build e confira manualmente os links que a
  página adicionou ou moveu.

## Como confirmar que um componente interativo renderizou de verdade

`.md` engole `<ScriptHelper>`/`<FileWriter>` silenciosamente sem erro — o build passa mesmo
quando o componente não virou nada (ver [Decisões do projeto](../../project/decisions/)). Depois
de criar ou mover uma página com esses componentes:

1. Gere o build (`./jail-exec.sh bun run build`).
2. Confira se a página tem `<astro-island` no HTML gerado em `dist/<caminho-da-página>/index.html`
   — se não tiver, o componente não está renderizando de verdade, mesmo que o build tenha
   passado.
3. Suba o servidor local (`JAIL_PUBLISH=4321 ./jail-exec.sh bun run dev -- --host 0.0.0.0`) e
   confirme visualmente que os campos, abas e botões de copiar aparecem.

## Testar os comandos em si

O build não executa nenhum comando das páginas — só valida a estrutura do site. Testar se um
comando realmente faz o que a página promete é responsabilidade de quem escreve/revisa:

- Rode o comando em um ambiente descartável, nunca direto em produção.
- Confirme que o passo de "Validação" da página realmente confirma o resultado esperado — não
  só que o comando saiu sem erro.
- Se a página tem "Como remover ou desfazer", teste esse caminho também, não só o de ida.
- Scripts em `src/scripts/` passam por `shellcheck` — rode
  `JAIL_IMAGE=docker.io/koalaman/shellcheck:v0.10.0 ./jail-exec.sh --shell=bash -e SC2148 /workspace/src/scripts/<arquivo>.sh`
  antes de adicionar ou alterar um script.

## Antes de abrir o PR

- [ ] `./jail-exec.sh bun run lint` sem erros.
- [ ] `./jail-exec.sh bun run build` sem erros.
- [ ] Página com componente interativo: `<astro-island` confirmado no HTML gerado.
- [ ] Scripts novos/alterados: `shellcheck` limpo.
- [ ] Comando(s) da página testados em ambiente descartável, não só lidos.
