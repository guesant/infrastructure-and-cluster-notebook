---
title: EKS — Kubernetes gerenciado AWS
sidebar:
  order: 9
---

> **Para quem é:** equipes na AWS que querem Kubernetes sem manter control plane.

Amazon EKS (Elastic Kubernetes Service) é Kubernetes puro gerenciado. AWS cuida do control plane; você gerencia worker nodes.

## O que EKS oferece

**AWS gerencia:**

- Control plane (API server, etcd, controllers)
- Certificados e TLS
- Patches e upgrades
- Backups de etcd

**Você gerencia:**

- Nodes (EC2, Fargate, ou ambos)
- CNI (Flannel, Cilium, Calico)
- Aplicações
- Networking

---

## Comparação: K3s vs. RKE2 vs. EKS

| Aspecto | K3s | RKE2 | EKS |
| --------- | ----- | ------ | ----- |
| **Setup** | 30s | 5 min | 10 min (via console) |
| **Infra** | VMs gerenciadas | VMs gerenciadas | AWS gerenciado |
| **Custo** | Mínimo | Mínimo | 0.10 $/hora control plane + nodes |
| **Scale** | Pequeno (100s nós) | Médio (1000s) | Ilimitado |
| **Compliance** | Nenhum | CIS/FIPS | CIS/FedRAMP/HIPAA |
| **Lock-in** | Nenhum | Nenhum | AWS (ec2, iam, rds) |

## Quando usar EKS

### ✅ Use EKS se

- Já usa AWS
- Production com requisitos SLA (AWS 99.95% uptime)
- Precisa compliance AWS-native
- Equipe pequena (quer delegar control plane)
- Multi-tenancy (RBAC + IAM integrado)

### ❌ Não use EKS se

- Multi-cloud (k3s/RKE2 portáveis)
- Quer sair da AWS (lock-in)
- Budget crítico (sem nodes = sem cost)
- On-prem só (EKS precisa AWS)

---

## Arquitetura

```mermaid
graph TB
    subgraph AWS["AWS (Control plane)"]
        API["API Server<br/>(gerenciado)"]
        ETCD["etcd<br/>(gerenciado)"]
        CTRL["Controllers<br/>(gerenciado)"]
    end
    
    subgraph VPC["VPC (Você gerencia)"]
        EC2["EC2 nodes<br/>(opção classic)"]
        Fargate["Fargate<br/>(opção serverless<br/>sem nodes visíveis)"]
    end
    
    API ↔ EC2
    API ↔ Fargate
```

## Worker nodes: EC2 vs. Fargate

| Opção | Controle | Custo | Uso |
| --- | --- | --- | --- |
| **EC2** | Total | Fixo (mesmo sem usar) | Apps que precisam recursos estáveis |
| **Fargate** | Mínimo | Por-recurso (pay-as-you-go) | Batch, dev/test, spiky workloads |

---

## Setup (muito rápido)

```bash
# 1. Criar cluster (via console ou eksctl)
eksctl create cluster --name my-cluster --region us-east-1

# 2. Configurar kubeconfig
aws eks update-kubeconfig --region us-east-1 --name my-cluster

# 3. Deploy apps (kubectl normal)
kubectl apply -f app.yaml
```

---

## Integração AWS

EKS integra-se naturalmente com:

- **IAM:** RBAC ligado a roles AWS
- **ECR:** registry nativa
- **RDS:** banco dados gerenciado (não em cluster)
- **Secrets Manager:** secrets centralizadas
- **CloudWatch:** logs centralizados
- **ALB:** load balancer nativo

---

## Custo

- Control plane: $0.10/hora (~$73/mês)
- Nodes: preço EC2 normal (~$0.05/hora micro)
- Data transfer: padrão AWS

**ROI:** controle plane gerenciado economiza overhead ops.

---

## Próximas seções

- [Instalar EKS](../../../guides/tasks/kubernetes/install-eks/) — step-by-step com eksctl.
- [EKS vs. K3s](../../../learn/clusters/rke2-vs-k3s/) — escolher entre opções.

---

## Referências

- [EKS documentation](https://docs.aws.amazon.com/eks/): guia oficial.
- [eksctl](https://eksctl.io/): ferramenta CLI para EKS.
- [Kubernetes on AWS](https://aws.amazon.com/kubernetes/): visão AWS.
