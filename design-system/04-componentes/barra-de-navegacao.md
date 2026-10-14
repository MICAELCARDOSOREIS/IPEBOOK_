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

1. Até cinco itens, cada um com ícone + rótulo sempre visível
2. Indicador de item ativo em pílula (token `navitem.active.bg`)
3. Badge numérico opcional (ex. mensagens não lidas em Conversas)

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Item inativo | Destino não selecionado | `on-surface-variant` |
| Item ativo | Destino atual | pílula `secondary-container`, ícone/rótulo `on-secondary-container` |

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
