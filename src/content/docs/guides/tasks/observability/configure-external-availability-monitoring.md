---
title: Configurar monitoramento externo de disponibilidade
description: Como verificar a disponibilidade de um serviço publicado a partir de fora do cluster, o único sinal que sobrevive à perda completa do host em um cluster de nó único.
sidebar:
  order: 11
---

> **Pré-requisitos:** um serviço publicado externamente (veja [Gateway API e Traefik](../../networking/configure-traefik-gateway-api/)).
> **Versões testadas:** não aplicável; este procedimento não depende de uma ferramenta específica.

Veja [monitoramento de caixa-preta versus caixa-branca](../../../../learn/observability/blackbox-vs-whitebox-monitoring/) e [observabilidade para clusters pequenos](../../../../learn/observability/observability-for-small-clusters/) antes de configurar: este é o único sinal que sobrevive à perda completa do host em um cluster de nó único.

Este procedimento é intencionalmente genérico: qualquer serviço de verificação externa (um serviço de terceiros, um script simples rodando em outra máquina) atende ao objetivo, desde que rode fora do domínio de falha do cluster.

## Opção simples: verificação via cron em outra máquina

> **Executar em:** qualquer máquina fora do cluster, com saída de rede para o serviço publicado.

```bash
read -r -p "URL pública a verificar: " EXTERNAL_CHECK_URL

cat >/usr/local/bin/check-availability.sh <<EOF
#!/bin/sh
set -eu

HTTP_STATUS="\$(curl --silent --output /dev/null --write-out '%{http_code}' --max-time 10 "${EXTERNAL_CHECK_URL}")"

if [ "\${HTTP_STATUS}" != "200" ]; then
  printf 'Verificação falhou: %s retornou %s\n' "${EXTERNAL_CHECK_URL}" "\${HTTP_STATUS}" >&2
  exit 1
fi
EOF
chmod +x /usr/local/bin/check-availability.sh

echo '*/5 * * * * /usr/local/bin/check-availability.sh || echo "Falha na verificação externa" | mail -s "Alerta de disponibilidade" seu-email@exemplo.com' | crontab -
```

Ajuste o destino de notificação (`mail`, um webhook, um serviço de alerta) conforme os canais já usados pelo ambiente.

## Opção com serviço de terceiros

Serviços de *uptime monitoring* de terceiros (fora do escopo específico deste notebook) tipicamente oferecem verificações HTTP/TCP periódicas com alertas configuráveis, sem exigir infraestrutura própria: uma alternativa razoável quando não há uma segunda máquina disponível para a opção via cron.

## Validação

Force uma falha temporária (pare o Traefik ou desligue temporariamente o serviço em homologação) e confirme que a verificação externa detecta e notifica dentro do intervalo esperado: o mesmo princípio de teste ponta a ponta usado para alertas internos (veja [observabilidade e alertas](../../../../operations/observability/observability-and-alerting/#teste-ponta-a-ponta-e-metamonitoramento)).

## Troubleshooting

Se a verificação externa nunca detectar uma falha real, confirme que ela realmente testa o caminho público completo (DNS, TLS, resposta da aplicação) e não apenas conectividade de rede básica: um teste TCP simples não captura uma aplicação travada que ainda aceita conexões.

## Próximo passo

Registre esta verificação como parte da [prontidão de observabilidade](../../../../operations/checklists/observability-readiness/).

## Fontes e leitura adicional

- [Kubernetes: Observability](https://kubernetes.io/docs/concepts/cluster-administration/observability/): visão geral oficial dos sinais e sua limitação quando o próprio cluster falha.
