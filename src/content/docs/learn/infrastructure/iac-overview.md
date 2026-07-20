---
title: "Infraestrutura como código: Terraform, OpenTofu, Pulumi"
description: Explica o que Infraestrutura como Código resolve e compara Terraform, OpenTofu e Pulumi para provisionar máquinas e infraestrutura de nuvem.
sidebar:
  order: 1
---

> **Para quem é:** operadores que querem provisionar máquinas e infraestrutura, não apenas aplicações dentro de um cluster já existente, a partir de código versionado.

Infraestrutura como Código (IaC) descreve máquinas, redes, firewalls e storage como código versionado, em vez de cliques em um console. Sem isso, recriar um ambiente depende de lembrar (ou documentar à parte) uma sequência de passos manuais feitos meses antes; com IaC, a mesma definição declarativa recria o ambiente de forma reproduzível.

```hcl
resource "aws_instance" "k3s_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
}
```

## Terraform: a abordagem mais adotada

Terraform declara infraestrutura em HCL (HashiCorp Configuration Language) e mantém um arquivo de estado que rastreia o que já foi criado, permitindo calcular a diferença entre o estado desejado e o real antes de aplicar qualquer mudança (`plan`, `apply`, `destroy`). Módulos permitem reutilizar definições entre ambientes, e o catálogo de providers cobre praticamente qualquer nuvem, além de Kubernetes e Helm diretamente.

Terraform é a escolha mais segura quando o ambiente é multi-nuvem, quando a equipe já tem experiência com HCL, ou quando o volume de exemplos e módulos prontos da comunidade (o Terraform Registry) reduz o tempo de implementação. O arquivo de estado é também o ponto mais crítico da ferramenta: perdê-lo ou corrompê-lo sem um backup separa a definição declarativa do que realmente existe na nuvem, e a sintaxe HCL, por ser específica da ferramenta, não se aproveita de laços e condicionais de uma linguagem de programação geral.

## OpenTofu: o fork open-source

OpenTofu nasceu como um fork do Terraform depois de uma mudança na licença da HashiCorp, mantendo compatibilidade total com a sintaxe HCL existente: é um substituto direto (`terraform` vira `tofu`) para quem já tem módulos e conhecimento em Terraform. A diferença está na governança, comunitária em vez de controlada por uma única empresa, o que importa principalmente para quem quer evitar o risco de uma futura mudança de licença repetir o mesmo problema.

## Pulumi: infraestrutura programática

Pulumi descreve infraestrutura em linguagens de programação de propósito geral (Python, Go, TypeScript, entre outras), usando os mesmos providers de nuvem que o Terraform e um backend de estado com o mesmo papel. A vantagem central é ter acesso a laços, condicionais e funções reais da linguagem escolhida, em vez das construções limitadas do HCL, o que compensa quando a infraestrutura tem lógica genuinamente complexa (geração condicional de recursos, por exemplo) ou quando a equipe já é formada por desenvolvedores de software, não apenas operadores. Em troca, Pulumi é menos maduro em produção do que Terraform e tem uma comunidade menor, com menos exemplos prontos para consultar.

## Comparação

| Aspecto | Terraform | OpenTofu | Pulumi |
| --- | --- | --- | --- |
| Linguagem | HCL | HCL | Python, Go, TypeScript, entre outras |
| Suporte multi-nuvem | Sim | Sim | Sim |
| Curva de aprendizado | Média, sintaxe própria | Média, sintaxe própria | Suave para quem já programa na linguagem escolhida |
| Lógica complexa | Limitada pelo HCL | Limitada pelo HCL | Nativa da linguagem |
| Suporte comercial | HashiCorp | Comunidade | Pulumi Inc. |
| Tamanho da comunidade | Maior | Crescente | Menor |

## Gerenciamento do estado

Terraform e Pulumi dependem de um arquivo de estado para saber o que já foi provisionado. Mantê-lo localmente (`terraform.tfstate` no disco) significa perder todo o rastro de infraestrutura se esse disco falhar; um backend remoto com lock (um bucket S3 com DynamoDB para o lock, ou um serviço gerenciado como Terraform Cloud ou Pulumi Cloud) evita esse risco e também permite que mais de uma pessoa aplique mudanças sem corromper o estado por uma corrida entre duas execuções simultâneas. Um backend remoto é a configuração recomendada para qualquer ambiente além de um experimento local descartável.

## Módulos

```hcl
module "k3s_cluster" {
  source = "./modules/k3s"

  instance_type = "t3.medium"
  count         = 3
}
```

Um módulo encapsula uma definição de infraestrutura reutilizável (neste exemplo, o conjunto de máquinas de um cluster K3s) para que múltiplos ambientes ou clusters a reaproveitem sem duplicar a definição completa.

## Decisão prática

Comece por Terraform quando o ambiente for multi-nuvem, quando o tamanho da comunidade e a disponibilidade de módulos prontos importarem, ou quando a infraestrutura for simples a moderadamente complexa. Considere Pulumi quando a infraestrutura exigir lógica genuinamente complexa ou quando a equipe já tiver expertise em engenharia de software mais do que em HCL especificamente. Escolha OpenTofu quando o risco de lock-in de licença com a HashiCorp for uma preocupação real, já que o conhecimento em Terraform se transfere diretamente.

## Referências

- [Terraform: documentação oficial](https://www.terraform.io/docs/): guia oficial.
- [OpenTofu: documentação oficial](https://opentofu.org/docs/): fork open-source do Terraform.
- [Pulumi: documentação oficial](https://www.pulumi.com/docs/): infraestrutura como código programática.
