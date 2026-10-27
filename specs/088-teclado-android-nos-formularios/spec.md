# Spec 088 — Teclado não cobre os campos no Android

## Problema
No Expo SDK 58 o app roda em tela cheia (edge-to-edge). Nesse modo o
`softwareKeyboardLayoutMode: "resize"` do `app.json` deixa de encolher a janela no Android,
então o teclado cobria os campos em foco nas telas de formulário e no chat. As telas que já
tinham `KeyboardAvoidingView` (`createListing`, `chat`, `profile`) só o ativam no iOS
(`behavior={Platform.OS === "ios" ? "padding" : undefined}`), ou seja, ficavam descobertas
no Android.

## Escopo
- `src/view/useKeyboardHeight.ts`: hook que escuta `keyboardDidShow`/`keyboardDidHide` e reporta
  a altura real do teclado nativo. O `KeyboardAvoidingView` calcula o padding pela sobreposição de quadros,
  o que resulta em zero no Android em tela cheia (edge-to-edge).
- `src/view/components/KeyboardAwareRoot.tsx`: raiz única que aplica `paddingBottom: keyboardHeight`
  **somente no Android**, envolvendo `Stack` e `NavigationBar` em `src/app/_layout.tsx`.
- Nenhuma tela alterada: como as vistas internas agem apenas no iOS, não há dois `padding`
  somados na mesma tela.
- `app.json` permanece com `softwareKeyboardLayoutMode: "resize"` para não regredir o iOS e
  as versões anteriores; o `padding` da raiz é o que resolve o Android hoje.

Fora do escopo: ajustes de teclado por tela, `KeyboardAccessories`/toolbar do RN 0.88 e
comportamento no iOS (cada tela de formulário já trata).

## Critérios de aceite
- CA1: no Android a raiz aplica `behavior="padding"`. Teste: `tests/components/keyboardAwareRoot.test.tsx`.
- CA2: no iOS a raiz não aplica comportamento (são as telas que tratam). Mesmo teste.
- CA3: o campo em foco fica visível acima do teclado no aparelho. Validação manual no Galaxy A16
  (login, anunciar e chat) — pendente de conferência com o build atual.

## Validação
`npm run test:coverage` executa CA1 e CA2. CA3 depende de aparelho físico.
