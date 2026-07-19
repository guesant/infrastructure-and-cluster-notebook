---
title: Kine — alternativa ao etcd embarcado
sidebar:
  order: 7
---

> **Para quem é:** operadores K3s que querem etcd embarcado mas com opções de backend (SQLite, PostgreSQL, MySQL).

Kine é um proxy que permite K3s usar diferentes backends como datastore em vez do etcd embarcado. É uma alternativa ao "datastore externo" com mais flexibilidade.

## O problema que Kine resolve

K3s oferece duas opções:

- **etcd embarcado** — simplesmente funciona, mas todas as réplicas precisam do etcd
- **Datastore externo** — PostgreSQL/MySQL/etcd separado, mas complica infra

**Kine oferece uma terceira via:**

- Usa um **proxy** que converte API etcd em queries SQL
- Backend pode ser SQLite (dev), PostgreSQL (prod), MySQL, ou até etcd (para compatibilidade)
- Mesma API, diferentes backends

## Quando usar Kine

### ✅ Use Kine quando

- Quer evitar etcd embarcado (para simplificar)
- Já tem PostgreSQL/MySQL e quer reusar
- Precisa de dev setup leve (SQLite é 1 arquivo)
- Quer migrar gradualmente de etcd embarcado para banco externo

### ❌ Não use Kine quando

- Quer máxima performance (etcd é optimizado para Kubernetes)
- Precisa de high-frequency writes (etcd bate Kine)
- Já rodando etcd embarcado com sucesso (não mude sem motivo)

## Comparação

| Aspecto | etcd embarcado | Kine + PostgreSQL | Kine + SQLite |
| --------- | --- | --- | --- |
| Setup | Trivial | Reusa DB existente | Arquivo único |
| Performance | Alto | Médio (SQL overhead) | Baixo (dev only) |
| Escala | 1000s nós | Limitado por DB | Limitado (1 processo) |
| Persistência | Integrada | Herda do banco | Arquivo local |
| Backup | Snapshots etcd | Backup de DB | cp arquivo |

## Kine vs. Datastore externo

Kine **é** um datastore externo, mas com:

- Proxy em cada K3s server (não daemon separado)
- Mesma API (compatível com tooling K3s)
- Mais backend options

**Datastore externo clássico:** apenas etcd, PostgreSQL, MySQL (sem proxy).

---

## Arquitetura

```yaml
K3s API Server
       ↓
  Kine proxy (converte etcd API → SQL)
       ↓
PostgreSQL (ou SQLite, MySQL, etcd)
```yaml

Kine é transparente para aplicações — veem etcd, mas dados estão em SQL.

---

## Trade-offs

**Vantagens:**

- Simples: reutiliza DB existente
- Flexível: múltiplos backends
- Dev-friendly: SQLite requer nada de setup

**Desvantagens:**

- Overhead SQL (mais lento que etcd nativo)
- Menos testado em production (etcd tem mais histórico)
- Não reduz complexidade se usadas múltiplas réplicas (ainda precisa de Kine em cada servidor)

---

## Próximas seções

- [Instalar Kine](../../../guides/tasks/kubernetes/install-kine/) — setup com PostgreSQL e SQLite.
- [Kine vs. etcd embarcado](../../../learn/clusters/embedded-vs-external-datastore/) — quando escolher cada um.

---

## Referências

- [Kine documentation](https://github.com/k3s-io/kine): repositório oficial.
- [K3s datastore docs](https://docs.k3s.io/datastore): opções de datastore.
