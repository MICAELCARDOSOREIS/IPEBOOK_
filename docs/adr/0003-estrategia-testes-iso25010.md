# 0003 — Estratégia de testes com RNTL, Vitest Coverage e Maestro sob a ISO/IEC 25010

Data: 2026-10-13. Status: aceito.

> **Atualização (2026-11-04):** o item 5 (Maestro) foi superado. Os fluxos E2E em `.maestro/`
> foram removidos e não são executados na CI; a validação em dispositivo passou a ser manual.
> Os demais itens desta decisão continuam válidos. Ver [`docs/qualidade.md`](../../docs/qualidade.md).

## Contexto
O projeto Ipebook exige uma estratégia abrangente e rigorosa de testes automatizados para atender aos requisitos de Engenharia de Software III (IFPI Piripiri) e aos princípios da constituição do projeto. As exigências incluem testes unitários, testes de componentes com React Native Testing Library (RNTL), componentes com mocks, testes de hooks com `renderHook`, cobertura mínima de 80%, testes de integração entre camadas, e pelo menos 3 fluxos E2E em dispositivo/emulador, fundamentando a qualidade na norma ISO/IEC 25010.

## Decisão
1. **Ambiente e Motor de Testes:** Adotar Vitest para execução rápida em Node.js com `@vitest/coverage-v8` para geração do relatório de cobertura com limiar mínimo de 80% em statements, branches, functions e lines.
2. **Testes de Componentes e Hooks:** Utilizar `@testing-library/react-native` (RNTL) para renderização semântica de componentes (`getByRole`, `getByText`, consultas acessíveis) e teste de hooks (`renderHook`), aposentando o uso de `react-test-renderer` depreciado.
3. **Mocks Estratégicos:** Mockar estritamente dependências externas ou camadas para isolamento determinístico (ex: mock do hook de ViewModel para testar a View isoladamente sob falha de rede forçada).
4. **Testes de Integração:** Exercitar múltiplas camadas reais juntas (`View` + `ViewModel` + `UseCase` + `MemoryDatasource`) sem mocks artificiais de regras de negócio.
5. **Testes E2E (Mobile):** Adotar **Maestro** com fluxos declarativos YAML em `.maestro/`, automatizando 3 fluxos críticos sem depender de Playwright (conforme vedação expressa na constituição).
6. **Alinhamento ISO/IEC 25010:** Relacionar as suítes às características: *Adequação Funcional* (completude e corretude dos casos de uso e integração), *Confiabilidade* (tratamento de concorrência, recuperação com retry e tolerância a falhas na ViewModel) e *Usabilidade/Acessibilidade* (semântica e operabilidade na View).

## Consequências
- A base ganha verificação rápida e completa executável via `npm test` e `npm test -- --coverage`.
- Testes de componentes respeitam acessibilidade e semântica de usuário real.
- Suíte atinge os 80% exigidos com feedback determinístico.
- Não há acoplamento com Playwright ou navegadores web externos para testes mobile.

Vínculos: [especificação](../../specs/002-estrategia-testes/spec.md), [plano](../../specs/002-estrategia-testes/plan.md), [ADR 0002](0002-adotar-expo-mvvm.md).
