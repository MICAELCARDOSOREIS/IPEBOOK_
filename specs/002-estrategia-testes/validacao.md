# Validação da Estratégia de Testes Automatizados

Data: 2026-10-13. Branch: `develop`.
Status: Implementado e validado localmente com 100% de sucesso.

> **Atualização (2026-11-04):** a seção de testes E2E com Maestro registra uma evidência que não
> existe mais. Os fluxos foram removidos e a validação em dispositivo passou a ser manual; os
> números desta validação são históricos. Ver [`docs/qualidade.md`](../../docs/qualidade.md).

## Evidências Executáveis

### 1. `npm run validate` (Código de Saída: 0)
O script agregador executa em sequência três etapas críticas:
1. `tsc --noEmit` (TypeScript Estrito): zero erros de tipagem.
2. `node scripts/verificar-arquitetura.mjs`: 12 arquivos verificados na árvore `src/`, zero violações de importação entre camadas.
3. `npm run test:coverage`: execução da suíte completa de testes com relatório v8.

### 2. Relatório de Cobertura de Código (v8)
* **Statements:** 98.46% (meta mínima exigida: 80%)
* **Branches:** 95.65% (meta mínima exigida: 80%)
* **Functions:** 100.00% (meta mínima exigida: 80%)
* **Lines:** 100.00% (meta mínima exigida: 80%)

### 3. Distribuição das Suítes e Testes Aprovados (31 testes no total)
* `tests/unit/bookValidator.test.ts` (13 testes): funções puras de validação, limites de 2 a 150 caracteres, casos de borda exatos, sanitização e formatação.
* `tests/unit/bookUseCases.test.ts` (4 testes): regras de negócio dos casos de uso, imutabilidade do catálogo e erros de domínio.
* `tests/hooks/useHomeViewModel.test.tsx` (5 testes): ciclo de vida do hook `useHomeViewModel`, estado inicial, recarregamento, concorrência e tratamento seguro de exceções.
* `tests/components/homeView.test.tsx` (4 testes): renderização com RNTL, cabeçalhos com `accessibilityRole="header"`, subtítulo institucional e mensagem informativa no estado vazio.
* `tests/components-mocked/homeViewMocked.test.tsx` (3 testes): mock explícito da ViewModel para forçar determinismo em estados de carregamento, alerta de erro e acionamento do botão "Tentar novamente".
* `tests/integration/homeIntegration.test.tsx` (2 testes): integração real conectando `MemoryBookDataSource` -> `BookUseCases` -> `useHomeViewModel` -> View sem mocks artificiais.

### 4. Testes End-to-End (E2E) com Maestro
Criados 3 fluxos reais em `.maestro/`:
* `01-catalogo-inicial.yaml`: abertura, cabeçalho e estado vazio.
* `02-recuperacao-erro-retry.yaml`: tratamento de falha e recuperação com retry.
* `03-acessibilidade-e-elementos.yaml`: semântica e rolagem.

## Alinhamento com a Norma ISO/IEC 25010
* **Adequação Funcional:** Comprovada por testes unitários e de integração validando regras de dados e casos de uso.
* **Confiabilidade:** Comprovada por testes de hooks e mocks demonstrando tolerância a falhas, descarte de requisições concorrentes e botão de retry.
* **Usabilidade / Acessibilidade:** Comprovada por testes de componentes com RNTL e fluxos Maestro avaliando elementos semânticos para leitores de tela.

## Histórico Git
Commits pequenos, semânticos e categorizados registrados na branch `develop`, atendendo rigorosamente à regra de não concentrar testes em um único commit.
