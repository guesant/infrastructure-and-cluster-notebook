---
title: Proteger chaves age
sidebar:
  order: 6
---

> **Pré-requisitos:** [SOPS configurado com age](../../guides/tasks/secrets/configure-sops-with-age/).
> **Frequência sugerida:** revisão a cada rotação de chave; trimestral por padrão.

A chave privada age é o material crítico que protege todos os segredos criptografados no repositório GitOps via SOPS — sua perda torna esses segredos permanentemente irrecuperáveis, mesmo com o repositório Git intacto.

## Onde guardar a chave privada

A chave privada (`AGE-SECRET-KEY-...`) nunca deve ser commitada, mesmo em um repositório privado. Guarde-a em:

- um gerenciador de senhas com controle de acesso (1Password, Bitwarden, etc.);
- um cofre físico, para ambientes muito pequenos sem gerenciador de segredos estabelecido;
- múltiplas cópias, se apropriado, com controle de quem tem acesso a cada uma.

## Verificar a chave usada pelo Argo CD

Se [SOPS estiver integrado ao Argo CD](../../guides/tasks/secrets/use-sops-with-argocd/), a mesma chave (ou uma chave diferente com acesso equivalente) precisa estar disponível como Secret no cluster:

> **Executar em:** qualquer máquina com `KUBECONFIG` e acesso à API.

```bash
kubectl --namespace argocd get secret sops-age-key
```yaml

Esse Secret é, ele mesmo, um dado de bootstrap fora do GitOps — trate-o com o mesmo cuidado descrito em [backup de dados de bootstrap do GitOps](../backup-gitops-bootstrap-data/).

## Testar a recuperação

Periodicamente, confirme que a cópia guardada da chave realmente decifra um arquivo de teste:

```bash
export SOPS_AGE_KEY_FILE=/caminho/para/copia-guardada/age-key.txt
sops --decrypt algum-arquivo-cifrado-de-teste.yaml
```yaml

Uma cópia de chave nunca testada pode estar corrompida, incompleta, ou ser a versão errada de uma rotação anterior.

## Checklist

- [ ] A chave privada existe em pelo menos um destino fora do repositório GitOps e fora do cluster.
- [ ] O Secret usado pelo Argo CD (se aplicável) está registrado como dado de bootstrap a recuperar separadamente.
- [ ] Uma cópia guardada da chave foi testada recentemente e decifra corretamente.

## Rollback

Se uma chave for comprometida, gere um novo par e reencripte todos os arquivos protegidos por ela — não há "revogação" de uma chave age já exposta, apenas substituição.

## Próximo passo

[Recuperar o gerenciamento de segredos](../../disaster-recovery/recover-secret-management/) para o procedimento completo durante um incidente.

## Fontes e leitura adicional

- [age — FiloSottile](https://github.com/FiloSottile/age): especificação e uso da ferramenta.
- [SOPS — Mozilla](https://github.com/getsops/sops): documentação oficial, incluindo reencriptação de arquivos após rotação de chave.
