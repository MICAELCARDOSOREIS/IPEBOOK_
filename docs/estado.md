# Estado e continuidade

Conferência: 2026-10-14. Projeto: `~/IPEBOOK_`.

## Estado verificado

- Branch ativa: `develop`, base exclusiva de desenvolvimento do projeto.
- Estrutura arquitetural: MVVM sofisticado em sete camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`) verificada sem nenhuma violação pelo script de arquitetura.
- Correção em 2026-10-14: `scripts/verificar-arquitetura.mjs` usava `path.sep` para separar o
  caminho do import, mas o especificador (`@/view/home`) sempre usa `/`; em Windows isso
  gerava falso positivo em toda importação `@/...`. Corrigido para normalizar para `/` antes de
  separar. Rodar o script em outro SO pode precisar da mesma atenção se reaparecer.
- Pirâmide de testes: 75 testes em 15 arquivos cobrindo unitários, hooks, componentes RNTL, componentes mockados e integração real (36 da fundação + 6 arquivos novos da trilha de autenticação em 2026-10-14: `authValidator`, `authUseCases`, `useAuthViewModel`, telas de entrar/criar conta, indicador de sessão na Home, integração de autenticação).
- Testes E2E mobile: 3 fluxos declarativos do Maestro configurados em `.maestro/` (havia 2 arquivos órfãos duplicados sem uso; removidos em 2026-10-14).
- Cobertura de testes (2026-10-14, após a trilha de autenticação): 96,46% statements, 88,28%
  branches, 98,24% funções, 98,33% linhas — acima do limiar de 80% exigido, mas abaixo dos
  números anteriores (>98%/>95%) por causa do código novo; ver `npm run test:coverage`.
- `npm run validate` passou historicamente em 2026-10-14. Na conferência posterior do estado
  atual, falhou no `typecheck` com TS2345 nas rotas `/entrar` e `/criar-conta`: os tipos locais
  gerados do Expo ainda não as incluem. O comando parou antes das outras etapas. Separadamente,
  75 testes passaram e a arquitetura verificou 30 arquivos sem violações. Não há validação
  completa aprovada para o estado atual.
- Fundamentação formal: Norma ISO/IEC 25010 (Adequação Funcional, Confiabilidade e Usabilidade/Acessibilidade) detalhada em `docs/qualidade.md` junto com guia de defesa oral.
- Vínculos e ADRs: índice completo em [docs/adr/README.md](adr/README.md) (ADRs 0001 a 0010).

## Rastreabilidade das Entregas

1. `specs/001-estrutura-mvvm/`: Fundação arquitetural do Ipebook com validação inicial.
2. `specs/002-estrategia-testes/`: Estratégia completa de testes automatizados e qualidade ISO/IEC 25010.
3. `specs/003-autenticacao-e-cadastro-de-anuncio/`: Primeira jornada funcional (criar conta/entrar, cadastrar anúncio de livro, sair). **Trilha de autenticação implementada, mas com validação completa pendente** (Maria Clara, Tarefa 23): `User`, `authValidator`, `iAuthDataSource`, `AuthUseCases`, `MemoryAuthDataSource`, `useAuthViewModel`, telas `signIn`/`signUp`, rotas `entrar`/`criar-conta`, indicador de sessão na Home. **Cadastro de anúncio ainda não implementado**: modelo atribuído à Maria Clara (issue #26) e restante ao Antonio (Tarefa 24, issues #27/#28); ver `specs/003-autenticacao-e-cadastro-de-anuncio/tasks.md`.
4. `specs/004-negociacao-simples/`: Modelo inicial (`BookRequest`, status de `Book` e contrato do datasource) implementado pelo Antonio na issue #30. Fluxo de solicitar/responder negociação ainda não implementado; depende da conclusão da spec 003.
5. `docs/`: Documentação consolidada em 7 guias temáticos (`README.md`, `produto.md`, `arquitetura.md`, `desenvolvimento.md`, `qualidade.md`, `uso.md`, `estado.md`), mais decisões de produto confirmadas diretamente pelo usuário em 2026-10-13 (problema/público, modalidade, conta) e ADRs 0005, 0006 e 0007.

## Próximos passos

1. Maria Clara implementar o modelo do anúncio (T001/T002 parte, issue #26); Antonio concluir
   o cadastro em `specs/003` (T005/T007/T010/T012, rota T014 e sua parte conjunta de T008/T013).
2. Regularizar a tipagem das rotas. Depois de T001-T014 completas por ambos, fazer o teste de integração completo de SC-001
   (T015), atualizar a documentação final da spec (T016) e criar
   `specs/003-autenticacao-e-cadastro-de-anuncio/validacao.md` (T017).
3. Implementar o restante de `specs/004-negociacao-simples/` (Antonio — T003–T014), depois da spec 003 completa.
4. Integração contínua e envio para repositório remoto conforme autorizado.
