---
title: "Portabilidade de scripts shell: shebang, bashisms e as pegadinhas de set -e"
description: A diferença real entre #!/bin/sh e #!/bin/bash, os bashisms mais comuns que quebram um script em outro sistema, as pegadinhas de set -euo pipefail que shellcheck existe para pegar, e as diferenças de sed/awk/ps entre GNU e BSD que quebram scripts supostamente portáveis.
sidebar:
  order: 2
---

> **Para quem é:** quem já entende a distinção entre shell interativo e shell de scripting (a página anterior desta trilha) e precisa escrever um script que continue funcionando fora da própria máquina onde foi escrito.

Um script que roda perfeitamente na máquina de quem o escreveu e falha, de forma obscura, num container Alpine ou num servidor FreeBSD não é azar: é o sintoma mais comum de assumir, sem verificar, que todo sistema Unix-like tem o mesmo shell e os mesmos utilitários por trás dos mesmos nomes de comando. Esta página cobre as quatro fontes mais comuns dessa quebra: a linha de shebang errada, bashisms usados sem perceber, más interpretações de `set -euo pipefail`, e diferenças reais de comportamento entre as implementações GNU e BSD dos utilitários mais usados em scripts.

## O shebang decide o intérprete, não uma formalidade

A primeira linha de um script (`#!/caminho/para/intérprete`) diz ao kernel exatamente qual programa deve interpretar o resto do arquivo; não é decoração, é a diferença entre o script rodar com os recursos de POSIX sh puro ou com todas as extensões do Bash disponíveis. `#!/bin/sh` compromete o script a rodar sob qualquer shell que o sistema tenha registrado como `/bin/sh` (Dash no Debian/Ubuntu, o próprio Bash em modo de compatibilidade em outras distribuições, `ash` em imagens Alpine baseadas em BusyBox), o que significa que nenhuma extensão do Bash pode ser usada, mesmo que o sistema onde o script foi escrito tenha Bash instalado como `/bin/sh`. `#!/bin/bash` (ou, de forma mais portável entre distribuições, `#!/usr/bin/env bash`, que procura `bash` no `PATH` em vez de assumir um caminho fixo) declara a dependência real: o script usa Bash e vai falhar, na melhor das hipóteses com um erro de sintaxe, se executado onde só existe um `sh` mínimo.

Declarar `#!/bin/sh` e depois usar sintaxe de Bash dentro do script é o erro mais comum e mais silencioso desta lista: o script roda sem problema em qualquer sistema onde `/bin/sh` aponta para Bash (comportamento comum, mas não garantido), e só quebra quando alguém tenta rodá-lo num sistema onde `/bin/sh` é de fato um interpretador POSIX estrito, como Dash. Nesse ponto o script já está em produção há tempo suficiente para que ninguém lembre que ele nunca foi testado fora do ambiente original.

## Bashisms comuns: sintaxe que parece POSIX mas não é

**Bashisms** são construções de sintaxe que funcionam em Bash (e frequentemente também em Zsh) mas não existem no padrão POSIX sh, e por isso quebram silenciosamente ou com erro obscuro quando um script declarado `#!/bin/sh` roda sob Dash ou outro `sh` estrito.

| Construção (bashism) | Equivalente POSIX |
| --- | --- |
| `[[ "$a" == "$b" ]]` | `[ "$a" = "$b" ]` |
| `local var=valor` dentro de função | Não existe em POSIX sh puro; comportamento varia por implementação |
| Arrays: `arr=(a b c)`, `"${arr[@]}"` | Não existem em POSIX sh; exigem um shell com extensões |
| `$(( a ** b ))`, `((...))` para aritmética | `$((a * a))` repetido, ou `expr`, dependendo da operação |
| `source arquivo` | `. arquivo` (o ponto é o operador POSIX; `source` é um alias do Bash) |
| `${VAR^^}` / `${VAR,,}` (maiúsculas/minúsculas) | `tr '[:lower:]' '[:upper:]'` |
| `echo -e` para interpretar `\n` | `printf` (comportamento de `echo` varia até entre shells) |

A diferença mais traiçoeira da tabela é `[[ ]]` vs `[ ]`: os dois se parecem tanto visualmente que é fácil escrever `[[ ]]` num script `#!/bin/sh` sem perceber, porque a maioria dos editores não avisa, e porque `[[ ]]` funciona perfeitamente enquanto alguém testa o script no próprio terminal Bash. `shellcheck`, coberto na próxima seção, é a ferramenta que pega exatamente esse tipo de divergência entre o shebang declarado e a sintaxe realmente usada.

