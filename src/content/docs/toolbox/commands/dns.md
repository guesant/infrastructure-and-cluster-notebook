---
title: DNS
sidebar:
  order: 3
---

## Testar resolução de domínio

```bash
nslookup example.com
# ou
dig example.com
# ou
host example.com
```

**Quando usar:** verificar se um domínio resolve, ou descobrir o IP de um host.

**Considerações:**

- `nslookup` usa o resolvedor configurado em `/etc/resolv.conf`.
- `dig` mostra mais detalhes (TTL, tipo de registro, seção de autoridade); prefira `dig` sobre `nslookup`/`host` sempre que precisar inspecionar a resposta além do endereço em si (flags de validação, TTL real, registros adicionais), já que os outros dois cortam boa parte dessa informação por padrão.
- `host` é o mais direto dos três, útil para uma checagem rápida.
- O caminho completo que essa consulta percorre (stub resolver, recursivo, delegação até a autoridade) está detalhado em [resolução DNS](../../../learn/networking/dns/resolution/).

---

## Descobrir qual servidor DNS está configurado

```bash
cat /etc/resolv.conf
# ou, em sistemas com systemd-resolved
resolvectl status
```

**Quando usar:** confirmar qual resolvedor está em uso (Google Public DNS, Cloudflare, um resolvedor local, etc.).

**Considerações:**

