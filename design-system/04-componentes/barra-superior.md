# Barra superior (TopAppBar)

Origem no sistema base: Material 3, Top app bar (small). Situação: **Herdado**.

## Quando usar

- Em qualquer tela que não seja raiz: mostra o botão voltar e o nome da tela ("Detalhe",
  "Conversa").

## Quando não usar

- Em telas raiz (Início, Explorar, Estante, Conversas, Perfil) — essas usam o título grande da
  marca (`brand-large-title`) no próprio conteúdo, sem esta barra.

## Anatomia

1. Barra de 64 px, fundo `surface` (ou uma barra sobreposta quando `floating`)
2. Botão voltar à esquerda
3. Título centralizado ou à esquerda (nome da tela, nunca de um estado)

## Variantes

Não há variantes — estrutura única em todo o app.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | fundo `surface` | - | Título lido como cabeçalho da tela |
| Sobre mapa | `surface-container` + `elevation-3` | A barra cobre a área superior do mapa quando `floating` é verdadeiro | - |
| Web larga | Trilha de 48 px sem faixa própria | Mostra "Voltar", divisor e título alinhados à coluna de conteúdo | - |

## Acessibilidade

- Botão voltar com rótulo acessível "Voltar", alvo de toque 48 dp.
- Título com `accessibilityRole="header"`.

## Faça e evite

- **Faça:** o título é o nome da tela ("Detalhe").
- **Evite:** usar o título para mostrar um estado ("Senhas diferentes") — isso vai na mensagem
  de erro do campo, não na barra.

## Código

```tsx
import { TopAppBar } from "@/view/components/TopAppBar";

<TopAppBar title="Detalhe" onBack={goBack} contentMaxWidth={560} />

// Em telas com mapa em tela cheia:
<TopAppBar title="Combinar encontro" onBack={goBack} floating />
```
