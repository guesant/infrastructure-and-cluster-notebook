---
title: Firewall com firewalld
description: Como configurar zonas, liberar portas e validar regras persistentes com firewalld, para hosts que usam esse firewall em vez de UFW.
sidebar:
  order: 6
---

> **Pré-requisitos:** acesso root ao host, `firewalld` instalado, console da máquina disponível como via de recuperação.
> **Versões testadas:** firewalld 1.3 (Debian 12 backports/RHEL-like).

O firewalld organiza regras por zona em vez de uma única lista linear como o UFW. Cada interface de rede pertence a uma zona, e cada zona define o nível de confiança e os serviços/portas liberados nela. Use esta página em hosts que já usam firewalld por convenção da distribuição ou da equipe; para os demais, [Firewall com UFW](../configure-ufw/) cobre o mesmo objetivo com um modelo mais simples.

Não rode UFW e firewalld no mesmo host: os dois manipulam as mesmas regras nftables por baixo e um pode desfazer as alterações do outro sem aviso.

## Identificar a zona ativa

> **Executar em:** nó alvo, como `root`.

```bash
firewall-cmd --get-active-zones
firewall-cmd --get-default-zone
```

Confirme qual zona está associada à interface usada pelo cluster antes de adicionar regras: uma regra aplicada à zona errada não tem efeito na interface real.

## Liberar o SSH antes de aplicar a política

Libere o SSH na zona ativa antes de qualquer mudança que possa restringir o acesso remoto:

> **Executar em:** nó alvo, como `root`.

```bash
read -r -p "Zona alvo (Enter para a zona padrão): " FIREWALLD_ZONE
read -r -p "Porta TCP do SSH: " SSH_PORT

ZONE_ARGS=()
if [[ -n "${FIREWALLD_ZONE}" ]]; then
  ZONE_ARGS=(--zone "${FIREWALLD_ZONE}")
fi

firewall-cmd "${ZONE_ARGS[@]}" --add-port="${SSH_PORT}/tcp" --permanent
firewall-cmd --reload
```

`--permanent` grava a regra na configuração persistente, mas não a aplica ao runtime até o `--reload` (ou até uma reinicialização). Sem `--permanent`, a regra vale apenas para a sessão atual do runtime e desaparece no próximo reload ou reinício.

## Confirmar as regras persistentes

> **Executar em:** nó alvo, como `root`.

```bash
firewall-cmd --zone="${FIREWALLD_ZONE:-$(firewall-cmd --get-default-zone)}" --list-all
```

A saída mostra serviços, portas, interfaces e regras ricas (`rich rules`) associadas à zona; confirme que apenas o necessário está liberado antes de considerar o host pronto.

## Validação

> **Executar em:** nó alvo.

```bash
firewall-cmd --state
firewall-cmd --zone="${FIREWALLD_ZONE:-$(firewall-cmd --get-default-zone)}" --list-ports
```

`--state` deve retornar `running`. Teste uma nova conexão SSH antes de encerrar a sessão original: o mesmo cuidado vale aqui como em qualquer mudança de firewall remota.

## Troubleshooting

Uma regra que funciona no runtime mas some após `--reload` foi aplicada sem `--permanent`. Reaplique com a flag e recarregue novamente. Se `--list-all` mostrar a regra esperada mas a conexão continuar bloqueada, confirme que a interface pertence à zona consultada (`firewall-cmd --get-zone-of-interface=<interface>`).

## Rollback

```bash
firewall-cmd --zone="${FIREWALLD_ZONE}" --remove-port="${SSH_PORT}/tcp" --permanent
firewall-cmd --reload
```

Remova regras específicas em vez de parar o serviço inteiro (`systemctl stop firewalld`), que deixaria o host sem filtragem de entrada.

## Próximo passo

[Firewall dos nós K3s](../../kubernetes/configure-k3s-firewall-rules/).

## Fontes e leitura adicional

- [firewalld: Conceitos (documentação oficial)](https://firewalld.org/documentation/concepts.html): descreve o modelo de zonas, níveis de confiança e políticas entre zonas.
- [firewalld: `firewall-cmd(1)` (documentação oficial)](https://firewalld.org/documentation/man-pages/firewall-cmd.html): referência das configurações de runtime e permanentes e dos comandos de consulta e alteração de regras.
- [firewalld: Zones](https://firewalld.org/documentation/zone/): detalha a associação entre interfaces, origens e zonas.
