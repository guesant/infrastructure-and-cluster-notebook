---
title: Planejamento do K3s
sidebar:
  order: 2
---

Antes da instalação:

- use um nome único para cada nó;
- defina um nome DNS ou IP estável para a API do cluster;
- para HA com etcd embarcado, use três ou mais servidores em quantidade ímpar;
- use o mesmo token e os mesmos valores críticos de configuração em todos os servidores;
- armazene o token fora dos nós, pois ele também é necessário em restaurações;
- confirme os requisitos de rede do K3s antes de adicionar nós.

Os blocos das próximas seções são autocontidos: solicitam os valores pelo terminal, gravam a configuração persistente, instalam o K3s e executam as validações. Tokens informados são lidos com echo desabilitado para não aparecer no histórico ou na tela; um token gerado para o primeiro servidor é exibido uma única vez para que seja armazenado.

Depois da instalação, o token persistido pode ser consultado no primeiro servidor. Guarde-o imediatamente em um gerenciador de segredos:

> **Executar em:** primeiro nó manager, como `root`.

```bash
cat /var/lib/rancher/k3s/server/node-token
```yaml

## Fontes e leitura adicional

- [K3s — Requirements](https://docs.k3s.io/installation/requirements) — Reúne os pré-requisitos de host, hardware, disco e conectividade que devem ser avaliados antes da instalação.
- [K3s — High Availability Embedded etcd](https://docs.k3s.io/datastore/ha-embedded) — Explica o número ímpar de servidores, o quorum e os valores de configuração que precisam coincidir.
- [K3s — Configuration Options](https://docs.k3s.io/installation/configuration) — Documenta o instalador, o arquivo `config.yaml` e a persistência das opções.
- [K3s — Architecture](https://docs.k3s.io/architecture) — Descreve o endpoint fixo de registro e as diferenças entre topologias single-node e multinó.
- [K3s — Token Management](https://docs.k3s.io/cli/token) — Explica os tipos de token, seu impacto de segurança e a necessidade de guardá-lo junto ao backup do datastore.
