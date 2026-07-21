---
title: Containers
description: Trilha de leitura desta seção, dos fundamentos de isolamento do kernel ao ciclo de vida e distribuição de imagens.
sidebar:
  order: 0
---

> **Para quem é:** quem quer entender como um container funciona de verdade, não só como operá-lo pela linha de comando.

Esta seção segue uma ordem deliberada: primeiro os fundamentos de isolamento do kernel (o que faz um processo comum se comportar como um container), depois o ciclo de vida e a distribuição de imagens (o que é montado dentro desse isolamento, e de onde vem). Ler fora de ordem é possível, já que cada página linka o que assume como conhecido, mas a sequência abaixo é a que menos exige ir e voltar.

## Fundamentos de isolamento

1. [Um container é um processo](container-as-a-process/) — a página âncora: por que um container não é uma VM pequena, visto do host e de dentro dele.
2. [Namespaces do kernel](namespaces/) — os oito tipos de namespace e o que cada um isola.
3. [User namespaces: rootless vs. rootful](user-namespaces/) — mapeamento de UID/GID e o que "root dentro do container" significa em cada modo.
4. [Cgroups: limites e contabilização de recursos](cgroups/) — controllers de CPU, memória, PIDs e I/O, e a relação com o OOM killer.
5. [Capabilities, seccomp e LSMs](capabilities-seccomp-lsm/) — três mecanismos independentes que restringem o que um processo confinado pode fazer.
6. [Isolamento de filesystem](filesystem-isolation/) — `pivot_root`, rootfs somente leitura, `tmpfs` e camadas de imagem em copy-on-write.
7. [Observando containers de fora](observing-containers/) — `strace`, `lsns`, `nsenter` e `bubblewrap` aplicados a um container real.

## Imagem e distribuição

1. [Ciclo de vida de imagens](image-lifecycle/) — tags, digests, reprodutibilidade, atualização e rollback de um workload em produção.
2. [Registries de containers](container-registries/) — panorama de registries OCI e gerenciadores universais de artefatos, com critérios de escolha.

## Próximas seções

O ecossistema de ferramentas em torno desses fundamentos (engines como Docker e Podman, runtimes como containerd e runc, a Compose Specification) ainda não tem página própria nesta seção; quando existir, esta trilha ganha uma terceira parte específica para isso.
