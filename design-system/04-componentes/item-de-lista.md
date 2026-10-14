# Item de lista (ListItem)

Origem no sistema base: Material 3, List item (uma linha). Situação: **Herdado**.

## Quando usar

- Linhas de Configurações e Perfil — ícone, título, apoio e seta opcional.

## Quando não usar

- Para listar livros — isso é [Linha de livro](linha-de-livro.md), que tem estrutura própria.

## Anatomia

1. Ícone à esquerda (opcional)
2. Título
3. Texto de apoio (opcional)
4. Seta à direita, só quando o item abre outra tela

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Altura 56 px | Linha simples | - |
| Altura 72 px | Linha com texto de apoio | - |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | `on-surface` (título), `on-surface-variant` (apoio) | Toque navega (quando tem seta) | Seta não é lida separadamente — "abre outra tela" entra no rótulo |
| Pressionado | camada de 10% | Ripple | - |

## Acessibilidade

- Alvo de toque mínimo de 48 dp (altura mínima do item já cobre isso).
- No iOS (quando entrar em escopo), usar as listas agrupadas nativas (`ios-cell`,
  `ios-separator`), não este componente.

## Faça e evite

- **Faça:** só mostrar a seta quando o item realmente abre outra tela.
- **Evite:** usar ListItem para listar livros — use Linha de livro, que já traz capa e tag.

## Código

```tsx
import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function ItemDeLista({ titulo, apoio, abreOutraTela, onPress }: { titulo: string; apoio?: string; abreOutraTela?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ minHeight: apoio ? 72 : 56, flexDirection: "row", alignItems: "center", paddingHorizontal: tokens.spacing[16] }}
    >
      <View style={{ flex: 1 }}>
        <Text style={tokens.typography.bodyLarge}>{titulo}</Text>
        {apoio ? <Text style={{ color: tokens.colors.secondaryText, ...tokens.typography.bodyMedium }}>{apoio}</Text> : null}
      </View>
      {abreOutraTela ? <Text importantForAccessibility="no">›</Text> : null}
    </Pressable>
  );
}
```
