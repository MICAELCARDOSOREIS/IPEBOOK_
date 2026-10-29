# Campo de busca (SearchField)

Origem no sistema base: Material 3, Search bar. Situação: **Herdado**.

## Quando usar

- Buscar livros nas telas Início e Explorar (Android e Web).

## Quando não usar

- No iOS (quando entrar em escopo) — usar o campo de busca nativo da barra (Tab de busca), não
  este componente.

## Anatomia

1. Container em pílula de 56 px (`radius-full`, fundo `surface-container-high`)
2. Ícone de lupa
3. Texto do termo buscado ou placeholder
4. Botão Limpar (só quando há texto)

## Variantes

Não há variantes — um único estilo de campo de busca em todo o app.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Vazio | Placeholder diz o que dá para buscar ("Buscar título, autor ou categoria") | Aguarda digitação | Rótulo acessível "Buscar livros" mesmo sem rótulo visível |
| Com texto | Mostra botão Limpar | Emite `onChangeText`; a tela ou ViewModel decide como filtrar | Botão Limpar com rótulo "Limpar busca" |
| Foco | Mantém o mesmo container visual; o teclado é aberto pelo sistema | Teclado aberto | Rótulo "Buscar livros" e comportamento de campo editável |

## Acessibilidade

- Alvo de toque mínimo de 48 dp, inclusive o botão Limpar.
- Rótulo acessível fixo "Buscar livros", independente do placeholder visível.

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
