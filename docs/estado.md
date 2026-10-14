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
- `npm run validate` (typecheck + arquitetura + testes com cobertura) passou em 2026-10-14.
- Fundamentação formal: Norma ISO/IEC 25010 (Adequação Funcional, Confiabilidade e Usabilidade/Acessibilidade) detalhada em `docs/qualidade.md` junto com guia de defesa oral.
- Vínculos e ADRs: índice completo em [docs/adr/README.md](adr/README.md) (ADRs 0001 a 0009).

## Rastreabilidade das Entregas

1. `specs/001-estrutura-mvvm/`: Fundação arquitetural do Ipebook com validação inicial.
2. `specs/002-estrategia-testes/`: Estratégia completa de testes automatizados e qualidade ISO/IEC 25010.
3. `specs/003-autenticacao-e-cadastro-de-anuncio/`: Primeira jornada funcional (criar conta/entrar, cadastrar anúncio de livro, sair). **Trilha de autenticação implementada e testada em 2026-10-14** (Maria Clara, Tarefa 23): `User`, `authValidator`, `iAuthDataSource`, `AuthUseCases`, `MemoryAuthDataSource`, `useAuthViewModel`, telas `signIn`/`signUp`, rotas `entrar`/`criar-conta`, indicador de sessão na Home. **Cadastro de anúncio (Eric, Tarefa 24) ainda não implementado** — ver `specs/003-autenticacao-e-cadastro-de-anuncio/tasks.md` para o detalhamento por tarefa.
4. `specs/004-negociacao-simples/`: Especificação do 4º e último item do escopo do MVP (solicitar e responder negociação simples) — **especificada, implementação ainda não iniciada**. Atribuída ao Antonio (Tarefa 25), depende da spec 003 estar implementada (autenticação **e** cadastro de anúncio).
5. `docs/`: Documentação consolidada em 7 guias temáticos (`README.md`, `produto.md`, `arquitetura.md`, `desenvolvimento.md`, `qualidade.md`, `uso.md`, `estado.md`), mais decisões de produto confirmadas diretamente pelo usuário em 2026-10-13 (problema/público, modalidade, conta) e ADRs 0005, 0006 e 0007.

## Próximos passos

1. Eric implementar o cadastro de anúncio de `specs/003` (Tarefa 24: T001/T002 parte, T005,
   T006... T007, T008 revisão, T010, T012, T013 botão "Anunciar", T014 rota `anunciar.tsx`).
2. Depois de T001-T014 completas por ambos, fazer o teste de integração completo de SC-001
   (T015), atualizar a documentação final da spec (T016) e criar
   `specs/003-autenticacao-e-cadastro-de-anuncio/validacao.md` (T017).
3. Implementar `specs/004-negociacao-simples/` (Antonio — Tarefa 25), só depois da spec 003 completa.
4. Integração contínua e envio para repositório remoto conforme autorizado.
