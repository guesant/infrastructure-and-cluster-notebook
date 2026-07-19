---
title: Adicionar uma página nova
description: Passo a passo para criar uma página nova — que tipo escolher, qual template copiar, onde ela entra na navegação.
sidebar:
  order: 4
---

## 1. Escolha o tipo de conteúdo

Veja [Política de conteúdo](../../project/content-policy/) para a definição de cada seção
(`learn/`, `guides/blueprints/`, `guides/tasks/`, `operations/`, `toolbox/`, `technologies/`,
`resources/`, `reference/`). Se a página parece caber em duas seções ao mesmo tempo, ela
provavelmente deveria ser duas páginas.

## 2. Copie o template correspondente

Os templates ficam em
[`templates/page-types/`](https://github.com/guesant/infrastructure-and-cluster-notebook/tree/main/templates/page-types)
(fora de `src/content/docs/` — não são publicados). O
[`README.md`](https://github.com/guesant/infrastructure-and-cluster-notebook/blob/main/templates/page-types/README.md)
de lá tem a tabela completa de qual template usar para cada tipo.

```bash
cp templates/page-types/guide-task.mdx src/content/docs/guides/tasks/<domínio>/<nome-do-arquivo>.mdx
```yaml

Preencha os campos entre `<...>` e apague as seções que não se aplicarem.

## 3. Escolha `.md` ou `.mdx`

Use `.mdx` se a página tiver `<ScriptHelper>`, `<FileWriter>` ou qualquer outro componente
interativo. Use `.md` se for só texto/markdown puro. Usar `.md` com um componente dentro não dá
erro nenhum — só faz o componente sumir silenciosamente (ver
[Decisões do projeto](../../project/decisions/)), então na dúvida use `.mdx`.

## 4. Escreva seguindo o estilo do site

Ver [Estilo de escrita](../documentation-style/) — tom, formatação, convenção de componentes.

## 5. Posicione na navegação

A sidebar (`astro.config.mjs`) usa `autogenerate` por pasta na maioria das seções — colocar o
arquivo na pasta certa já é suficiente para ele aparecer, na ordem definida por
`sidebar.order` no frontmatter (menor primeiro; páginas sem `order` vão por ordem alfabética
depois das que têm). Só mexa em `astro.config.mjs` diretamente se estiver criando uma subseção
nova (uma pasta que ainda não tem grupo na sidebar).

## 6. Teste antes de abrir o PR

Ver [Testar conteúdo antes de publicar](../testing-content/) — build, lint, confirmação visual de
componentes interativos, e teste dos comandos em si.

## 7. Linke a partir de páginas relacionadas

Uma página nova isolada, sem nada apontando para ela, é difícil de descobrir. Adicione um link a
partir de pelo menos uma página existente relacionada (o blueprint que usa este task guide, o
checklist que referencia esta operação, etc.) — é um dos critérios de
[página concluída](../../project/content-policy/#o-que-torna-uma-página-concluída).
