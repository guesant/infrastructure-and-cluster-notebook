# cluster-management-notes

Minhas anotações sobre como criar e operar clusters K3s de nó único (*single-node*) ou multinó (*multi-node*), reunindo conceitos, melhores práticas, guias passo a passo e scripts reutilizáveis.

!!! note
    As anotações deste guia foram elaboradas e revisadas com o apoio de inteligência artificial, especificamente o ChatGPT. Alguns scripts e outros conteúdos deste repositório também podem ter sido criados ou modificados com auxílio de IA. Valide o código, os comandos, as versões e as decisões de segurança de acordo com o seu ambiente antes de utilizá-los.

!!! danger
    Execute primeiro em um ambiente de teste. Os comandos alteram autenticação SSH, firewall, serviços do sistema e componentes do cluster. Mantenha uma sessão SSH funcional aberta durante mudanças de acesso e tenha acesso ao console da máquina antes de aplicar regras remotamente.

## Escopo e premissas

- Hosts Debian ou Ubuntu com `systemd`.
- Arquiteturas `amd64` e `arm64`.
- Comandos de administração do host executados como `root`. Quando estiver em uma conta comum, abra antes um shell com `sudo -i`.
- Nomes de nós, endereços IP, nomes DNS, portas e demais parâmetros do ambiente são solicitados pelos blocos interativos antes da execução.
- O kubeconfig administrativo do K3s concede acesso total ao cluster e deve ser armazenado com permissão `0600`.
- As versões abaixo são os valores padrão oferecidos pelos prompts para facilitar o copia e cola. Elas são referências, não uma matriz de compatibilidade homologada por este repositório; informe outra versão quando necessário e valide o conjunto em homologação antes de atualizar produção.

!!! note
    Nos prompts, o valor entre colchetes é usado quando Enter é pressionado sem digitar nada. Os blocos interativos encapsulados usam `bash <<'EOF'`. Não acrescente `-c`: essa opção exige o script como argumento, enquanto o heredoc entrega o script pela entrada padrão. Dentro desses blocos, os prompts leem de `/dev/tty` para não consumir as próximas linhas do próprio heredoc.

| Componente | Versão padrão usada ou sugerida |
| --- | --- |
| K3s | `v1.36.1+k3s1` |
| Gateway API, canal Standard | `v1.5.1` |
| cert-manager | `v1.20.0` |
| Longhorn e longhornctl | `1.12.0` |
| Chart Helm do Argo CD | `10.1.3` |
| Chart CloudNativePG / operator | `0.29.0` / `1.30.0` |
| Chart Infisical Secrets Operator | `0.11.3` |

### Convenções de execução

Cada bloco shell informa onde deve ser executado:

- **nó alvo:** host Linux que será alterado; pode ser manager, agent ou uma máquina fora do cluster;
- **nó manager:** nó K3s com função server/control-plane;
- **nó agent:** nó K3s com função agent/worker;
- **máquina com KUBECONFIG:** qualquer manager ou estação administrativa que tenha `kubectl`, acesso à API e um kubeconfig com as permissões necessárias;
- **estação administrativa:** máquina de origem usada para SSH, túneis ou instalação de CLIs; não precisa pertencer ao cluster.

## Ordem recomendada

1. Preparar o firewall do host.
2. Validar as chaves e endurecer o SSH.
3. Instalar e validar o Fail2Ban.
4. Criar o primeiro servidor K3s.
5. Instalar os CRDs da Gateway API e configurar o Traefik.
6. Adicionar os demais servidores e agentes.
7. Instalar cert-manager, Longhorn e Argo CD.
8. Conectar o Argo CD ao repositório GitOps e aplicar a Application `root`.
9. Se usar Infisical, instalar o Secrets Operator, aplicar o Secret de bootstrap e só então habilitar as sincronizações.
10. Modelar NetworkPolicies em homologação e permitir explicitamente os fluxos necessários.
11. Configurar backups e registrar o procedimento de atualização.

## Sumário

- [Configuração dos hosts](hosts.md): firewall, hardening do SSH e Fail2Ban.
- [Gestão dos nós K3s](k3s.md): arquitetura, instalação, Gateway API, NetworkPolicy, acesso, backup e atualização.
- [Ferramentas de linha de comando](command-line-tools.md): kubectl, Helm, Argo CD CLI e longhornctl.
- [Serviços básicos](core-services.md): cert-manager, Longhorn, Argo CD e Infisical.
- [Templates copiáveis](templates.md): estrutura GitOps e componentes opcionais.
- [Checklist operacional](operational-checklist.md): verificações antes de concluir a instalação.