## `set -euo pipefail`: o que cada flag garante, e o que nenhuma delas garante

`set -euo pipefail` é citado com tanta frequência como "modo seguro" que é fácil assumir que ele torna um script à prova de falha silenciosa. Cada flag cobre um caso específico, e todas juntas ainda deixam brechas reais:

- **`-e`** encerra o script no primeiro comando que retornar código de saída diferente de zero. A pegadinha: `-e` não se aplica a um comando que já está sendo testado por uma condição (`if comando; then`, `comando || echo falhou`, `comando && continua`), porque nesses contextos o código de saída é explicitamente examinado, não ignorado; e não se aplica ao último comando de um pipeline (`|`) coberto sozinho, o motivo pelo qual `-o pipefail` existe separadamente.
- **`-u`** trata o uso de uma variável não definida como erro fatal, em vez de expandir para uma string vazia silenciosamente. A pegadinha: `$1`, `$2` (parâmetros posicionais) contam como "não definidos" quando o script recebe menos argumentos do que o esperado, então `-u` também torna acesso a um argumento ausente um erro fatal, um comportamento desejável, mas que surpreende quem espera que `$2` vazio simplesmente vire uma string vazia.
- **`-o pipefail`** faz o código de saída de um pipeline inteiro (`comando1 | comando2 | comando3`) refletir o primeiro comando que falhar, não só o último. Sem essa flag, `comando_que_falha | grep algo` sempre retorna o código de saída do `grep`, mascarando a falha real do primeiro comando. A pegadinha: `pipefail` é uma extensão de Bash/Zsh, não existe em POSIX sh puro, então um script `#!/bin/sh` não pode usar essa flag mesmo que precise dela, mais um motivo pelo qual scripts que dependem de `pipefail` devem ser honestamente `#!/bin/bash`, não `#!/bin/sh`.

Nenhuma das três flags protege contra um comando dentro de uma substituição de comando usada como valor (`var=$(comando_que_falha)` sem checar `$?` depois, quando o resultado é usado como parte de outra expressão que não propaga a falha), nem contra funções que capturam erros internamente com seu próprio `||`/`if`. `set -euo pipefail` reduz a superfície de falha silenciosa; não a elimina.

## shellcheck: a ferramenta que encontra o que a leitura manual não pega

`shellcheck` é um analisador estático de scripts shell que identifica bashisms usados sob um shebang POSIX, variáveis não citadas (uma fonte comum de bugs com espaços em nomes de arquivo), pipelines onde `pipefail` provavelmente deveria estar, e dezenas de outros padrões conhecidos por causar comportamento inesperado. Rodar `shellcheck` sobre um script é a forma prática de verificar a promessa que o shebang faz: se o shebang diz `#!/bin/sh`, `shellcheck` sinaliza qualquer bashism usado dentro do script, incluindo os da tabela anterior, antes que isso vire um bug descoberto em produção, num sistema onde `/bin/sh` não é Bash. Este notebook já roda `shellcheck` contra seus próprios scripts como parte da validação de CI; a prática recomendada aqui é a mesma para qualquer script novo: rodar `shellcheck` localmente, dentro de um container com a imagem oficial da ferramenta, antes de considerar o script pronto.

## Diferenças GNU vs. BSD: os mesmos comandos, comportamentos diferentes

Os nomes `sed`, `awk` e `ps` existem tanto em sistemas Linux (normalmente as versões GNU) quanto em sistemas BSD (FreeBSD, OpenBSD, macOS, que usa uma base BSD para seus utilitários), mas "mesmo nome de comando" não significa "mesmas flags aceitas". Um script testado só em Linux frequentemente usa uma flag específica do GNU sem perceber, e quebra completamente ao rodar num sistema BSD.

O exemplo mais citado, e o que mais pega desenvolvedores de surpresa, é `sed -i` (edição no próprio arquivo): no GNU sed, `sed -i 's/a/b/' arquivo.txt` funciona diretamente; no BSD sed (incluindo o `sed` padrão do macOS), a mesma flag exige um argumento explícito para o sufixo de backup, mesmo que esse argumento seja uma string vazia: `sed -i '' 's/a/b/' arquivo.txt`. Rodar a versão GNU num sistema BSD trata `'s/a/b/'` como o argumento do sufixo de backup e a lista de arquivos como o script `sed` de verdade, produzindo um erro confuso em vez de um aviso claro sobre a flag incompatível.

