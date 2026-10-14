# Estado e continuidade

Conferência: 2026-10-14. Projeto: `~/IPEBOOK_`.

## Estado verificado

- Branch ativa: `develop`, base exclusiva de desenvolvimento do projeto.
- Estrutura arquitetural: MVVM sofisticado em sete camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`) verificado sem nenhuma violação pelo script de arquitetura.
- Pirâmide de testes implementada e aprovada: 36 testes em 8 arquivos cobrindo unitários, hooks, componentes RNTL, componentes mockados e integração real.
- Testes E2E mobile: 3 fluxos declarativos do Maestro configurados em `.maestro/` (havia 2 arquivos órfãos duplicados sem uso; removidos em 2026-10-14).
- Cobertura de testes: > 98% de statements, > 95% de branches, 100% de funções e 100% de linhas, superando o limiar de 80% exigido.
- Fundamentação formal: Norma ISO/IEC 25010 (Adequação Funcional, Confiabilidade e Usabilidade/Acessibilidade) detalhada em `docs/qualidade.md` junto com guia de defesa oral.
- Vínculos e ADRs: índice completo em [docs/adr/README.md](adr/README.md) (ADRs 0001 a 0009).

## Rastreabilidade das Entregas

1. `specs/001-estrutura-mvvm/`: Fundação arquitetural do Ipebook com validação inicial.
2. `specs/002-estrategia-testes/`: Estratégia completa de testes automatizados e qualidade ISO/IEC 25010.
3. `specs/003-autenticacao-e-cadastro-de-anuncio/`: Especificação da primeira jornada funcional (criar conta/entrar, cadastrar anúncio de livro, sair) — **especificada, implementação ainda não iniciada**. Atribuída: autenticação à Maria Clara (Tarefa 23), cadastro de anúncio ao Eric (Tarefa 24).
4. `specs/004-negociacao-simples/`: Especificação do 4º e último item do escopo do MVP (solicitar e responder negociação simples) — **especificada, implementação ainda não iniciada**. Atribuída ao Antonio (Tarefa 25), depende da spec 003 estar implementada.
5. `docs/`: Documentação consolidada em 7 guias temáticos (`README.md`, `produto.md`, `arquitetura.md`, `desenvolvimento.md`, `qualidade.md`, `uso.md`, `estado.md`), mais decisões de produto confirmadas diretamente pelo usuário em 2026-10-13 (problema/público, modalidade, conta) e ADRs 0005, 0006 e 0007.

Com as specs 003 e 004, todo o escopo do MVP decidido na Tarefa 3 está especificado. Não há
mais lacuna de especificação — o que falta agora é implementação.

## Próximos passos

1. Implementar `specs/003-autenticacao-e-cadastro-de-anuncio/` (Maria Clara — Tarefa 23; Eric —
   Tarefa 24).
2. Implementar `specs/004-negociacao-simples/` (Antonio — Tarefa 25), só depois da spec 003.
3. Integração contínua e envio para repositório remoto conforme autorizado.
