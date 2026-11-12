# 0097. Linha de base de acessibilidade e estados das telas

- **Status:** Aceito
- **Data:** 2026-11-05
- **Contexto:** Acessibilidade / Material 3 / Estados de interface / Design system

## Contexto

O design system já documenta as regras (`design-system/06-acessibilidade.md`: 48 dp de alvo de toque, `accessibilityLiveRegion` em mensagens de status, diálogo que prende o foco, nenhuma altura fixa em elemento com texto) e a auditoria da Issue #96 (`docs/auditoria-acessibilidade.md`) corrigiu três achados por meio das issues #104, #105 e #106. A análise integral das telas de 2026-11-05 mostrou que o problema não é ausência de regra, e sim de aplicação: o `accessibilityViewIsModal` está em seis modais e ausente em dois; a prisão de foco na Web existe só no `Dialog`; `ErrorState` é o componente padrão de falha de datasource, mas `bookDetail` e `searchAlerts` inventaram os seus; `ErrorState`/`OfflineState` usam `accessibilityRole="alert"` sem região viva, enquanto `createListingStep1` usa o par correto.

Enquanto a conformidade depender de revisão humana tela a tela, cada tela nova reintroduz a divergência.

## Decisão

1. **A linha de base vira verificação executável.** `scripts/verificar-design-system.mjs` passa a varrer `src/view` e reprovar `<Modal>` sem barreira de acessibilidade. Regra que não falha o build é recomendação, não regra.
2. **Barreira e foco em todo modal.** Todo modal declara `accessibilityViewIsModal` no nativo e reaproveita o mecanismo de prisão de foco já existente no `Dialog` na Web, sem reimplementar a lógica por componente.
3. **Alvo de toque por ampliação invisível.** Quando a arte precisa ficar abaixo de 48 dp (pinos do mapa, chip compacto), amplia-se a área com `hitSlop` — o mesmo artifício já validado para o `Chip` em `docs/auditoria-acessibilidade.md:151-153` — e o teste compara com `tokens.accessibility.touchTarget`, nunca com número solto.
4. **Estados só pelos componentes do sistema.** Carregando, erro e offline de qualquer tela usam `LoadingState`, `ErrorState` e `OfflineState`, com tentativa nova explícita derivada do `reload` do ViewModel. Tela que precisa de algo além disso documenta no ADR ou na spec correspondente.
5. **Texto de validação deriva do validador.** Mensagens que citam limites (senha, título, nome) são geradas a partir da constante da camada de modelo; nenhum texto repete o limite como literal.

## Consequências

- **Positivas:** a conformidade deixa de depender de memória de revisor; os testes de regressão passam a ter critério objetivo (`check:design-system`, `interactiveAccessibility`); o comportamento fica igual entre telas para quem usa leitor de tela, tela estreita ou conexão instável.
- **Negativas / mitigações:** a varredura do item 1 pode reprovar arquivos fora do escopo desta spec — mitiga-se listando o achado na própria spec antes de estender a regra; a prisão de foco na Web continua sem verificação ponta a ponta neste ambiente (Node + mocks, sem DOM real, e Playwright proibido pelo projeto), registrada como limitação na Spec 125 e pendente de aparelho/navegador conectado; `hitSlop` maior que a arte pode gerar sobreposição perceptível de alvos em listas densas, a conferir tela a tela na Fase 4.
- **Fora desta decisão:** entrada manual de ISBN, regras de negócio que residem na View e a cobertura de `src/app/**` permanecem como entregas próprias, listadas em "Fora do escopo" da Spec 125.

## Vínculos

- Spec: `specs/125-linha-de-base-acessibilidade-e-estados/spec.md` e `tasks.md`
- Auditoria anterior: `docs/auditoria-acessibilidade.md` (issues #104, #105, #106)
- Regras de origem: `design-system/06-acessibilidade.md`
