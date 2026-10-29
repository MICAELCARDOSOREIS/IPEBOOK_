# Tag

> [!NOTE]
> **IMPLEMENTADO (ADR 0019)**: Implementado e ativo em `src/view/components/Tag.tsx`, centralizando cores e contraste da modalidade e status do anúncio.

Origem no sistema base: Material 3, Assist chip (não interativo). Situação: **Adaptado** — o M3
define o componente visual de etiqueta, mas não prescreve cor fixa por significado de domínio
(modalidade de anúncio); o IpêBook fixa uma cor exclusiva por modalidade. A cor `doacao-container`
em si é **Novo** (sem papel equivalente no M3).

## Quando usar

- Indicar a modalidade (Venda, Troca, Doação) ou o status (Reservado, Concluído) de um anúncio.

## Quando não usar

- Como elemento interativo — Tag nunca responde a toque (para filtro, use Chip, ver
  [chip.md](chip.md)).

## Anatomia

1. Container de cor fixa por significado (token `tag.<modalidade>.bg`), com raio de pílula
2. Texto do nome por extenso (nunca só a cor)

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Venda | Anúncio de venda | `secondary-container` / `on-secondary-container` |
| Troca | Anúncio de troca | `tertiary-container` / `on-tertiary-container` |
| Doação | Anúncio de doação | `doacao-container` / `on-doacao-container` |
| Reservado | Status reservado | `badge.reserved` |
| Concluído | Status concluído | `badge.completed` |

## Estados

Tag não é interativa — não tem hover, pressionado, foco ou desabilitado; é só leitura.

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | tokens da variante acima | Sempre visível, não responde a toque | Lida junto do título do anúncio, nunca isolada |

## Acessibilidade

- Não se aplica alvo de toque (não é tocável).
- Contraste texto/fundo mínimo 4,5:1 em todas as variantes (ver tabela em
  [06-acessibilidade.md](../06-acessibilidade.md)); medido em 7:1 para Doação e 12,1:1 para
  Venda. A implementação também oferece as variantes `disponível` e `pausado`.
- A cor nunca é o único sinal: o texto da modalidade sempre acompanha a cor.

## Faça e evite

- **Faça:** manter a mesma cor para a mesma modalidade em toda a tela e em todo o app.
- **Evite:** criar uma quinta cor de modalidade sem registrar um novo token semântico.

## Código

```tsx
import { Tag } from "@/view/components/Tag";

<Tag variant="venda" />
<Tag variant="reservado" label="Reservado" />
```
