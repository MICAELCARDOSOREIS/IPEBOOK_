# 0116. Padronização Apple HIG para Descoberta, Busca, Favoritos e Detalhes no iOS

- **Status:** Aceito
- **Data:** 2026-11-17
- **Autora:** Maria Clara (`clarinhamartins`)
- **Especificações vinculadas:** Spec 137 (Fase 2, Tarefa T004, Issue #229)
- **Decisões relacionadas:** ADR 0008, ADR 0095, ADR 0108, ADR 0115

## Contexto

A Spec 137 (iOS Nativo no Padrão Apple HIG) define na Tarefa T004 (Issue #229) a adaptação de 22 telas do Figma dos Fluxos 02 e 03 (Descoberta, Busca, Favoritos, Alertas, Detalhe do Livro e Perfil Público) à experiência nativa do iPhone.

Nas plataformas móveis, as expectativas de interação diferem substancialmente:
- No Android, o Material Design 3 emprega superfícies tonais e ondulação de toque (*ripple*).
- No iOS, o Apple HIG preconiza feedback tátil sutil (*Haptics*), cantos contínuos suaves, barras de busca com cancelamento claro, alvos de toque de no mínimo 44×44 pt e posicionamento ergonômico na zona do polegar (*Thumb Zone*) com respeito estrito às margens do *Home Indicator*.

## Decisão

Adotar melhorias específicas e isoladas para iOS (`Platform.OS === 'ios'`) nos componentes e telas dos fluxos de Descoberta e Busca:

1. **Feedback tátil (*Haptics*):**
   - Disparo de `triggerHaptic("selection")` ao alternar favoritos em `FavoriteButton`, selecionar critérios de ordenação em `SortSheet`, aplicar filtros em `FilterSheet` e acionar a ação principal de negociação em `BookDetail`.
   - Disparo de `triggerHaptic("light")` ao limpar ou cancelar busca em `SearchField`, limpar filtros em `FilterSheet` e acionar ações de denúncia em `PublicProfile`.

2. **Barra de busca no padrão HIG (`SearchField`):**
   - Altura de 44 pt no iOS (`containerIos`), cantos arredondados contínuos de raio médio e botão lateral "Cancelar" acessível visível durante a interação.

3. **Folhas inferiores e ordenação (`SortSheet` e `FilterSheet`):**
   - Cantos superiores contínuos de 28 pt no iOS (`tokens.radius.xxl`), alinhamento visual do drag handle ao padrão Apple e padding inferior adaptável ao *Home Indicator* via `useSafeAreaInsets` (`Math.max(tokens.spacing[8], insets.bottom)`).
   - Suporte condicional à translucidez Liquid Glass quando a acessibilidade "Reduzir Transparência" estiver desativada.

4. **Zona do Polegar (*Thumb Zone*) em Detalhes do Livro (`BookDetail`):**
   - Barra de ação inferior fixa ancorada com respiro seguro contra o *Home Indicator* e feedback tátil sutil ao iniciar solicitação ou proposta de troca.

5. **Isolamento de Plataforma:**
   - Todo comportamento e estilo iOS é condicionado estritamente a `Platform.OS === 'ios'`. Android (M3) e Web mantêm integralmente sua implementação, contratos e estética anteriores.

## Consequências

- **Positivas:**
  - Telas de catálogo, busca, favoritos e detalhe proporcionam sensação tátil premium e responsiva típica de apps iOS de primeira linha.
  - Alvos de toque atendem às diretrizes de ergonomia da Apple (mínimo de 44 pt).
  - Acessibilidade preservada com respeito integral à redução de transparência.
- **Negativas / Mitigações:**
  - Requer testes que simulem a plataforma iOS em ambiente Node/Jest, cobertos por `tests/unit/iosDiscoveryAndSearch.test.tsx` com mocks isolados.