- `/etc/resolv.conf` pode ser gerado e sobrescrito automaticamente pelo `systemd-resolved`; editá-lo manualmente em um sistema assim raramente é persistente.
- Em sistemas com `systemd-resolved`, `resolvectl status` mostra a configuração por interface, o que costuma ser mais preciso.
- A distinção entre esse resolvedor do sistema (o stub resolver) e o resolvedor recursivo que ele encaminha as consultas para frente está detalhada em [resolução DNS](../../../learn/networking/dns/resolution/#o-resolver-do-sistema-não-é-o-resolver-da-rede).

---

## Resolver contra um nameserver específico

```bash
dig @8.8.8.8 example.com
# Força a consulta a usar o DNS público do Google (8.8.8.8)
```

**Quando usar:** testar se um nameserver específico responde, ou contornar o cache do resolvedor local.

**Considerações:**

- `@<IP>` especifica qual resolvedor consultar, ignorando o configurado no sistema.
- Útil para diagnosticar diferenças de resposta entre resolvedores em uma configuração de DNS distribuído (split-horizon, por exemplo).

---

## Rastrear o caminho completo de uma resolução

```bash
dig +trace example.com
```

**Quando usar:** entender por qual servidor raiz, TLD e autoridade uma consulta passou, ou diagnosticar em qual salto da delegação uma zona parou de responder.

**Considerações:**

- `+trace` ignora o cache de qualquer resolvedor recursivo intermediário; a consulta sempre percorre a cadeia inteira, começando pelos servidores raiz, o que a torna mais lenta que uma consulta comum de propósito.
- Cada bloco da saída corresponde a um salto de delegação (NS + glue record); a leitura completa do mecanismo por trás de cada bloco está em [resolução DNS](../../../learn/networking/dns/resolution/) e em [zonas, delegação e tipos de registro](../../../learn/networking/dns/zones-and-records/).
- Útil para diferenciar "a zona não responde" (a cadeia quebra em algum salto específico) de "meu resolvedor está com problema" (a cadeia completa por `+trace` funciona, mas a consulta normal, via resolvedor configurado, não).

---

## Validar a cadeia de confiança DNSSEC

```bash
dig +dnssec example.com
# Confira a linha de flags na resposta: a presença de "ad" confirma que o
# resolvedor validou a cadeia de confiança; a ausência não prova ataque,
# só que a zona não é assinada ou o resolvedor não valida.
```

**Quando usar:** confirmar se uma zona está assinada com DNSSEC, e se o resolvedor em uso de fato valida a assinatura.

**Considerações:**

- A flag `ad` (Authenticated Data) na resposta é o sinal de validação bem-sucedida; sua ausência não distingue, sozinha, entre "zona não assinada" e "resolvedor não valida". Comparar a mesma consulta contra um resolvedor validador conhecido (`dig +dnssec @1.1.1.1 example.com`) ajuda a isolar qual dos dois é o caso.
- A cadeia completa (DNSKEY, RRSIG, DS, até a âncora de confiança da raiz) e o que DNSSEC protege (integridade, autenticidade) e não protege (confidencialidade) estão detalhados em [DNSSEC: cadeia de confiança e o que ela realmente protege](../../../learn/networking/dns/dnssec/).
- Uma zona propositalmente quebrada para teste de validação devolve `SERVFAIL` em vez de uma resposta válida, o sinal mais direto de que a cadeia de confiança falhou em algum ponto.

---

## Listar todos os registros de um domínio

```bash
dig example.com ANY
# Saída resumida
dig +short example.com

# Só registros A
dig +short example.com A

# Todos os tipos comuns, formatados
dig example.com +nocmd +noall +answer
```

**Quando usar:** auditoria de zona, ou descobrir todos os IPs e aliases associados a um domínio.

**Considerações:**

- Muitos nameservers bloqueiam ou limitam consultas `ANY` por política de segurança; não assuma que a ausência de resposta significa ausência de registros.
- `+short` produz a saída mais fácil de processar em scripts.
- `+nocmd +noall +answer` remove o cabeçalho e mostra só a seção de resposta.
- O que cada tipo de registro guarda e para que serve está detalhado em [zonas, delegação e tipos de registro](../../../learn/networking/dns/zones-and-records/).

---

## Verificar registros MX, TXT e CNAME

```bash
# Servidores de e-mail
dig example.com MX

# Registros de texto (SPF, DKIM, verificação de domínio)
dig example.com TXT

# Aliases
dig example.com CNAME
```

**Quando usar:** validar a infraestrutura de e-mail, verificar SPF/DKIM, ou resolver aliases.

**Considerações:**

- Em registros MX, um valor de preferência (`priority`) menor indica prioridade maior; é fácil interpretar isso ao contrário.
- Registros TXT também carregam SPF, DKIM e DMARC, além de tokens de verificação de propriedade de domínio usados por vários provedores.
- Um nome não pode ter um registro CNAME e outros registros (como A) simultaneamente, conforme a RFC do DNS.

---

## Testar resolução DNS interna do K3s

```bash
# A partir de um Pod temporário no cluster
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- \
  nslookup kubernetes.default.svc.cluster.local

# Verificar o CoreDNS
kubectl get svc -n kube-system coredns
kubectl logs -n kube-system -l k8s-app=kube-dns
```

**Quando usar:** diagnosticar falha de resolução de Services internos, ou verificar a saúde do CoreDNS.

**Considerações:**

- O FQDN interno de um Service segue o padrão `<service>.<namespace>.svc.cluster.local`.
- O CoreDNS responde na porta 53, em UDP e TCP.
- Erros e cache misses recorrentes nos logs do CoreDNS costumam indicar sobrecarga ou uma `NetworkPolicy` bloqueando a porta 53.
- Por que o CoreDNS é o servidor DNS padrão de um cluster Kubernetes, e como sua arquitetura de plugins cobre autoritativo (`kubernetes`) e recursivo (`forward`) no mesmo processo, está em [implementações de servidor DNS](../../../learn/networking/dns/dns-servers/#coredns-o-papel-que-este-notebook-já-usa).

---

## Medir a latência de uma resolução

```bash
time dig example.com
# mostra o tempo total gasto na consulta
```

**Quando usar:** diagnosticar lentidão de DNS, ou comparar resolvedores diferentes.

**Considerações:**

- A primeira consulta a um domínio costuma ser mais lenta, por não estar em cache em nenhum resolvedor intermediário.
- Consultas subsequentes ao mesmo nome tendem a usar cache e responder mais rápido.
- Uma latência acima de 100ms de forma consistente, mesmo com cache quente, costuma indicar um problema no caminho de resolução, não apenas uma consulta isolada lenta.

---

## Consultar dados de registro de um domínio (WHOIS/RDAP)

```bash
whois example.com
# ou, formato estruturado
curl -s https://rdap.org/domain/example.com | jq
```

**Quando usar:** verificar data de expiração, nameservers delegados, ou o registrar responsável por um domínio, antes de investigar a resolução em si.

**Considerações:**

- Nem WHOIS nem RDAP resolvem o domínio; são consulta de dados de registro, não de resolução DNS. A distinção completa, incluindo a diferença entre registry e registrar, está em [registro de domínio, WHOIS e RDAP](../../../learn/networking/dns/domains-whois-rdap/).
- Um domínio expirado para de resolver por completo; checar a data de expiração periodicamente evita esse tipo de incidente antes que ele aconteça.
- `whois` devolve texto livre sem formato padronizado entre registries; `curl` contra um servidor RDAP devolve JSON estruturado, mais fácil de processar em script.

---

## Resolver um nome `.local` via mDNS

```bash
avahi-resolve --name impressora.local
# ou, em sistemas sem Avahi instalado
getent hosts impressora.local
```

**Quando usar:** resolver um dispositivo anunciado na rede local via Multicast DNS (impressoras, alguns NAS e dispositivos plug-and-play), quando nenhum servidor DNS convencional resolve esse nome.

**Considerações:**

- `.local` não passa pelo caminho de resolução recursiva comum; é resolvido por multicast direto na rede local, sem servidor central. O mecanismo completo está em [mDNS e DNS-SD: resolução sem servidor](../../../learn/networking/dns/mdns-and-service-discovery/).
- `avahi-resolve` exige o serviço `avahi-daemon` ativo no host; um nó de cluster normalmente não o tem (e não deveria, conforme o [guia de desabilitar serviços desnecessários do host](../../../guides/tasks/host/disable-unnecessary-services/)), então esse comando é mais útil numa estação administrativa do que num servidor.
- Um nome `.local` nunca deveria ser declarado como zona num resolvedor recursivo tradicional; o conflito de sufixo é a razão pela qual zonas administrativas de cluster usam `.internal` em vez disso.
