---
title: Operar o OpenBao em produção
description: Como expor métricas do OpenBao para o Prometheus, fazer backup do storage PostgreSQL e recuperar a topologia de HA em cenários de desastre.
sidebar:
  order: 9
---

> **Pré-requisitos:** [OpenBao em alta disponibilidade](../configure-openbao-high-availability/) já configurado.
> **Versões testadas:** OpenBao 2.4, PostgreSQL 17.

Esta página cobre a operação contínua da topologia de HA configurada na página anterior: observabilidade, backup e os cenários de recuperação que fazem sentido para um storage PostgreSQL compartilhado. Ela não repete a instalação nem o setup de HA, já cobertos em [instalar o OpenBao](../install-openbao/), [auto-unseal](../configure-openbao-auto-unseal/) e [alta disponibilidade](../configure-openbao-high-availability/).

## Expor métricas para o Prometheus

Cada réplica do OpenBao expõe métricas Prometheus nativamente em `/v1/sys/metrics`. Crie o `ServiceMonitor` correspondente (veja [configurar um ServiceMonitor](../../observability/configure-service-monitor/) para o conceito):

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso administrativo à API.

```bash
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: openbao
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  namespaceSelector:
    matchNames:
      - openbao
  selector:
    matchLabels:
      app.kubernetes.io/name: openbao
  endpoints:
    - port: http
      path: /v1/sys/metrics
      params:
        format: ["prometheus"]
      interval: 30s
EOF
```

O sinal mais crítico para alertar é o próprio estado de selamento: uma réplica que volta a `sealed` sozinha parou de servir tráfego, mesmo com o Pod `Running`. Crie o alerta (veja [configurar o Alertmanager](../../observability/configure-alertmanager/) para o fluxo completo de roteamento):

```bash
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: openbao-sealed
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  groups:
    - name: openbao.rules
      rules:
        - alert: OpenBaoSealed
          expr: openbao_core_unsealed == 0
          for: 1m
          labels:
            severity: critical
          annotations:
            summary: "Réplica do OpenBao está sealed"
EOF
```

## Backup do storage PostgreSQL

Nesta topologia, o PostgreSQL é o único lugar onde o estado do OpenBao persiste; um backup do banco é, na prática, um backup completo do cofre (dados cifrados, não em claro, mas suficiente para restaurar o serviço). Use o mesmo mecanismo de [backup do PostgreSQL](../../databases/configure-postgresql-backups/) já usado para outros bancos do cluster, ou, para um backup avulso fora do CloudNativePG:

> **Executar em:** qualquer máquina com acesso de rede ao PostgreSQL e `pg_dump` instalado.

```bash
pg_dump -h postgres-host -U bao -d openbao --format=custom --file=openbao-backup.dump
```

Não faça backup de arquivos de configuração (`openbao.hcl`) como substituto do backup do banco: a configuração é reproduzível a partir deste guia, mas os dados armazenados no PostgreSQL não são.

## Cenários de recuperação

Os três cenários abaixo cobrem as formas de perda relevantes para esta topologia (réplicas de OpenBao, PostgreSQL compartilhado, chave KMS de auto-unseal). Eles não são equivalentes: identifique qual componente foi perdido antes de agir.

**Perda de uma ou duas réplicas de OpenBao, com PostgreSQL e a chave KMS intactos.** Não é um evento de disaster recovery: basta reimplantar as réplicas perdidas com a mesma configuração (`openbao.hcl` apontando para o mesmo PostgreSQL e a mesma chave KMS). Elas se reintegram automaticamente ao cluster como standby, sem qualquer comando manual de restauração.

**Perda do PostgreSQL.** Restaure o backup mais recente em uma nova instância e aponte a `connection_string` de todas as réplicas para ela:

```bash
pg_restore -h novo-postgres-host -U bao -d openbao --clean openbao-backup.dump
```

Reinicie as réplicas do OpenBao depois da restauração; qualquer escrita feita entre o backup e a perda do banco não é recuperável, o mesmo princípio de RPO que se aplica a qualquer backup periódico (veja [RPO e RTO](../../../../learn/backups/rpo-and-rto/)).

**Perda da chave KMS usada no auto-unseal.** Este é o cenário mais grave: sem a chave, nenhuma réplica consegue se desencriptar, mesmo com o PostgreSQL intacto, porque a chave de selamento nunca fica armazenada junto dos dados. A única proteção é preventiva, não corretiva: habilite a exclusão retardada da chave no provedor de KMS (o AWS KMS, por exemplo, impõe um período mínimo de espera antes de excluir uma chave) e restrinja quem pode excluí-la via IAM, para que uma exclusão acidental ou maliciosa não seja imediata e irreversível.

## Checklist de produção

- [ ] Três ou mais réplicas, tolerando a perda de uma sem indisponibilidade.
- [ ] Auto-unseal habilitado com a exclusão da chave KMS protegida por política e período de espera.
- [ ] PostgreSQL com backup automatizado e testado (não apenas configurado).
- [ ] `ServiceMonitor` e alerta de `sealed` aplicados e validados com um teste real.
- [ ] Acesso de rede às réplicas restrito por NetworkPolicy.
- [ ] RBAC (dentro do próprio OpenBao) limitado por política e por identidade.

## Próximo passo

[Rotacionar um segredo de aplicação](../rotate-application-secret/) armazenado no OpenBao periodicamente.

## Fontes e leitura adicional

- [OpenBao: Telemetry](https://openbao.org/docs/configuration/telemetry/): referência do endpoint `/v1/sys/metrics` e do formato Prometheus.
- [OpenBao: Auto Unseal Configuration](https://openbao.org/docs/configuration/seal/awskms/): comportamento e limitações do auto-unseal via KMS.
- [PostgreSQL: `pg_dump`](https://www.postgresql.org/docs/current/app-pgdump.html): referência oficial do backup lógico usado nesta página.
