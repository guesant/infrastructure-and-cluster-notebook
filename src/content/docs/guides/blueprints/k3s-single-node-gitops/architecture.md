---
title: Arquitetura do blueprint
sidebar:
  order: 2
---

Este blueprint concentra control plane, workloads, ingress e entrega contínua em um único host. Esta página detalha as camadas dessa arquitetura; a visão de conjunto está em [visão geral do blueprint](../k3s-single-node-gitops/).

## Camadas

```mermaid
flowchart LR
    accTitle: Camadas do cluster K3s single-node
    accDescr: O tráfego externo passa pelo firewall do host, chega ao Traefik, que roteia para os Services das aplicações. O cert-manager fornece certificados ao Traefik. O Argo CD reconcilia todos os manifests a partir do Git.

    subgraph Rede["Camada de rede"]
        Firewall["UFW/firewalld"]
        Traefik["Traefik (Gateway API)"]
    end

    subgraph Plataforma["Camada de plataforma"]
        CertManager["cert-manager"]
        ArgoCD["Argo CD"]
    end

    subgraph Workloads["Camada de aplicação"]
        Apps["Pods e Services"]
    end

    Internet["Internet/rede privada"] --> Firewall --> Traefik --> Apps
    CertManager -->|"Secret TLS"| Traefik
    ArgoCD -->|"reconcilia"| Apps
    ArgoCD -->|"reconcilia"| CertManager
```

A camada de rede decide o que chega ao host e como o tráfego é roteado até um Service. A camada de plataforma fornece certificados e reconciliação declarativa para as duas camadas vizinhas. A camada de aplicação é o conjunto de workloads que o cluster existe para executar; este blueprint não prescreve quais.

## Fluxo de uma requisição publicada

```mermaid
sequenceDiagram
    accTitle: Fluxo de uma requisição HTTPS até uma aplicação
    accDescr: Um cliente resolve o hostname, conecta ao Traefik por HTTPS usando um certificado emitido pelo cert-manager, e o Traefik encaminha a requisição ao Service da aplicação conforme a HTTPRoute correspondente.

    participant Cliente
    participant DNS
    participant Traefik
    participant Service
    participant Pod

    Cliente->>DNS: resolve hostname
    DNS-->>Cliente: IP do host
    Cliente->>Traefik: HTTPS (SNI = hostname)
    Traefik->>Traefik: seleciona listener/Gateway pelo SNI
    Traefik->>Traefik: aplica HTTPRoute correspondente
    Traefik->>Service: encaminha requisição
    Service->>Pod: distribui para um Pod saudável
    Pod-->>Cliente: resposta
```

O certificado usado no handshake TLS foi emitido antecipadamente pelo cert-manager e gravado como Secret referenciado pelo `Gateway`; a emissão não acontece no momento da requisição.

## Fluxo de reconciliação GitOps

```mermaid
sequenceDiagram
    accTitle: Fluxo de reconciliação do Argo CD
    accDescr: Uma mudança enviada ao repositório Git é detectada pelo Argo CD, comparada com o estado do cluster e aplicada conforme a política de sincronização configurada.

    participant Operador
    participant Git
    participant ArgoCD as Argo CD
    participant API as API do Kubernetes

    Operador->>Git: push de manifests alterados
    ArgoCD->>Git: consulta periódica (polling)
    ArgoCD->>ArgoCD: compara Git vs. estado no cluster
    alt diferença encontrada e sync automático habilitado
        ArgoCD->>API: aplica a diferença
    else diferença encontrada e sync manual
        ArgoCD-->>Operador: reporta OutOfSync
        Operador->>ArgoCD: aciona sync manualmente
        ArgoCD->>API: aplica a diferença
    end
```

O Argo CD roda dentro do mesmo cluster que gerencia: se a API ficar indisponível, a reconciliação para junto com o restante do cluster, e a recuperação segue o procedimento em [operação](../k3s-single-node-gitops/operations/), não um fluxo de auto-recuperação do próprio Argo CD.

## Fontes e leitura adicional

- [K3s: Architecture](https://docs.k3s.io/architecture): base da camada de control plane usada neste blueprint.
- [Arquitetura do K3s](../../../../learn/clusters/k3s-architecture/): explicação conceitual dos papéis de manager e agent referenciada por este blueprint.
