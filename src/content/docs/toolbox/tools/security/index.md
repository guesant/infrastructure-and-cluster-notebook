---
title: Ferramentas de segurança
description: Catálogo de ferramentas de varredura, postura e detecção em runtime, planejado para uma fase futura do notebook.
sidebar:
  order: 3
---

Esta página vai catalogar ferramentas dedicadas de segurança para hosts, containers e clusters: varredura de vulnerabilidades, avaliação de postura e detecção de comportamento suspeito em runtime. Uma parte dessas ferramentas (Trivy, Kubescape, kube-bench e Falco) já aparece na tabela [Diagnóstico, segurança e recuperação](../overview/#diagnóstico-segurança-e-recuperação) do catálogo geral; esta página será o ponto de referência dedicado, com instalação e uso detalhados em vez de apenas a comparação de alto nível.

Ainda não existe um catálogo aqui. A criação desta página é escopo da Fase 7 do plano de conteúdo interno do projeto (veja `.todo/phase-7-toolbox.md`, fora do site publicado). Quando escrita, deve seguir os mesmos [critérios de avaliação](../overview/#critérios-de-avaliação) já aplicados ao restante do [catálogo de ferramentas](../overview/), e distinguir claramente ferramentas de varredura (evidência auxiliar) de controles preventivos como RBAC, Network Policies e hardening do host, já documentados em [`learn/security`](../../../learn/security/policy-enforcement/) e nas [checklists de segurança](../../../operations/checklists/cluster-security/).
