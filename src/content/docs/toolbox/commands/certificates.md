---
title: Certificados
sidebar:
  order: 2
---

## Criar chave SSH

```bash
ssh-keygen -t ed25519 -C "seu-email@example.com" -f ~/.ssh/id_ed25519 -N ""
```

**Quando usar:** configurar autenticação SSH, deployment keys.

**Considerações:**

- `-t ed25519`: tipo moderno, mais seguro e compacto que RSA.
- `-N ""`: sem passphrase (cuidado em produção).
- Sem `-f`: solicita filename.
- Permissões: `chmod 600 ~/.ssh/id_ed25519`.

---

## Inspecionar certificado X.509

```bash
openssl x509 -in cert.pem -text -noout
# Mostrar: CN, SAN, válido até, issuer
```

**Quando usar:** verificar domínios alternativos (SAN), data de expiração, issuer de um certificado.

**Considerações:**

- `-noout`: não mostrar formato PEM.
- Sem `-text`: mostra apenas fingerprint e serial.
- Para certificados .der (binário): `-inform der -in cert.der`.

---

## Verificar expiração de certificado

```bash
openssl x509 -in cert.pem -noout -dates
# Retorna: notBefore=... e notAfter=...

# Mais legível:
openssl x509 -in cert.pem -noout -enddate | cut -d= -f2
```

**Quando usar:** auditoria de certificados expirando, automação de renovação.

**Considerações:**

- `-dates` mostra both notBefore e notAfter.
- Para comparar com agora: `date -d "$(openssl x509 ... -enddate | cut -d= -f2)" +%s`.

---

## Converter certificado PEM to DER

```bash
openssl x509 -in cert.pem -outform der -out cert.der
```

**Quando usar:** alguns sistemas (Windows, Android) usam DER (binário) em vez de PEM (texto).

**Considerações:**

- `.pem`: texto ASCII (Base64), portável.
- `.der`: binário, mais compacto, menos legível.
- Reverso: `openssl x509 -inform der -in cert.der -out cert.pem`.

---

## Gerar CSR (Certificate Signing Request)

```bash
openssl req -new -key private.pem -out request.csr \
  -subj "/C=BR/ST=SP/L=São Paulo/O=Empresa/CN=example.com"
```

**Quando usar:** solicitar certificado assinado por CA (Let's Encrypt, DigiCert, etc.).

**Considerações:**

- Usa chave privada existente.
- `-subj`: pula prompt interativo.
- Depois: enviar `.csr` para CA.

---

## Verificar certificado de um servidor remoto

```bash
openssl s_client -connect example.com:443 -showcerts < /dev/null | openssl x509 -text -noout
```

**Quando usar:** auditar certificado de um serviço remoto sem baixar arquivo.

**Considerações:**

- Conecta, recebe certificado, mostra detalhes.
- Útil para health checks de certificados expirando.
