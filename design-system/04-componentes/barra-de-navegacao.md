# Barra de navegação (NavigationBar)

Origem no sistema base: Material 3, Navigation bar. Situação: **Herdado** (estrutura e
comportamento do M3); os cinco destinos fixos são **Adaptado** — decisão de produto de
02/10/2026, não uma regra do M3.

## Quando usar

- Navegação principal, fixa no rodapé, em toda tela de nível superior do app: Início, Explorar,
  Estante, Conversas, Perfil.

## Quando não usar

- Dentro de um fluxo de várias etapas (ex. Anunciar livro) — use
  [indicador-de-etapas.md](indicador-de-etapas.md).

## Anatomia

1. Container flutuante em cápsula suspensa (`radius.full`), com fundo `surface` (`#FCFAF5`), borda `outline-variant` e elevação 6 (sombra difusa M3 Expressive)
2. Até cinco itens, cada um com ícone + rótulo sempre visível
3. Indicador de item ativo em pílula (token `secondary-container`, `#D2EBD4`)
4. Rótulo ativo em destaque com a cor da marca (`m3.primary`, `#2B6334`)
5. Badge numérico opcional (ex. mensagens não lidas em Conversas)

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Container flutuante (Dock) | Cápsula suspensa com rolagem de conteúdo sob a barra | Fundo `surface` (`#FCFAF5`), borda `outline-variant`, elevação 6 |
| Item inativo | Destino não selecionado | Ícone e rótulo `on-surface-variant` (`#4D4740`) |
| Item ativo | Destino atual | Pílula `secondary-container` (`#D2EBD4`), ícone `on-secondary-container`, rótulo em negrito `primary` (`#2B6334`) |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão (inativo) | `on-surface-variant` | Toque navega para o destino | Rótulo do destino anunciado |
| Ativo | Pílula `secondary-container` | Indica a tela atual | Anunciado como selecionado |
| Com badge | Número sobre o ícone | Não bloqueia o toque | Badge entra no rótulo: "Conversas, 3 não lidas" |

## Acessibilidade

- Alvo de toque mínimo de 48 dp por item, mesmo com rótulo e ícone pequenos.
- Rótulos sempre visíveis (não só ícone) — reduz carga cognitiva e ambiguidade para leitor de
  tela.
- Contraste do rótulo ativo (`on-secondary-container` sobre `secondary-container`) = 12,1:1.

## Faça e evite

- **Faça:** manter os cinco destinos na mesma ordem em toda tela de nível superior.
- **Evite:** esconder o rótulo de um item para "economizar espaço" — rótulo é sempre visível.

## Código

```tsx
import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function ItemNavegacao({ rotulo, ativo, badge, onPress }: { rotulo: string; ativo: boolean; badge?: number; onPress: () => void }) {
  const rotuloAcessivel = badge ? `${rotulo}, ${badge} não lidas` : rotulo;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: ativo }}
      accessibilityLabel={rotuloAcessivel}
      style={{
        backgroundColor: ativo ? tokens.colors.soft : "transparent",
        borderRadius: tokens.radius.full,
        paddingHorizontal: tokens.spacing[16],
        paddingVertical: tokens.spacing[8],
      }}
    >
      <Text style={{ color: ativo ? tokens.colors.action : tokens.colors.secondaryText, ...tokens.typography.labelMedium }}>
        {rotulo}
      </Text>
    </Pressable>
  );
}
```
