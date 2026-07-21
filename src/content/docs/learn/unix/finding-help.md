---
title: "Onde encontrar ajuda: man, info, help e o que type revela"
description: As oito seções das man pages, apropos para buscar por palavra-chave, info como alternativa de hipertexto do projeto GNU, help para builtins do shell, e por que type é a forma mais confiável de descobrir o que um comando realmente é, mais confiável que command -v ou which.
sidebar:
  order: 4
---

> **Para quem é:** quem já sabe que `man comando` existe, mas nunca soube por que às vezes `man` mostra a página errada, ou por que `which` às vezes mente sobre o que vai rodar de fato.

Esta é uma página curta e utilitária, não conceitual: o objetivo é saber, rapidamente, onde procurar ajuda sobre um comando desconhecido e como descobrir o que um nome de comando realmente executa, antes de recorrer a uma busca externa.

## Man pages e suas oito seções

As páginas de manual (`man`) são organizadas em seções numeradas, e o mesmo nome pode existir em mais de uma seção com significados completamente diferentes: `man printf` normalmente mostra a página do utilitário de shell (seção 1), não a função da linguagem C de mesmo nome (seção 3), a menos que a seção seja pedida explicitamente com `man 3 printf`.

| Seção | Conteúdo |
| --- | --- |
| 1 | Comandos executáveis (programas de usuário) |
| 2 | Chamadas de sistema (system calls do kernel) |
| 3 | Funções de biblioteca (ex.: funções da libc) |
| 4 | Arquivos especiais (normalmente em `/dev`) |
| 5 | Formatos de arquivo e convenções (ex.: `/etc/passwd`) |
| 6 | Jogos |
| 7 | Miscelânea (convenções, protocolos, pacotes) |
| 8 | Comandos de administração do sistema (tipicamente root) |

`man -k palavra-chave` (equivalente a `apropos palavra-chave`) busca por uma palavra-chave nas descrições curtas de todas as páginas de manual instaladas, útil quando o nome exato do comando não é conhecido, só o que ele deveria fazer.

## `info`: a alternativa de hipertexto do projeto GNU

`info comando` abre a documentação no formato Info do projeto GNU, um sistema de hipertexto navegável por teclado (nós ligados por referências cruzadas), historicamente usado pelo GNU como alternativa mais estruturada às man pages para documentação extensa, como a do próprio Bash ou do GCC. Nem todo comando tem uma página `info`; quando existe, ela costuma ser mais completa que a página `man` equivalente, especialmente para utilitários GNU com muitas opções.

## `help`: documentação de builtins do shell

`help comando` (um builtin do próprio Bash, não um programa externo) mostra a documentação de um **builtin** do shell, algo que `man` normalmente não cobre em detalhe porque builtins não são binários separados no sistema de arquivos. `cd`, `export`, `alias`, `type` (a próxima seção desta página) e o próprio `help` são exemplos de builtins: eles existem dentro do processo do shell, não como um arquivo executável independente, e por isso `man cd` costuma devolver a página genérica `bash(1)` ou nada relevante, enquanto `help cd` mostra exatamente a documentação daquele builtin.

## `type`, `command -v` e `which`: descobrindo o que um nome realmente é

Os três comandos parecem responder à mesma pergunta ("o que é `X`?"), mas têm confiabilidade diferente:

- **`type nome`** é a resposta mais completa e mais confiável: um builtin do shell que informa se `nome` é um builtin, uma função definida no shell atual, um alias, ou um binário externo (e, nesse último caso, qual caminho exato o `PATH` resolveria). É a ferramenta certa quando a dúvida é "por que esse comando está se comportando diferente do que eu esperava" (resposta comum: existe um alias ou uma função com o mesmo nome, sombreando o binário).
- **`command -v nome`** é a versão POSIX-padrão da mesma pergunta, com saída mais enxuta (só o caminho ou o nome, sem explicação), e por isso é a escolha certa dentro de um script (já usada na recipe de validação de dependência do [cookbook de Bash](../../../toolbox/snippets/bash/#função-com-validação-de-dependência)): `command -v` é builtin, funciona de forma consistente entre shells POSIX, e seu código de saída (zero se encontrado, diferente de zero se não) é o que scripts realmente precisam checar.
- **`which nome`** é um binário externo separado (não um builtin), e por isso o menos confiável dos três: `which` consulta o `PATH` de um jeito que pode não refletir exatamente o que o shell atual resolveria, não sabe nada sobre aliases ou funções definidas na sessão corrente (a fonte mais comum de "`which` disse uma coisa, mas rodar o comando fez outra"), e seu comportamento varia entre implementações de sistema para sistema, incluindo se ele existe por padrão. `type` e `command -v`, sendo builtins do próprio shell, sempre refletem o que aquele shell específico realmente vai executar.

## Builtins vs. binários: por que a distinção importa na prática

Um **builtin** roda dentro do próprio processo do shell, sem o custo de criar um novo processo (`fork`/`exec`); um **binário** é um arquivo executável separado no sistema de arquivos, localizado via `PATH`. A diferença não é só de performance: um builtin pode alterar o estado do próprio shell que o chamou (`cd` muda o diretório de trabalho do shell atual; um programa externo chamado `cd` não conseguiria fazer isso, porque um processo filho não pode alterar o estado do processo pai que o criou). É por isso que `cd` precisa ser builtin por necessidade técnica, não por escolha de design, e por que `type cd` sempre reporta "builtin", nunca um caminho de arquivo.

## Páginas relacionadas

- [Cookbook de Bash](../../../toolbox/snippets/bash/): a recipe de validação de dependência que usa `command -v` na prática.
- [Portabilidade de scripts shell](../shell-scripting-portability/): por que `command -v`, sendo builtin POSIX, é a escolha certa dentro de um script portável.

## Referências

- [man-pages(7) — man7.org](https://man7.org/linux/man-pages/man7/man-pages.7.html): a convenção das oito seções, mantida pelo projeto Linux man-pages.
- [GNU Info (documentação oficial)](https://www.gnu.org/software/texinfo/manual/info-stnd/info-stnd.html): o sistema de hipertexto Info e como navegar nele.
- [Bash Reference Manual: Bash Builtins (GNU)](https://www.gnu.org/software/bash/manual/bash.html#Bash-Builtins): lista completa de builtins, incluindo `type`, `command` e `help`.
