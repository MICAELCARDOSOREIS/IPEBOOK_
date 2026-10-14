# Estado e continuidade

Conferência: 2026-10-14 (base: commit `38c6b6a` em `develop`, mais a conclusão da issue #29
nesta branch). Projeto: `~/IPEBOOK_`.

## Estado verificado

- Branch ativa: `develop`, base exclusiva de desenvolvimento do projeto.
- Estrutura arquitetural: MVVM sofisticado em sete camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`) verificada sem nenhuma violação pelo script de arquitetura.
- Correção em 2026-10-14: `scripts/verificar-arquitetura.mjs` usava `path.sep` para separar o
  caminho do import, mas o especificador (`@/view/home`) sempre usa `/`; em Windows isso
  gerava falso positivo em toda importação `@/...`. Corrigido para normalizar para `/` antes de
  separar. Rodar o script em outro SO pode precisar da mesma atenção se reaparecer.
- `npm run validate` **passa limpo**: typecheck ok, arquitetura sem violações (34 arquivos),
  107/107 testes passando em 19 arquivos.
- Cobertura de testes: 96,28% statements, 86,98% branches, 97,5% funções, 97,53% linhas — acima
  do limiar de 80% exigido.
- Testes E2E mobile: 3 fluxos declarativos do Maestro configurados em `.maestro/`.
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
5. `specs/004-negociacao-simples/`: Modelo inicial (`BookRequest`, status de `Book` e contrato
   do datasource) implementado pelo Antonio na issue #30. Fluxo de solicitar/responder
   negociação ainda não implementado — agora que a spec 003 está completa, pode prosseguir.
6. `docs/`: Documentação consolidada em 7 guias temáticos (`README.md`, `produto.md`, `arquitetura.md`, `desenvolvimento.md`, `qualidade.md`, `uso.md`, `estado.md`), mais decisões de produto confirmadas diretamente pelo usuário em 2026-10-13 (problema/público, modalidade, conta) e ADRs 0005, 0006 e 0007.

## Próximos passos

1. Revisar e mesclar o PR da issue #29 (este trabalho).
2. Implementar o restante de `specs/004-negociacao-simples/` (Antonio — T003–T014), agora que a
   spec 003 está completa.
3. Integração contínua e envio para repositório remoto conforme autorizado.
