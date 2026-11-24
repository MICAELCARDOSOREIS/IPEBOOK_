# Campo de busca (SearchField)

Origem no sistema base: Material 3, Search bar. Situação: **Herdado**.

## Quando usar

- Buscar livros em Início e Explorar. No iPhone, a implementação adapta a apresentação e admite
  a ação Cancelar quando a tela fornece `onCancel`.

## Anatomia

1. Contêiner em pílula com altura mínima de 56 dp, fundo `surfaceContainerLow` em repouso e borda `outline`.
2. Ícone de lupa
3. Texto do termo buscado ou placeholder
4. Botão Limpar (só quando há texto)

## Variantes

- Android e Web usam a pílula com altura mínima de 56 dp.
- O cabeçalho da Web tem uma busca compacta, também com borda `outline` em repouso.
  [WebHeader](../../src/view/components/WebHeader.tsx).
- No iPhone, o campo tem altura mínima de 44 pt, raio `cardSmall` e espaçamento interno compacto.
- O contêiner pode crescer com o texto ampliado.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Vazio | Placeholder diz o que dá para buscar ("Buscar título, autor ou categoria") | Aguarda digitação | Rótulo acessível "Buscar livros" mesmo sem rótulo visível |
| Com texto | Mostra botão Limpar | Emite `onChangeText`; a tela ou ViewModel decide como filtrar | Botão Limpar com rótulo "Limpar busca" |
| Foco | Fundo `surfaceContainerHighest`, borda e ícone `primary` | No iPhone, pode exibir Cancelar | Rótulo "Buscar livros" e comportamento de campo editável |

## Acessibilidade

- O botão Limpar mede pelo menos 48 dp no Android e na Web. No iPhone, o botão visual mede 36 pt.
  A implementação configura `hitSlop={8}` para ampliar sua área de toque.
- Rótulo acessível fixo "Buscar livros", independente do placeholder visível.
- A borda em repouso tem contraste de 3,99:1 com o preenchimento e 4,23:1 com a superfície base.
- Ao pressionar Limpar, o botão muda de cor e raio, sem alteração de escala.

## Faça e evite

- **Faça:** o placeholder diz o que dá para buscar, não um genérico "Pesquisar".
- **Evite:** esconder o botão Limpar quando há texto digitado.

## Código

```tsx
import { SearchField } from "@/view/components/SearchField";

<SearchField
  value={query}
  onChangeText={setQuery}
  onSubmitEditing={submitSearch}
/>
```
