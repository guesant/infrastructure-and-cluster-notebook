---
title: Certificate não fica Ready
sidebar:
  order: 3
---

> **Sintoma:** um recurso `Certificate` permanece com `READY: False`.
> **Versões testadas:** cert-manager v1.21.0.

Um `Certificate` que não fica `Ready` significa que o cert-manager ainda não conseguiu completar a emissão ou renovação — o serviço que depende desse certificado (via `Gateway` ou Ingress) continua servindo o certificado anterior, ou nenhum, até que isso se resolva.

## Diagnóstico inicial

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl get certificate <nome> --namespace <namespace>
kubectl describe certificate <nome> --namespace <namespace>
```yaml

A seção `Status.Conditions` explica o estado atual. Se o cert-manager já tentou e falhou, o `describe` costuma apontar diretamente para o `CertificateRequest`, `Order` ou `Challenge` relacionado.

## Seguir a cadeia de recursos

Em uma emissão ACME, a cadeia é `Certificate` → `CertificateRequest` → `Order` → `Challenge`:

```bash
kubectl --namespace <namespace> \
  get certificates,certificaterequests,orders.acme.cert-manager.io,challenges.acme.cert-manager.io
```yaml

Um `Challenge` preso em `pending` é a causa mais comum — normalmente indica que o registro DNS TXT do desafio DNS-01 não propagou ainda, ou que a credencial do provedor DNS não tem permissão de escrita na zona.

## Causas comuns

| Sintoma | Causa provável |
| --- | --- |
| `Challenge` preso em `pending` por muito tempo | Propagação DNS lenta, resolvers configurados incorretamente, credencial sem permissão |
| `ClusterIssuer` referenciado não existe ou não é `Ready` | Veja [criar um ClusterIssuer ACME](../../../guides/tasks/certificates/create-acme-clusterissuer/) |
| Erro de rate limit do Let's Encrypt | Muitas tentativas de emissão para o mesmo domínio; aguarde o reset do limite ou use staging |
| `CertificateRequest` falha imediatamente | `ClusterIssuer` ou credencial DNS inválida — revise o Secret referenciado |

## Verificar o ClusterIssuer

```bash
kubectl get clusterissuer
kubectl describe clusterissuer <nome>
```yaml

Se o próprio `ClusterIssuer` não estiver `Ready`, nenhum `Certificate` que o referencia vai emitir com sucesso — corrija o Issuer primeiro.

## Recuperação

Depois de corrigir a causa raiz (credencial, DNS, Issuer), o cert-manager tenta novamente automaticamente. Para forçar uma nova tentativa sem esperar o próximo ciclo:

```bash
kubectl delete certificaterequest --namespace <namespace> --selector cert-manager.io/certificate-name=<nome>
```yaml

Isso remove a tentativa travada; o cert-manager recria um `CertificateRequest` novo a partir do `Certificate` existente.

## Fontes e leitura adicional

- [Troubleshooting de ACME — cert-manager](https://cert-manager.io/docs/troubleshooting/acme/): orienta a investigar `CertificateRequest`, `Order`, `Challenge` e eventos.
- [Rate limits — Let's Encrypt](https://letsencrypt.org/docs/rate-limits/): documenta os limites que podem bloquear uma emissão.
