---
title: Troubleshooting genérico
sidebar:
  order: 7
---

## Executar último comando novamente

```bash
# Repetir último comando
!!

# Repetir último comando com sudo
sudo !!

# Último comando contendo "string"
!string

# Número específico do histórico
!123  # Roda comando #123
```yaml

**Quando usar:** fazer retry rápido, executar com privilégio.

**Considerações:**

- `!!` é alias para `!-1`.
- Cuidado com history expansion em scripts (use `set +H` para desabilitar).
- Histórico fica em `~/.bash_history`.

**Relacionado:**

- [Ver histórico de comandos](#ver-histórico-de-comandos)

---

## Ver histórico de comandos

```bash
# Últimos 20 comandos
history 20

# Limpar histórico
history -c

# Executar comando por número
!123

# Procurar no histórico
history | grep ssh
```yaml

**Quando usar:** encontrar comando que rodou antes, auditar.

**Considerações:**

- Histórico salvo em `~/.bash_history`.
- `history -c` limpa memória, não arquivo.
- Para limpar arquivo: `cat /dev/null > ~/.bash_history`.

**Relacionado:**

- [Executar último comando](#executar-último-comando-novamente)

---

## Redirecionar stderr e stdout

```bash
# Stdout para arquivo
command > output.txt

# Stderr para arquivo
command 2> errors.txt

# Ambos para mesmo arquivo
command &> output.txt
# ou
command > output.txt 2>&1

# Descartar output
command > /dev/null 2>&1
```yaml

**Quando usar:** capturar logs, silenciar comandos.

**Considerações:**

- `1`: stdout (padrão).
- `2`: stderr.
- `&>`: ambos (bash-específico).
- `> file 2>&1`: redirecionar stderr para stdout, então stdout para file.

**Relacionado:**

- [Pipelining](#pipelining-de-comandos)

---

## Pipelining de comandos

```bash
# Saída de um comando para entrada do próximo
command1 | command2

# Múltiplos pipes
cat file.txt | grep pattern | sort | uniq

# Usar output em múltiplos comandos
command | tee file.txt | less
```yaml

**Quando usar:** encadear transformações, filtrar dados.

**Considerações:**

- `|`: passa stdout de um para stdin do próximo.
- `tee`: escreve em arquivo **e** passa para stdout.
- `xargs`: converter stdin em argumentos.

**Relacionado:**

- [Redirecionar stderr/stdout](#redirecionar-stderr-e-stdout)

---

## Testar saída de comando

```bash
# Condicional IF
if command; then
  echo "Sucesso"
else
  echo "Falhou"
fi

# Verificar exit code
command
echo $?  # 0 = sucesso, não-zero = erro

# AND/OR lógico
command1 && command2  # Roda cmd2 só se cmd1 suceder
command1 || command2  # Roda cmd2 só se cmd1 falhar
```yaml

**Quando usar:** scripts, validações, error handling.

**Considerações:**

- Exit code 0 = sucesso, qualquer outro = erro.
- `&&` / `||` é shorthand para if/else.

**Relacionado:**

- [Redirecionar stderr/stdout](#redirecionar-stderr-e-stdout)

---

## Medir tempo de execução

```bash
# Tempo total
time command

# Apenas segundos reais
command && echo "Levou $(($SECONDS - $start_time))s"

# Com /usr/bin/time (mais detalhe)
/usr/bin/time -v command
```yaml

**Quando usar:** benchmarking, diagnosticar lentidão.

**Considerações:**

- `time`: mostra real, user, sys.
- `$SECONDS`: tempo desde bash iniciar (não preciso).
- `/usr/bin/time -v`: mostra memória, I/O, etc.

**Relacionado:**

- [Monitorar CPU/memória](#monitorar-cpumemória-em-tempo-real)

---

## Diff de dois comandos

```bash
# Diferença entre saída de dois comandos
diff <(command1) <(command2)

# Usando comm (mais eficiente se já são arquivo)
comm -3 <(sort file1) <(sort file2)
```yaml

**Quando usar:** comparar saída de dois estados, configs antes/depois.

**Considerações:**

- `<(...)`: process substitution (bash-específico).
- `comm`: mostra linhas unique de um arquivo, do outro, e comuns.

**Relacionado:**

- [Pipelining](#pipelining-de-comandos)

---

## Executar em paralelo (GNU parallel)

```bash
# Múltiplas iterações em paralelo
seq 1 100 | parallel "curl https://api.example.com?id={}"

# Ou com xargs
seq 1 100 | xargs -P 4 -I {} curl https://api.example.com?id={}
```yaml

**Quando usar:** speedup de tarefas independentes (testes, downloads, etc).

**Considerações:**

- `parallel`: mais simples, precisa instalação.
- `xargs -P N`: máximo N processos em paralelo.
- Cuidado com rate limiting do servidor.
