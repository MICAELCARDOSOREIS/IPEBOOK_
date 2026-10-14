# Achados da análise do projeto IpeBook grande (2026-10-13) — projeto abandonado

> **⚠️ Em 2026-10-14, a equipe decidiu não usar mais `/home/usermicael/Projetos/IpeBook`.** Este
> arquivo passa a ser **histórico**: registra uma análise de um projeto que não é mais trabalho
> ativo da equipe. As tarefas 09 a 22 foram reformuladas como ideias de backlog genéricas para o
> `IPEBOOK_` (ver cada arquivo `tasks/<pessoa>/09-22-*.md` — agora prefixados "Backlog futuro").
> Não presumir que qualquer achado abaixo ainda se aplica a um projeto ativo.

Leitura de contexto histórico. Resume o levantamento do **outro** repositório da equipe,
`/home/usermicael/Projetos/IpeBook` (branch `develop`) — um projeto bem mais avançado que este
`IPEBOOK_` (42 specs, 41 ADRs, ~133 PRs mesclados), que a equipe decidiu não usar mais.

Todos os caminhos de arquivo citados nas tarefas 09+ são **absolutos** e apontam para
`/home/usermicael/Projetos/IpeBook/...`, não para este repositório.

## Divisão de telas/features vigente no projeto grande

De `/home/usermicael/Projetos/IpeBook/docs/DIVISAO_FEATURES.md`:

- **Maria Clara Almeida Martins:** Autenticação e Onboarding (splash, login, criação de conta,
  verificação, recuperação de senha); estados transversais (sem conexão, carregamento, erro
  genérico, vazio).
- **Micael Cardoso Reis:** Catálogo/Descoberta (feed, explorar, busca/filtros, detalhes do
  livro), Configurações e Notificações; **e, desde 02/10/2026, também o restante do fluxo de
  Negociação** (itens #39, #40, #54 — reatribuído do Antonio).
- **Antonio Carlos Gomes:** entregou a negociação mínima (#38, PR #84) e a base de Segurança
  (spec 027, ADR 0017) — fica com **Segurança/Moderação** (denunciar usuários/anúncios,
  bloquear pessoas) daqui para frente.
- **Eric Vinícius dos Santos Oliveira:** Gestão de Anúncios (cadastro/edição/arquivamento de
  livros, "Minhas publicações"/"Minha estante") e Perfil/Identidade (perfil próprio e de
  terceiros, histórico, avaliações).

## Estado geral do projeto grande

App Expo completo (Android/iOS/Web), Supabase com RLS, EAS Build, deploy web. Quase todas as
specs centrais (013 a 031, 035, 040) estão entre 70% e 100% concluídas. O que falta se
concentra em três frentes: validação em aparelho real, alguns itens de implementação ainda
abertos, e correção de bugs já identificados por auditoria.

## ⚠️ Achado crítico: remoto do GitHub quebrado

O `origin` do projeto grande aponta para `Ghostyxseven/IpeBook`, que **não existe mais no
GitHub** — só existe `Ghostyxseven/IPEBOOK_` (este projeto aqui). Issues e PRs citados em
commits antigos (#10, #38, #39, #40, #54 etc.) não puderam ser consultados dali. Bloqueia push/
PR/CI no projeto grande até ser corrigido. Ver Tarefa 12 (Micael).

## Pendências encontradas, por fonte (no projeto grande)

**A — Auditoria ADB de 13/10/2026**
(`/home/usermicael/Projetos/IpeBook/docs/auditoria-adb-2026-10-13.md`) achou 5 itens:

1. Venda aparece como "troca" nas métricas de reputação (`ProfileScreen.tsx`,
   `reputationFormat.ts`) — área: Perfil (Eric).
2. Título de conclusão da negociação assume papel errado do usuário
   (`bookRequestFormat.ts`) — área: Negociação (Micael).
3. Alvo de toque dos switches de notificações abaixo do mínimo de acessibilidade (~47×27dp em
   vez de 48×48dp, `SettingsScreen.tsx`) — área: Configurações (Micael).
4. Menu de moderação aparece para quem não deveria ter acesso (`SettingsScreen.tsx`) — área:
   Segurança/Moderação (Antonio), arquivo é de Micael — ajustar em conjunto.
5. Botão "Tools" do dev client sobrepõe controles — é do ambiente de desenvolvimento, não vira
   tarefa.

**B — Validação em aparelho real**
(`/home/usermicael/Projetos/IpeBook/docs/roteiro-validacao-aparelhos.md`): pré-requisitos
(`.env` real, migrações Supabase pendentes, duas contas de teste, Android + iPhone reais) e
depois por bloco — cada bloco cai na área de quem já é dono daquele fluxo lá.

**C — Implementação ainda aberta:**

- `specs/024`: aceitar ADR 0011 (notificações) — precisa de acordo entre Micael, Antonio e Eric.
- `specs/031-perfil-completo`: falta domínio/repositório de nome público/Instagram/foto,
  ViewModel, interface, testes e aplicar migração pública remota — área: Eric.
- `specs/018-catalogo-descoberta`: falta testar paginação com mais de 2 itens — área: Micael.
- `specs/040-web-responsiva`: falta 2ª etapa (bairro, senha, confirmações, perfis, histórico,
  rascunhos, moderação) e checar teclado/foco/estados vazios — dividido por área de cada dono.
- ADRs com pendência (`docs/adr/index.md` do projeto grande): 0015 (sem build Android gerado),
  0024 (falta validar em iPhone real), 0025 (falta configurar Vercel), 0028 (falta configurar
  provedor Google no Supabase), 0037/0039 (falta inspeção/migração remota).

**D — Documentação desatualizada:** o `README.md` do projeto grande ("Estado atual") ainda diz
que "Negociação, encontro, denúncia e bloqueio ainda não implementados", mas `specs/027` e
`specs/028` mostram que já estão quase inteiramente implementados — falta só validar em
aparelho.

**E — Apresentação final**
(`/home/usermicael/Projetos/IpeBook/docs/apresentacao-final.md`, rascunho de 02/10/2026):
checklist não resolvido — confirmar data com o professor, app instalável pela loja, contas de
demonstração, relatório de PDM completo, política de privacidade, ensaios cronometrados, plano
B em vídeo. Ver tarefa compartilhada 00c.
