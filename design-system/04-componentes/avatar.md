# Avatar

> [!NOTE]
> **IMPLEMENTADO (Spec 078)**: Implementado e ativo em [`src/view/components/Avatar.tsx`](../../src/view/components/Avatar.tsx). Quando não há foto de perfil, exibe o medalhão do ipê (`IpeMark`) sobre `colors.ipe.container` (substituindo as iniciais do rascunho inicial).

Origem no sistema base: Material 3, Avatar (imagem circular de perfil). Situação: **Adaptado** —
M3 não prescreve o que mostrar sem foto; o IpêBook usa a marca do ipê (`IpeMark`) sobre
`colors.ipe.container`.

## Quando usar

- Representar uma pessoa (quem anuncia, quem conversa) em listas, conversas e no Perfil.

## Quando não usar

- Representar um livro — para isso use [Capa ilustrativa](capa-ilustrativa.md).

## Anatomia

1. Círculo de fundo (`colors.ipe.container` quando sem foto)
2. Foto (quando houver) ou medalhão `IpeMark`

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| 40 px | Listas e conversas | `radius-full` |
| 64 px | Tela de Perfil | `radius-full` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Com foto | Imagem recortada em círculo | Estático ou tocável conforme o contexto | Nome completo no rótulo acessível |
| Sem foto | `IpeMark` sobre `colors.ipe.container` | Idem | Nome completo no rótulo acessível |

## Acessibilidade

- Não é o alvo de toque principal da linha — quando tocável, a linha inteira responde, com alvo
  mínimo de 48 dp.
- `accessibilityLabel` sempre com o nome completo da pessoa, nunca só "Avatar".

## Faça e evite

- **Faça:** informar o nome completo em `name` para que leitores de tela identifiquem o leitor mesmo no fallback sem foto.
- **Evite:** exibir textos genéricos ou letras isoladas no fallback — o padrão implementado do produto é `IpeMark`.

## Código

```tsx
import { Avatar } from "@/view/components/Avatar";

<Avatar name="Maria Clara" photoUrl={user.photoUrl} size={40} />
```
