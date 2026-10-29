# Campo de texto (TextField)

Origem no sistema base: Material 3, Outlined text field. Situação: **Herdado**.

## Quando usar

- Entrada de texto curta com rótulo sempre visível: e-mail, senha, título do livro, mensagem.

## Quando não usar

- Seleção entre opções fixas (use Chip ou um seletor próprio, não um campo de texto livre).

## Anatomia

1. Rótulo sempre visível acima do campo (token `m3-label-md`)
2. Container contornado (token `outline`)
3. Texto do valor (token `m3-body-lg`)
4. Mensagem de ajuda ou de erro abaixo do campo

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Padrão | Qualquer entrada de texto curta | `outline`, `on-surface` |
| Multilinha | Mensagem de negociação | mesmos tokens, altura variável |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Normal | Borda `outline` | Aguarda entrada | Rótulo lido junto do campo |
| Foco | Borda `primary` 2 px, rótulo `primary` | Cursor piscando | Anunciado como campo de edição em foco |
| Erro | Borda e rótulo `error`, mensagem com ícone embaixo | Bloqueia envio até corrigir | Mensagem ligada ao campo por `aria-describedby`/`accessibilityHint` |
| Desabilitado | Opacidade 38% | Não responde | Anunciado como indisponível |

## Acessibilidade

- Alvo de toque mínimo de 48 dp (altura do campo).
- Contraste do texto `on-surface` sobre `surface` = 16,5:1 (ver
  [06-acessibilidade.md](../06-acessibilidade.md)).
- Placeholder nunca substitui o rótulo — o rótulo fica visível mesmo com o campo preenchido.
- Mensagem de erro diz como corrigir: "Use um e-mail como nome@exemplo.com", nunca só "Campo
  inválido".

## Faça e evite

- **Faça:** validar e mostrar o erro assim que o campo perde o foco.
- **Evite:** usar o placeholder como único rótulo do campo.

## Código

```tsx
import { TextInput, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function CampoDeTexto({ label, value, onChangeText, error }: { label: string; value: string; onChangeText: (v: string) => void; error?: string }) {
  return (
    <View>
      <Text style={{ color: error ? tokens.colors.error : tokens.colors.secondaryText, ...tokens.typography.labelMedium }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={label}
        style={{
          borderColor: error ? tokens.colors.error : tokens.colors.border,
          borderWidth: 1,
          borderRadius: tokens.radius.medium,
          padding: tokens.spacing[12],
          ...tokens.typography.bodyLarge,
        }}
      />
      {error ? (
        <Text style={{ color: tokens.colors.error, ...tokens.typography.bodyMedium }}>{error}</Text>
      ) : null}
    </View>
  );
}
```
