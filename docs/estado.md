# Estado e continuidade

Conferência: 2026-10-14 (commit `38c6b6a` em `develop`). Projeto: `~/IPEBOOK_`.

## Estado verificado

- Branch ativa: `develop`, base exclusiva de desenvolvimento do projeto.
- Estrutura arquitetural: MVVM sofisticado em sete camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`) verificada sem nenhuma violação pelo script de arquitetura.
- Correção em 2026-10-14: `scripts/verificar-arquitetura.mjs` usava `path.sep` para separar o
  caminho do import, mas o especificador (`@/view/home`) sempre usa `/`; em Windows isso
  gerava falso positivo em toda importação `@/...`. Corrigido para normalizar para `/` antes de
  separar. Rodar o script em outro SO pode precisar da mesma atenção se reaparecer.
- `npm run validate` **passa limpo** no commit `38c6b6a`: typecheck ok (sem TS2345 nas rotas
  `/entrar`/`/criar-conta` — uma nota anterior aqui relatava essa falha, mas não reproduz neste
  commit; provavelmente era estado transitório de uma branch não sincronizada), arquitetura sem
  violações (30 arquivos), 75/75 testes passando em 15 arquivos.
- Cobertura de testes (commit `38c6b6a`): 95,21% statements, 84,73% branches, 98,24% funções,
  96,85% linhas — acima do limiar de 80% exigido.
- Testes E2E mobile: 3 fluxos declarativos do Maestro configurados em `.maestro/`.
- Fundamentação formal: Norma ISO/IEC 25010 (Adequação Funcional, Confiabilidade e Usabilidade/Acessibilidade) detalhada em `docs/qualidade.md` junto com guia de defesa oral.
- Vínculos e ADRs: índice completo em [docs/adr/README.md](adr/README.md) (ADRs 0001 a 0010).

## Rastreabilidade das Entregas

1. `specs/001-estrutura-mvvm/`: Fundação arquitetural do Ipebook com validação inicial.
2. `specs/002-estrategia-testes/`: Estratégia completa de testes automatizados e qualidade ISO/IEC 25010.
3. `specs/003-autenticacao-e-cadastro-de-anuncio/`: Primeira jornada funcional (criar conta/entrar, cadastrar anúncio de livro, sair).
   - **Autenticação (Maria Clara): implementada e mesclada** via PR #34 — `User`, `authValidator`, `iAuthDataSource` (issue #23, fechada), `AuthUseCases`/`MemoryAuthDataSource` (issue #24, fechada), `useAuthViewModel`/telas `signIn`/`signUp`/rotas `entrar`/`criar-conta` (issue #25, fechada).
   - **Modelo do anúncio (Antonio): implementado e mesclado** via PR #37 — `Book` estendido com `modality`/`price`/`ownerId` (issue #26, fechada).
   - **Cadastro de anúncio (Antonio): pendente** — caso de uso/infra `createListing` (issue #27) e viewmodel/tela (issue #28) ainda não implementados.
   - **Conjunta (Maria Clara + Antonio, issue #29): parcial** — container (`di/container.ts` expõe `authUseCases`) e indicador de sessão na Home já feitos; falta o botão "Anunciar" condicional (Antonio, depende de #27/#28), o teste de integração completo de SC-001, a atualização final da documentação e `validacao.md`.
   - Ver `specs/003-autenticacao-e-cadastro-de-anuncio/tasks.md` para o detalhamento por tarefa.
4. Tag de modalidade na Home (issue #39, Micael): implementada, **PR #38 aberto aguardando revisão** — ainda não mesclada em `develop`.
5. `specs/004-negociacao-simples/`: Modelo inicial (`BookRequest`, status de `Book` e contrato do datasource) implementado pelo Antonio na issue #30. Fluxo de solicitar/responder negociação ainda não implementado; depende da conclusão da spec 003.
6. `docs/`: Documentação consolidada em 7 guias temáticos (`README.md`, `produto.md`, `arquitetura.md`, `desenvolvimento.md`, `qualidade.md`, `uso.md`, `estado.md`), mais decisões de produto confirmadas diretamente pelo usuário em 2026-10-13 (problema/público, modalidade, conta) e ADRs 0005, 0006 e 0007.

## Próximos passos

1. Antonio concluir o cadastro de anúncio (issues #27, #28).
2. Revisar e mesclar o PR #38 (tag de modalidade na Home, issue #39).
3. Depois de #27/#28 prontos: fechar a issue #29 (botão "Anunciar", teste de integração completo
   de SC-001 — T015, documentação final — T016, `validacao.md` — T017).
4. Implementar o restante de `specs/004-negociacao-simples/` (Antonio — T003–T014), depois da spec 003 completa.
5. Integração contínua e envio para repositório remoto conforme autorizado.
