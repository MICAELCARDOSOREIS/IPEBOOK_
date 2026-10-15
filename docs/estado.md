# Estado e continuidade

## Atualização em 2026-10-15 — Specs 008, 009, 010, 011 e 012 integradas em develop

- **Spec 008 (Meus Anúncios)**: Implementada e integrada em `develop`. Rota `/meus-anuncios`, view `MyListings`, caso de uso `listMyListings` e método `listByOwner` nos datasources. Atalho na Home.
- **Spec 009 (Detalhes da Negociação Aceita e Ponto de Encontro)**: Implementada e integrada em `develop`. Rota `/negociacao/[id]`, view `RequestDetail`, caso de uso `getRequestDetail` com bloqueio de terceiros e sugestão de pontos públicos seguros em Piripiri, PI. Atalho "Ver detalhes do encontro" em "Pedidos recebidos" e "Meus pedidos" para itens aceitos.
- **Spec 010 (Termos de Uso e Política de Privacidade)**: Implementada e integrada em `develop`. Rota `/termos`, view `TermsAndPrivacy`, modelo `legalContent.ts` com regras da comunidade de Piripiri, PI, LGPD e limites de responsabilidade. Atalhos na Home e na tela de Cadastro.
- **Spec 011 (Denúncia de Anúncio e Moderação Comunitária)**: Implementada e integrada em `develop`. Rota `/denunciar/[id]`, tela `ReportListingScreen`/`ReportListing`, caso de uso `ReportUseCases` com validações de sessão e motivos pré-definidos (UGC/conformidade com diretrizes de app store), datasources em memória e Supabase. Atalho "Denunciar anúncio" no detalhe do livro.
- **Spec 012 (Central de Ajuda, FAQ e Guia de Segurança em Piripiri)**: Implementada e integrada em `develop`. Rota `/ajuda`, view `HelpAndFaq`, modelo `helpContent.ts` com filtros interativos por categoria (Segurança em Piripiri, Regras e Trocas, Suporte). Atalho no rodapé da Home.
- `npm run check:architecture` passa com 89 arquivos (0 violações); 279 testes passam em 52 arquivos; cobertura > 80% em todas as métricas; `npm run build:web` exporta 17 rotas estáticas.
- A responsabilidade de Perfil da Maria Clara (Issue #55) permaneceu intacta e sem colisões.

## Atualização em 2026-10-15 — beta em implementação

- Branch de trabalho: `feature/beta-supabase-base`, derivada de `develop` em `1c9a395`.
- Base antes da mudança: `npm run validate` passou com 166 testes, tipos e arquitetura.
- Após as alterações locais: `npm run validate` passou com 190 testes em 30 arquivos,
  teste SQL local de migrações/RLS, checagem de 57 arquivos de arquitetura e cobertura de
  81,35% de ramificações; `npm run build:web` exportou 10 rotas. Isso não comprova o fluxo
  remoto nem a entrega de e-mail.
- Spec 007 e ADR 0012 registrados. Há migrações locais para anúncios e pedidos (tabelas
  `v2_books`/`v2_book_requests`) e adaptadores Supabase ativáveis explicitamente.
- **Continuação em 2026-10-15:** o único projeto Supabase disponível (`xiuuiggpccpgrwkzeloc`,
  o mesmo do `.env`) tinha um esquema de outra versão/equipe do IpeBook com dados reais
  (`listings`, `profiles`, `book_requests`, `notifications`, `favorites`, `ratings`, `reports`,
  `request_messages`, `user_blocks`; 9 anúncios, 6 perfis, 4 pedidos etc.). Não há ferramenta
  disponível para apagar o projeto inteiro. Com autorização explícita do usuário — informado
  do volume de dados envolvido —, esse esquema legado e 15 funções `SECURITY DEFINER` órfãs
  foram apagados, e as migrações da spec 007 foram aplicadas do zero no mesmo projeto via MCP
  do Supabase (`apply_migration`), sem usar a CLI local. `public.v2_books` e
  `public.v2_book_requests` existem agora no projeto real, com RLS habilitado e sem dados. O
  advisor de segurança do Supabase não reporta mais as funções legadas; resta só o aviso padrão
  de "Leaked Password Protection Disabled" (configuração de Auth, não tratada). As quatro
  migrações locais que só espelhavam o esquema legado foram removidas do repositório. Ainda não
  há validação de fluxo real com duas contas, nem envio de e-mail/retorno de link testado
  contra esse projeto — ver `specs/007-contas-persistentes/validacao.md`.
- A senha temporária exibida no MVP foi removida. O modo em memória não simula e-mail nem
  altera a senha; há tela para definir nova senha a partir de link Supabase. Ainda é necessário
  validar o retorno do link no Android e Web e configurar SMTP próprio.
- As issues #55/#56 da spec 006 seguem abertas e atribuídas à Maria Clara. Não foram alteradas
  por esta branch.
- Cloudflare Pages foi escolhido para a Web da beta; não há publicação configurada ou
  verificada. A configuração Vercel descrita no histórico abaixo pertence ao MVP anterior.
- O usuário definiu Piripiri, PI, como a única cidade da beta. A regra ainda precisa de
  especificação, implementação e verificação; nenhuma limitação geográfica está ativa no app.
- Pendências antes da beta: completar e testar RLS com duas contas, aceite atômico, perfil/idade/
  cidade/contato, fotos, moderação, exclusão de conta, legal, monitoramento e publicação. A
  cidade/UF foi definida, mas o domínio ainda não foi informado. Supabase Pro requer autorização de gasto.
- A auditoria `npm audit --omit=dev` reportou 32 avisos nas dependências, inclusive um crítico
  em `shell-quote`; não houve atualização automática fora do escopo. Avaliar os caminhos de
  execução relevantes antes de distribuir um APK ou publicar a Web.

O restante deste documento é o registro anterior e pode conter contagens, links e prioridades
superados por esta atualização. Atualizar a consolidação ao concluir a spec 007.

Conferência: 2026-10-14 (base: branch `develop`, após merge do deploy web — PR #45 — e correção
do `typecheck`). Projeto: `~/IPEBOOK_`.

**Equipe ativa:** Micael Cardoso Reis e Maria Clara Almeida Martins. Eric Vinícius dos Santos
Oliveira e Antonio Carlos Gomes saíram da equipe em 2026-10-14.

## Estado verificado

- Branch ativa: `develop`.
- O `typecheck` agora gera os tipos de rota do Expo antes de executar TypeScript
  (`expo customize tsconfig.json && tsc --noEmit`, ver `package.json`). A validação passou
  também após remover temporariamente `.expo/types/router.d.ts`, confirmando que as rotas
  `/pedidos-recebidos` e `/meus-pedidos` são reconhecidas em um ambiente sem tipos prévios —
  corrige o falso-positivo de typecheck que antes exigia regenerar o cache manualmente
  (`expo start`) a cada rota nova.
- Estrutura arquitetural: MVVM sofisticado em sete camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`) verificada sem nenhuma violação pelo script de arquitetura (`check:architecture`).
- Correção em 2026-10-14: `scripts/verificar-arquitetura.mjs` usava `path.sep` para separar o
  caminho do import, mas o especificador (`@/view/home`) sempre usa `/`; em Windows isso
  gerava falso positivo em toda importação `@/...`. Corrigido para normalizar para `/` antes de
  separar.
- `npm run validate` **passa limpo**: typecheck ok, arquitetura sem violações (45 arquivos),
  144/144 testes passando em 24 arquivos.
- Cobertura de testes: 94,19% statements, 82,54% branches, 94,44% funções, 95,88% linhas — acima
  do limiar de 80% exigido.
- Build Web (`npm run build:web`): exportação estática com 8 rotas compiladas sem falhas.
  Deploy estático configurado para a Vercel (`vercel.json`, issue #7/#39 — Micael, PR #45);
  falta só conectar o repositório a um projeto Vercel para publicar de fato.
- Testes E2E mobile: 3 fluxos declarativos do Maestro configurados em `.maestro/`.
- Conferência visual via ADB no Samsung SM_A165M em 2026-10-14: telas e estados do MVP registrados em [versões/MVP](versoes/mvp/resumo.md). O anúncio fictício retornou à Home, mas não apareceu no catálogo; negociação no aparelho permanece sem validação.
- Fundamentação formal: Norma ISO/IEC 25010 (Adequação Funcional, Confiabilidade e Usabilidade/Acessibilidade) detalhada em `docs/qualidade.md` junto com guia de defesa oral.
- Vínculos e ADRs: índice completo em [docs/adr/README.md](adr/README.md) (ADRs 0001 a 0010).

## Rastreabilidade das Entregas

1. `specs/001-estrutura-mvvm/`: Fundação arquitetural do Ipebook com validação inicial.
2. `specs/002-estrategia-testes/`: Estratégia completa de testes automatizados e qualidade ISO/IEC 25010.
3. `specs/003-autenticacao-e-cadastro-de-anuncio/`: **Completa** — primeira jornada funcional
   (criar conta/entrar, cadastrar anúncio de livro, sair) implementada e validada ponta a ponta.
   - **Autenticação (Maria Clara)**: via PR #34 — `User`, `authValidator`, `iAuthDataSource`
     (issue #23, fechada), `AuthUseCases`/`MemoryAuthDataSource` (issue #24, fechada),
     `useAuthViewModel`/telas `signIn`/`signUp`/rotas `entrar`/`criar-conta` (issue #25, fechada).
   - **Modelo e cadastro de anúncio (Antonio)**: `Book` com `modality`/`price`/`ownerId` (issue
     #26, PR #37); `createListing`/`MemoryBookDataSource.create` (issue #27, PR #41);
     `useCreateListingViewModel`/`createListing.tsx`/rota `anunciar.tsx` (issue #28, PR #42).
   - **Conjunta (issue #29)**: container já compunha `authUseCases`+`bookUseCases`; botão
     "Anunciar" condicional adicionado em `src/view/home.tsx`; corrigido bug em
     `src/app/anunciar.tsx` que passava `sessionUserId={null}` fixo (cadastro sempre falhava) —
     criado `src/view/listings/createListingScreen.tsx` como gate de sessão (redireciona para
     `/entrar` sem sessão, só então renderiza o formulário com o `sessionUserId` real); teste de
     integração completo de SC-001 em `tests/integration/sc001Integration.test.ts` (criar conta
     → entrar → cadastrar anúncio de cada modalidade → ver na listagem, pelas camadas reais).
   - Ver `specs/003-autenticacao-e-cadastro-de-anuncio/tasks.md` e `validacao.md` para o
     detalhamento e as evidências.
4. Tag de modalidade na Home (issue #39, Micael): implementada e mesclada (PR #38).
5. `specs/004-negociacao-simples/`: **Completa** — fluxo de negociação simples (solicitar e responder) implementado ponta a ponta (Antonio Carlos Gomes, Tarefa 25 / issue #21):
   - Modelo e contratos: `BookRequest`, `RequestStatus`, `Book.status` e `IBookRequestDataSource` (T001/T002, issue #30).
   - Casos de uso e infraestrutura: `BookRequestUseCases` (T003/T004) com regras de bloqueio (FR-001 a FR-003) e recusa automática de concorrentes com reserva do anúncio (FR-004/SC-002); `MemoryBookRequestDataSource` (T005); container DI atualizado com `IBookRequestUseCases` (T006).
   - ViewModels (T007/T008): `useRequestNegotiationViewModel`, `useReceivedRequestsViewModel`, `useSentRequestsViewModel`.
   - Views e rotas (T009/T010/T011): botão "Solicitar negociação" e atalhos na Home (`src/view/home.tsx`), telas `receivedRequests.tsx` e `sentRequests.tsx` com `requestListLayout.tsx`, e rotas `src/app/pedidos-recebidos.tsx` e `src/app/meus-pedidos.tsx`.
   - Teste de integração (T012): `tests/integration/sc002Integration.test.tsx` validando o cenário SC-002 pelas camadas reais.
   - Ver `specs/004-negociacao-simples/tasks.md` e `validacao.md` para o detalhamento e evidências.
6. `docs/`: Documentação consolidada em 7 guias temáticos (`README.md`, `produto.md`, `arquitetura.md`, `desenvolvimento.md`, `qualidade.md`, `uso.md`, `estado.md`), mais decisões de produto confirmadas diretamente pelo usuário em 2026-10-13 (problema/público, modalidade, conta) e ADRs 0005, 0006 e 0007.

## Próximos passos

1. ~~Criar Pull Request da branch `feature/21-negociacao-telas` para `develop`~~ — feito (PR #44,
   issue #21 fechada).
2. Publicar de fato o deploy Web: conectar o repositório a um projeto Vercel (ação externa,
   fora do alcance de automação — precisa de login/conta do responsável).
3. Revisar e integrar a correção da geração de tipos de rota no `typecheck` (ver `package.json`)
   nas próximas validações de CI.
4. Validar os fluxos em dispositivo físico; testes automatizados e build web não substituem
   essa conferência.
5. O backlog futuro (perfil de usuário, layout web dedicado, métricas de reputação, build
   Android, notificações, moderação) foi apagado em 2026-10-14 — eram anotações condicionais
   sem trabalho ativo. Especificar do zero pelo Spec Kit se/quando a necessidade de produto
   correspondente surgir de verdade.
