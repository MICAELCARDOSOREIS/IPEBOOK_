# Botão (Button)

Origem no sistema base: Material 3, Filled/Outlined/Text button. Situação: **Herdado** (as
quatro variantes vêm do M3; o que muda é só o conjunto reduzido de uso por tela, ver
[01-principios.md](../01-principios.md) §1).

## Quando usar

- Ação principal da tela (**filled**, no máximo uma por tela): "Enviar proposta", "Publicar
  anúncio".
- Ação alternativa à principal ou de estado vazio (**outlined**): "Salvar rascunho".
- Ações discretas e de diálogo (**text**): "Cancelar".
- Ação destrutiva (**danger**), sempre após confirmação em [Diálogo](dialogo.md): "Excluir
  anúncio".

## Quando não usar

- Navegação entre telas (use link ou item de lista, não botão).
- Mais de um botão `filled` na mesma tela.

## Anatomia

1. Container em pílula (token `button.radius` = `radius-full`)
2. Rótulo em verbo no infinitivo, sem caixa-alta, sem ponto final (token `button.label`)
3. Ícone opcional antes do rótulo

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Preenchido (filled) | Ação principal | `primary` (fundo), `on-primary` (rótulo) |
| Contornado (outlined) | Ação alternativa | `outline` (borda), `primary` (rótulo) |
| Texto (text) | Ação discreta, diálogo | `primary` (rótulo), sem fundo |
| Perigo (danger) | Ação destrutiva | `error` (fundo), `on-error`/branco (rótulo) |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | `primary`/`outline` conforme variante | Aguarda o toque | Rótulo anunciado como botão |
| Hover | Camada de 8% da cor do conteúdo | Só Web | - |
| Pressionado | Camada de 12% (filled) ou 10% (demais) | Ripple ou escurecimento | - |
| Foco | Anel sólido de 3 px em `focus-ring`, 2 px de folga | Visível ao navegar por teclado/leitor | Ordem de foco lógica; nunca remova o anel |
| Desabilitado | `on-surface` 12% no fundo, 38% no rótulo | Não responde | Anunciado como indisponível — prefira deixar ativo e mostrar o erro no campo |

## Acessibilidade

- Alvo mínimo de 48 dp (altura 52 px; variantes Texto e Perigo 48 px).
- Contraste do rótulo sobre o fundo: `on-primary`/`primary` = 7,5:1 (ver
  [06-acessibilidade.md](../06-acessibilidade.md)).
- Não desabilite um botão para esconder um erro de validação: deixe clicar e mostre o erro no
  campo correspondente.

## Faça e evite

- **Faça:** um rótulo curto com verbo ("Enviar proposta").
- **Evite:** três botões Preenchidos competindo pela atenção na mesma tela.

## Código

```tsx
import { Pressable, Text } from "react-native";
import { tokens } from "@/view/tokens";

function BotaoPreenchido({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={{
        backgroundColor: disabled ? tokens.colors.disabledBackground : tokens.colors.action,
        borderRadius: tokens.radius.full,
        paddingVertical: tokens.spacing[16],
        paddingHorizontal: tokens.spacing[24],
      }}
    >
      <Text
        style={{
          color: disabled ? tokens.colors.disabledText : "#ffffff",
          ...tokens.typography.labelMedium,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
```
