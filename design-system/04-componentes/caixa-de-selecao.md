# Caixa de seleção (Checkbox)

Origem no sistema base: Material 3, Checkbox. Situação: **Herdado** (o que muda é o conjunto
reduzido de uso: no IpêBook a caixa de seleção existe para consentimento explícito).

## Quando usar

- Consentimento que precisa de ato próprio da pessoa: o aceite dos termos de uso e da política de
  privacidade no cadastro (`01.03 · Criar conta`).
- Escolha binária independente, que não liga nem desliga nada imediatamente.

## Quando não usar

- Para ligar ou desligar um comportamento na hora (use o [Interruptor](interruptor.md)).
- Para escolher uma opção entre várias (use [Opção única](opcao-unica.md) ou [Chip](chip.md)).

## Anatomia

1. Caixa de 24 dp com borda de 2 px (`outline`); preenchida em `primary` com a marca de seleção
   em `on-primary` quando marcada.
2. Rótulo à direita, em `body-lg`, clicável junto com a caixa.
3. Descrição opcional em `body-md`/`secondaryText`, abaixo do rótulo.
4. Mensagem de erro opcional, abaixo da linha inteira.

## Estados

| Estado | Aparência | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Desmarcada | Borda `outline`, sem preenchimento | Aguarda o toque | `checkbox` com `checked: false` |
| Marcada | Fundo `primary`, marca em `on-primary` | Aguarda o toque | `checked: true` |
| Erro | Borda `error` enquanto desmarcada | Mantém-se clicável | Mensagem anunciada como alerta e associada pela descrição |
| Desabilitada | Borda `disabledText`, rótulo esmaecido | Não responde | Anunciada como indisponível |

## Acessibilidade

- A linha inteira (caixa + rótulo) é o alvo de toque, com 48 dp de altura mínima.
- Nunca desabilite o botão da tela para forçar o aceite: deixe enviar e mostre o erro na caixa,
  como manda [botao.md](botao.md).
- A mensagem de erro usa `accessibilityRole="alert"` e `aria-describedby` no mesmo padrão do
  [Campo de texto](campo-de-texto.md).

## Código

Implementação: `src/view/components/Checkbox.tsx`.

```tsx
<Checkbox
  label="Aceito os termos de uso"
  description="e a política de privacidade."
  checked={acceptedTerms}
  onChange={setAcceptedTerms}
  error={termsError}
/>
```
