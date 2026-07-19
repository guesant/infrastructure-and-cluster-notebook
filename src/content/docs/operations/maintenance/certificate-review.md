---
title: Revisão de certificados
sidebar:
  order: 5
---

> **Pré-requisitos:** kubeconfig com acesso de leitura aos recursos `Certificate`.
> **Versões testadas:** cert-manager v1.21.0.

O cert-manager renova certificados automaticamente antes do vencimento, mas uma falha silenciosa na renovação (credencial DNS expirada, `ClusterIssuer` quebrado, limite de taxa do provedor ACME) só é percebida quando o certificado já expirou, se não houver revisão periódica.

## Listar certificados e validade

> **Executar em:** estação administrativa com kubeconfig.

```bash
kubectl get certificates --all-namespaces
kubectl get certificates --all-namespaces -o json | \
  python3 -c 'import json,sys; [print(c["metadata"]["namespace"], c["metadata"]["name"], c["status"].get("notAfter", "sem data")) for c in json.load(sys.stdin)["items"]]'
```yaml

A coluna `READY` de `kubectl get certificates` deve estar `True` para todos. Um `False` persistente indica um problema de renovação que precisa de investigação imediata, não apenas registro para revisão futura.

## Identificar certificados próximos do vencimento

Compare `notAfter` com a data atual; certificados do Let's Encrypt normalmente têm validade de 90 dias e o cert-manager tenta renovar aos 2/3 desse período. Um certificado com menos de 20 dias de validade restante e sem tentativa de renovação recente merece investigação.

## Investigar uma renovação suspeita

> **Executar em:** estação administrativa com kubeconfig.

```bash
kubectl describe certificate <nome> --namespace <namespace>
```yaml

Revise a seção `Status.Conditions` e os eventos — veja [diagnosticar uma emissão](../../../guides/tasks/certificates/install-cert-manager/#diagnosticar-uma-emissão) para o procedimento completo com `cmctl`.

## Checklist

- [ ] Todos os `Certificate` relevantes estão `READY: True`.
- [ ] Nenhum certificado tem menos de 20 dias de validade restante sem uma renovação em andamento.
- [ ] O `ClusterIssuer` usado está `READY: True` (veja [criar um ClusterIssuer ACME](../../../guides/tasks/certificates/create-acme-clusterissuer/)).
- [ ] A credencial do provedor DNS usada pelo desafio DNS-01 continua válida e não expirou.
- [ ] Existe alerta configurado para certificados próximos do vencimento (veja [observabilidade e alertas](../../observability/observability-and-alerting/)).

## Troubleshooting

Se um certificado ficar preso em renovação, o `Challenge` associado geralmente indica a causa — propagação DNS lenta, credencial revogada ou limite de taxa do Let's Encrypt atingido (veja [rate limits](https://letsencrypt.org/docs/rate-limits/)).

## Próximo passo

Registre a revisão no [runbook de manutenção](../maintenance-runbook/).

## Fontes e leitura adicional

- [Renovação de certificados — cert-manager](https://cert-manager.io/docs/usage/certificate/#renewal): documenta o momento e o comportamento da renovação automática.
- [Rate limits — Let's Encrypt](https://letsencrypt.org/docs/rate-limits/): explica os limites que podem bloquear uma renovação.
