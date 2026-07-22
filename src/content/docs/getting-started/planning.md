---
title: Planejamento do K3s
description: Decisões que precisam ser tomadas antes de instalar o K3s (nomenclatura de nós, endpoint da API, quantidade de servidores e custódia do token) e por que revisá-las depois é caro.
sidebar:
  order: 3
---

Cada decisão desta página é mais barata de tomar agora do que de corrigir depois. Nome de nó,
endpoint da API e token são valores que o K3s grava na configuração do cluster assim que o
primeiro servidor sobe; trocá-los depois normalmente significa reemitir certificados,
reconfigurar todos os nós já unidos ou, em alguns casos, reconstruir o cluster. Revise os pontos
abaixo antes de rodar o instalador:

- Use um nome único para cada nó. O K3s identifica servidores e agentes pelo hostname (ou por
  `--node-name`, quando definido explicitamente); dois nós com o mesmo nome causam conflito no
  registro do cluster.
- Defina um nome DNS ou IP estável para a API do cluster antes de instalar o primeiro servidor.
  Esse endereço vai para o certificado do servidor (`--tls-san`) e para o kubeconfig de todo
  cliente; adicioná-lo depois de o cluster já existir exige reemitir o certificado da API.
- Para HA com etcd embarcado, planeje três ou mais servidores em quantidade ímpar. Um número par
  de membros não reduz a tolerância a falhas na mesma proporção que adicionar mais um servidor
  ímpar; veja [Quorum em clusters distribuídos](../../learn/clusters/quorum/) para o raciocínio
  completo por trás dessa exigência.
- Use o mesmo token e os mesmos valores críticos de configuração em todos os servidores. O token
  é o segredo compartilhado que autoriza um nó a se juntar ao cluster; um agente ou servidor
  configurado com o token errado falha ao tentar entrar.
- Armazene o token fora dos nós assim que ele existir, pois ele também é necessário em
  restaurações: sem o token original, um snapshot do etcd restaurado em um host novo não permite
  que os demais nós voltem a se autenticar.
- Confirme os requisitos de rede do K3s antes de adicionar nós. As portas exigidas entre
  servidores e agentes estão documentadas na referência oficial listada abaixo; a
  [configuração do firewall dos nós K3s](../../guides/tasks/kubernetes/configure-k3s-firewall-rules/)
  traduz esses requisitos em regras aplicáveis nesta infraestrutura.

Os blocos das próximas seções são autocontidos: solicitam os valores pelo terminal, gravam a
configuração persistente, instalam o K3s e executam as validações. Tokens informados são lidos
com echo desabilitado para não aparecer no histórico ou na tela; um token gerado para o primeiro
servidor é exibido uma única vez para que seja armazenado.

Depois da instalação, o token persistido pode ser consultado no primeiro servidor. Guarde-o
imediatamente em um gerenciador de segredos:

> **Executar em:** primeiro nó manager, como `root`.

```bash
cat /var/lib/rancher/k3s/server/node-token
```

## Fontes e leitura adicional

- [K3s: Requirements](https://docs.k3s.io/installation/requirements): reúne os pré-requisitos de host, hardware, disco e conectividade que devem ser avaliados antes da instalação.
- [K3s: High Availability Embedded etcd](https://docs.k3s.io/datastore/ha-embedded): explica o número ímpar de servidores, o quorum e os valores de configuração que precisam coincidir.
- [K3s: Configuration Options](https://docs.k3s.io/installation/configuration): documenta o instalador, o arquivo `config.yaml` e a persistência das opções.
- [K3s: Architecture](https://docs.k3s.io/architecture): descreve o endpoint fixo de registro e as diferenças entre topologias single-node e multinó.
- [K3s: Token Management](https://docs.k3s.io/cli/token): explica os tipos de token, seu impacto de segurança e a necessidade de guardá-lo junto ao backup do datastore.
