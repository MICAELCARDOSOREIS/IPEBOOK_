# Plano de Implementação — Spec 070

**Data:** 25 de outubro de 2026  
**Referência:** Spec 070 / ADR 0053

---

## 1. Arquitetura e Componentes

- **`src/view/home.tsx`:**
  - No `renderItem` do `CatalogCarousel`:
    - Adicionar bloco condicional `item.neighborhood`:
      ```tsx
      {item.neighborhood ? (
        <View style={styles.carouselCardLocationRow}>
          <AppIcon name="place" size={14} color={colors.m3.onSurfaceVariant} />
          <Text numberOfLines={1} style={styles.carouselCardNeighborhood}>
            {item.neighborhood}
          </Text>
        </View>
      ) : null}
      ```
    - Atualizar `accessibilityLabel`:
      `Ver detalhe de ${item.title}, ${item.author}${item.neighborhood ? ` em ${item.neighborhood}` : ""}`.
    - Adicionar estilos `carouselCardLocationRow` e `carouselCardNeighborhood`.
- **`src/view/search/search.tsx`:**
  - No `renderItem` do `FlatList`:
    - Adicionar linha com ícone `place` e `item.neighborhood`.
    - Atualizar `accessibilityLabel`.
    - Adicionar estilos correspondentes em `createStyles(colors)`.

---

## 2. Testes (TDD)

1. Adicionar teste em `tests/components-mocked/homeViewMocked.test.tsx` verificando a exibição do selo de bairro no card da Home.
2. Adicionar teste em `tests/components-mocked/searchView.test.tsx` verificando a exibição do selo de bairro no card de busca.
3. Validar regressão rodando a suíte de testes.
