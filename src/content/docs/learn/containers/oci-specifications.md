---
title: As especificações OCI
description: O que a OCI Image Spec, a Distribution Spec e a Runtime Spec padronizam cada uma, por que existem, e o que "compatível com OCI" realmente significa.
sidebar:
  order: 10
---

> **Para quem é:** quem já entende os [fundamentos de isolamento](../container-as-a-process/) e o [ciclo de vida de imagens](../image-lifecycle/), e quer saber o que exatamente a sigla "OCI" padroniza quando uma ferramenta se declara compatível com ela.

OCI (Open Container Initiative) é uma estrutura de governança sob a Linux Foundation que mantém, não uma especificação única, mas três especificações independentes entre si: Image, Distribution e Runtime. "Compatível com OCI" não é uma propriedade binária de uma ferramenta; é preciso perguntar com qual das três specs, porque uma ferramenta pode implementar uma sem implementar as outras.

## Breve histórico: de formato proprietário a especificação aberta

O formato de imagem e o modelo de execução de container do Docker se tornaram tão dominantes, nos anos seguintes ao lançamento do projeto, que outras ferramentas do ecossistema (outros engines, outros runtimes) precisavam de um formato comum para interoperar sem depender da implementação específica do Docker. A OCI foi fundada em 2015, sob a Linux Foundation, com o Docker e outras empresas do setor como membros fundadores, para formalizar como especificações abertas o que já era, na prática, o formato de imagem e o modelo de execução do Docker, permitindo que "uma imagem OCI" ou "um runtime OCI" pudessem ser tratados de forma intercambiável por qualquer ferramenta que implementasse a especificação correspondente, não só pelo Docker.

## OCI Image Specification: o formato da imagem

A Image Spec padroniza o conteúdo de uma imagem de container: um conjunto de camadas (cada uma um diff do sistema de arquivos, tipicamente um tarball), um arquivo de configuração (JSON descrevendo variáveis de ambiente, comando de entrada, usuário padrão, entre outros campos) e um manifesto que amarra as camadas e a configuração em uma unidade identificável por digest. Para imagens multi-plataforma, um índice de manifestos agrupa um manifesto por arquitetura/sistema operacional suportado sob um único digest de nível superior, o mesmo mecanismo já mencionado em [ciclo de vida de imagens](../image-lifecycle/#tags-digests-e-reprodutibilidade) ao tratar de tags e digests. A Image Spec não diz nada sobre como a imagem chega até um host nem como ela é executada; ela só define o que a imagem contém e como esse conteúdo é identificado.

## OCI Distribution Specification: como um registry fala com um cliente

A Distribution Spec padroniza a API HTTP que um registry expõe para enviar (`push`) e receber (`pull`) blobs e manifestos, o protocolo já citado em [registries de containers](../container-registries/) como o que todo registry OCI dedicado implementa. Qualquer cliente compatível com a Distribution Spec (`docker pull`, `podman pull`, `skopeo`) consegue falar com qualquer registry compatível com a mesma spec, independentemente de qual produto está por trás de cada lado dessa conversa. Esse desacoplamento é o que permite migrar de um registry para outro (de um SaaS para um Harbor self-hosted, por exemplo) sem precisar trocar o cliente nem reconfigurar como as imagens são referenciadas, além do endereço do registry em si.

## OCI Runtime Specification: o contrato que um runtime de baixo nível cumpre

A Runtime Spec padroniza um "bundle": um diretório contendo o filesystem raiz já extraído (não mais as camadas compactadas da imagem, já descompactadas em um diretório comum) e um arquivo `config.json` descrevendo exatamente como esse processo deve ser executado. Esse `config.json` é, na prática, uma descrição declarativa dos mesmos mecanismos já cobertos na trilha de fundamentos desta seção: quais namespaces criar, quais mounts aplicar (incluindo a base do que se tornou [isolamento de filesystem](../filesystem-isolation/)), quais capabilities conceder ou remover, qual processo executar e com qual usuário. Um runtime de baixo nível como `runc` ou `crun` lê esse `config.json` e faz exatamente as chamadas de sistema que as páginas anteriores desta seção descreveram (`clone` com as flags `CLONE_NEW*`, `pivot_root`, escrita nos arquivos de cgroup) para transformar essa descrição em um processo confinado de verdade.

```mermaid
flowchart LR
    accTitle: Da imagem OCI até o processo em execução
    accDescr: Uma imagem OCI é publicada em um registry via Distribution Spec, baixada e convertida em um bundle conforme a Runtime Spec, e então executada por um runtime de baixo nível que aplica os mecanismos de isolamento do kernel.

    Image["Imagem OCI<br/>(Image Spec)"] -->|"push/pull via"| Registry["Registry<br/>(Distribution Spec)"]
    Registry -->|"download"| Bundle["Bundle: rootfs + config.json<br/>(Runtime Spec)"]
    Bundle -->|"runc/crun aplica namespaces,<br/>cgroups, capabilities"| Process["Processo em execução"]
```

## O que "compatível com OCI" realmente significa

Uma ferramenta pode implementar uma, duas ou as três specs, de forma independente. Um registry só precisa da Distribution Spec para funcionar com qualquer cliente do ecossistema; um construtor de imagens (BuildKit, Buildah) precisa produzir saída conforme a Image Spec, mas não implementa a Distribution Spec nem a Runtime Spec diretamente; um runtime de baixo nível como `runc` implementa só a Runtime Spec, consumindo um bundle que outra camada (o runtime de alto nível, tratado na próxima página desta trilha) já preparou a partir de uma imagem. Quando uma ferramenta se anuncia como "compatível com OCI" sem especificar qual spec, vale conferir a documentação oficial dela para saber exatamente o que isso cobre, em vez de assumir as três de uma vez.

## Referências

- [Open Container Initiative — site oficial](https://opencontainers.org/): visão geral do projeto e das três especificações mantidas sob sua governança.
- [OCI Image Format Specification](https://github.com/opencontainers/image-spec): definição completa de camadas, configuração, manifestos e índices.
- [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec): definição da API HTTP de push/pull implementada por registries.
- [OCI Runtime Specification](https://github.com/opencontainers/runtime-spec): definição do formato de bundle e `config.json` consumido por runtimes de baixo nível.