`awk` tem uma superfície de compatibilidade maior entre implementações, porque a maior parte do que scripts comuns usam é coberta pelo padrão POSIX; a divergência aparece nas extensões específicas do GNU awk (`gawk`), como `gensub()` (substituição com grupos de captura, sem o efeito colateral de modificar a variável original que `sub()`/`gsub()` têm) ou certas funções de manipulação de array, que simplesmente não existem no `awk`/`nawk` que vem por padrão num sistema BSD.

`ps` diverge na própria gramática de flags: GNU `ps`, no Linux, aceita tanto a sintaxe estilo BSD sem hífen (`ps aux`) quanto a sintaxe estilo UNIX System V com hífen (`ps -ef`), porque foi desenhado para aceitar as duas por compatibilidade. Um `ps` BSD nativo (não o `ps` do Linux, que já é híbrido) só entende a sintaxe BSD original; um script que mistura as duas convenções assumindo que "todo `ps` aceita `-ef`" quebra num BSD real.

## `jail-exec.sh` como estudo de caso de script portável

O runner `jail-exec.sh` deste próprio repositório ilustra boa parte das práticas descritas nesta página aplicadas a um script real, não hipotético. Ele declara `#!/usr/bin/env bash` (não `#!/bin/sh`), uma escolha honesta: o script usa `[[ ]]`, arrays (`bwrap_args+=(...)`, `compose_cmd=(...)`) e `BASH_SOURCE`, todos bashisms da tabela anterior, então declarar um shebang POSIX seria uma promessa falsa. Logo na terceira linha, `set -euo pipefail` está presente, e o restante do script depende dessa garantia para encerrar cedo se qualquer verificação de pré-requisito (presença de `podman`/`docker`/`bwrap`, existência do Containerfile) falhar, em vez de continuar executando com um estado inconsistente. O próprio uso de `command -v "$mode" >/dev/null 2>&1` para verificar se um binário existe, em vez de tentar executá-lo direto e capturar a falha depois, é o tipo de checagem defensiva que evita um erro mais confuso mais adiante no script.

O ponto mais relevante para portabilidade, porém, não é sintático: é a própria função `ensure_image`, que constrói e usa uma imagem de container para rodar comandos, o que sidestepa completamente a questão de "esse `sed`/`awk`/`ps` é GNU ou BSD" ao garantir que os comandos dentro do container sempre rodam sobre uma imagem Linux específica e fixada, independente de o host ser Linux, macOS ou outro Unix-like. Um script que precisa de comportamento GNU específico e não pode garantir isso no host tem, nesse padrão de containerizar a execução, uma saída mais confiável do que tentar escrever `sed`/`awk` de um jeito que funcione em todas as variantes ao mesmo tempo.

## Páginas relacionadas

- [Shells: interativo, login e o que POSIX garante](../shells/): a base conceitual de POSIX sh, Bash e Fish que esta página assume.
- [Coreutils e alternativas: GNU, BusyBox e uutils](../coreutils-and-alternatives/): mais diferenças práticas de flags entre GNU e BSD, além de `sed`/`awk`/`ps`.
- [Cookbook de Bash](../../../toolbox/snippets/bash/): recipes práticas, incluindo `set -euo pipefail` e `trap` para limpeza garantida.

## Referências

- [POSIX.1-2024 (Open Group Base Specifications)](https://pubs.opengroup.org/onlinepubs/9799919799/): a especificação formal do Shell Command Language, base do que `#!/bin/sh` garante.
- [Bash Reference Manual (GNU): The Set Builtin](https://www.gnu.org/software/bash/manual/bash.html#The-Set-Builtin): comportamento exato de `-e`, `-u` e `pipefail`.
- [ShellCheck (documentação oficial)](https://www.shellcheck.net/): lista de verificações (wiki de cada código `SC####`) e como interpretar cada aviso.
- [GNU sed vs. BSD sed: sed(1) — man pages comparadas](https://www.gnu.org/software/sed/manual/sed.html): documentação oficial do GNU sed, incluindo a flag `-i`.
