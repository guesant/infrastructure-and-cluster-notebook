# cluster-management-notes

[![Documentação](https://github.com/guesant/cluster-management-notes/actions/workflows/docs.yml/badge.svg)](https://github.com/guesant/cluster-management-notes/actions/workflows/docs.yml)
[![Qualidade dos workflows](https://github.com/guesant/cluster-management-notes/actions/workflows/actions-quality.yml/badge.svg)](https://github.com/guesant/cluster-management-notes/actions/workflows/actions-quality.yml)

Minhas anotações sobre como criar e operar clusters K3s de nó único (*single-node*) ou multinó (*multi-node*), reunindo conceitos, melhores práticas, guias passo a passo e scripts reutilizáveis.

## Documentação

- [Site publicado](https://guesant.github.io/cluster-management-notes/)
- [Início do guia](docs/index.md)
- [Configuração dos hosts](docs/hosts.md)
- [Gestão dos nós K3s](docs/k3s.md)
- [Ferramentas de linha de comando](docs/command-line-tools.md)
- [Serviços básicos](docs/core-services.md)
- [Templates copiáveis](docs/templates.md)
- [Checklist operacional](docs/operational-checklist.md)

## Validar a documentação com Docker

O build usa a imagem definida em [`.github/docker/mkdocs/Dockerfile`](.github/docker/mkdocs/Dockerfile) e não instala dependências na máquina. Para validar e gerar o site em `site/`:

```bash
just docs-build
```

Para visualizar o site em `http://localhost:8000`:

```bash
just docs-serve
```

O deploy ocorre pelo workflow [`.github/workflows/docs.yml`](.github/workflows/docs.yml) após alterações na documentação entrarem na branch `main`.

Antes da primeira publicação, selecione **GitHub Actions** em **Settings → Pages → Build and deployment → Source**. O workflow não usa uma branch `gh-pages`: ele envia e publica o artefato estático pela API do GitHub Pages.

## Qualidade e atualizações da automação

O workflow [`.github/workflows/actions-quality.yml`](.github/workflows/actions-quality.yml) executa o `actionlint` para validar a sintaxe e as expressões dos workflows e o `zizmor` para auditar problemas de segurança. Actions oficiais da organização `actions` usam a tag da versão principal mais recente; actions de terceiros são fixadas por SHA completo. Os checkouts não persistem credenciais.

O [Dependabot](.github/dependabot.yml) verifica semanalmente as actions e as imagens Docker do MkDocs e do actionlint. Um cooldown de sete dias evita adotar imediatamente versões recém-publicadas.
