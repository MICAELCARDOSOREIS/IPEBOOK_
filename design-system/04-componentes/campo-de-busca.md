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
| Vazio | Placeholder diz o que dá para buscar ("Busque por título ou autor") | Aguarda digitação | Rótulo acessível "Buscar livros" mesmo sem rótulo visível |
| Com texto | Mostra botão Limpar | Filtra a lista ao digitar | Botão Limpar com rótulo "Limpar busca" |
| Foco | Borda sutil ou elevação leve | Teclado aberto | Anunciado como campo de busca em edição |

## Acessibilidade

- Alvo de toque mínimo de 48 dp, inclusive o botão Limpar.
- Rótulo acessível fixo "Buscar livros", independente do placeholder visível.

## Faça e evite

- **Faça:** o placeholder diz o que dá para buscar, não um genérico "Pesquisar".
- **Evite:** esconder o botão Limpar quando há texto digitado.

## Código

```tsx
import { Pressable, Text, TextInput, View } from "react-native";
import { tokens } from "@/view/tokens";

function CampoDeBusca({ valor, onChangeText }: { valor: string; onChangeText: (v: string) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: tokens.colors.soft, borderRadius: tokens.radius.full, height: 56, paddingHorizontal: tokens.spacing[16] }}>
      <TextInput
        value={valor}
        onChangeText={onChangeText}
        placeholder="Busque por título ou autor"
        accessibilityLabel="Buscar livros"
        style={{ flex: 1, ...tokens.typography.bodyLarge }}
      />
      {valor.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} accessibilityLabel="Limpar busca" hitSlop={8}>
          <Text>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
```
