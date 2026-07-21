---
title: Shells e sistemas Unix-like
description: Trilha de leitura desta seção, dos shells e da portabilidade de scripts aos padrões que tornam Linux e BSD interoperáveis, e da família BSD às famílias de distribuições Linux.
sidebar:
  order: 0
---

> **Para quem é:** quem opera um host Linux todo dia e quer entender o que está por baixo do shell e dos comandos básicos, e como isso se compara ao mundo BSD.

Esta seção segue uma ordem deliberada: primeiro shells e a portabilidade de scripts entre eles (o que muda entre um shell interativo e um script, e entre Bash e um POSIX sh estrito), depois os utilitários que qualquer script chama por baixo (coreutils, e onde encontrar ajuda sobre eles), depois o padrão que amarra shell e utilitários entre sistemas diferentes (POSIX). A partir daí a trilha se abre para os dois mundos que compartilham essa base: a família BSD, com sua filosofia de base system integrado, e as famílias de distribuições Linux, cada uma com prioridades próprias de estabilidade, atualização e tamanho. Ler fora de ordem é possível, já que cada página linka o que assume como conhecido, mas a sequência abaixo é a que menos exige ir e voltar.

## Shells, scripts e utilitários

1. [Shells: interativo, login e o que POSIX garante](shells/) — o que um shell realmente é, os três modos de invocação, e Bash/Zsh/Fish em contraste.
2. [Portabilidade de scripts shell](shell-scripting-portability/) — shebang, bashisms comuns, as pegadinhas de `set -euo pipefail`, shellcheck, e diferenças GNU vs. BSD de `sed`/`awk`/`ps`.
3. [Coreutils e alternativas: GNU, BusyBox e uutils](coreutils-and-alternatives/) — GNU Coreutils, BusyBox em imagens minimalistas, a reimplementação uutils em Rust.
4. [Onde encontrar ajuda: man, info, help e o que type revela](finding-help/) — man pages e seções, `apropos`, e por que `type`/`command -v` são mais confiáveis que `which`.

## Padrões e famílias de sistema

1. [POSIX: o que o padrão garante, e o que fica de fora](posix-and-standards/) — o que a especificação realmente padroniza, e como interpretar "POSIX-compliant" numa ferramenta real.
2. [A família BSD: FreeBSD, OpenBSD, NetBSD e DragonFly BSD](bsd-family/) — base system integrado, o foco de cada projeto, e licenças BSD vs. GPL.
3. [O que faz uma distro: kernel + userland + empacotamento](linux-distributions/) — as famílias principais de distribuições Linux, e por que este notebook usa Debian/Ubuntu.
