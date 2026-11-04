# Especificação: Estratégia de Testes Automatizados e Qualidade ISO/IEC 25010

Data: 2026-10-13. Branch: `develop`. Tipo: Funcionalidade / Engenharia de Qualidade.
Contexto: Trabalho Final de Engenharia de Software III (IFPI Piripiri - Prof. Jeferson Soares).

> **Atualização (2026-11-04):** o item 7 do escopo e o CA07 (fluxos E2E com Maestro em `.maestro/`)
> não representam o estado atual. Os fluxos foram removidos quando deixaram de ser executados e
> mantidos; a validação em dispositivo passou a ser manual. Ver [`docs/qualidade.md`](../../docs/qualidade.md).

## Objetivo e Usuário
Oferecer à equipe e aos avaliadores uma suíte de testes automatizados completa, robusta, determinística e com alta cobertura no aplicativo Ipebook, alinhada aos padrões da ISO/IEC 25010 e apta a comprovar o funcionamento de regras de negócio, componentes visuais, hooks, integrações e fluxos de usuário ponta a ponta.

## Escopo
1. Testes unitários de regras de negócio e validações puras do modelo/domínio.
2. Testes de componentes com React Native Testing Library (RNTL) validando conteúdo, acessibilidade e estados visuais.
3. Testes de componentes com mocks pontuais e explicados.
4. Testes de hooks customizados (`useHomeViewModel`) com `renderHook` cobrindo ciclo de vida e concorrência.
5. Relatório e verificação de cobertura de código com `@vitest/coverage-v8`, exigindo o mínimo de 80% em statements, branches, functions e lines.
6. Testes de integração entre múltiplas camadas reais (View + ViewModel + UseCase + Datasource).
7. Três fluxos de testes E2E declarativos com Maestro (`.maestro/`).
8. Documentação técnica completa e fundamentação teórica baseada na norma ISO/IEC 25010.

Fora do escopo: Playwright (vedado expressamente nas regras globais e na constituição) e ferramentas invasivas que dependam de serviços pagos.

## Critérios de Aceite
- **CA01 (Unitários):** Suíte testa funções e regras de validação/formatação de livros com cenários de sucesso, falha e casos de borda (ex: campos vazios, limites, caracteres especiais).
- **CA02 (Componentes):** Testes com RNTL renderizam [`src/view/home.tsx`](../../src/view/home.tsx) e verificam acessibilidade (`accessibilityRole`), textos semânticos e estados de tela.
- **CA03 (Componentes com Mock):** Teste de componente isolando o hook de ViewModel com mock explícito para simular estados de carregamento forçado e falha de rede sem efeitos colaterais.
- **CA04 (Hooks):** Testes com `renderHook` validam estado inicial, transição para carregado, tratamento de erros e resiliência a condições de corrida (*race conditions*).
- **CA05 (Cobertura de Código):** Execução de `npm test -- --coverage` gera relatório v8 e atinge no mínimo 80% em statements, branches, functions e lines.
- **CA06 (Integração):** Teste exercita a interação de ponta a ponta entre View, ViewModel e Casos de Uso reais sem mockar a lógica de negócio.
- **CA07 (E2E com Maestro):** Pelo menos 3 fluxos automatizados (`01-catalogo-inicial.yaml`, `02-recuperacao-erro.yaml`, `03-navegacao-acessibilidade.yaml`) documentados e executáveis.
- **CA08 (ISO/IEC 25010 & Histórico Git):** Pelo menos 3 características de qualidade fundamentadas e comprovadas por testes automatizados; no mínimo 5 commits distribuídos no Git com mensagens semânticas em português.

## Verificação
- `npm run validate` executa typecheck, checagem de arquitetura e toda a suíte de testes.
- `npm test -- --coverage` exibe tabela de cobertura com >= 80%.
- Arquivos do Maestro em `.maestro/` validados sintaticamente e documentados para execução em emulador.
- Histórico Git inspecionado via `git log --oneline`.
