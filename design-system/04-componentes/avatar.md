# Avatar

Origem no sistema base: Material 3, Avatar (imagem circular de perfil). Situação: **Adaptado** —
M3 não prescreve o que mostrar sem foto; o IpêBook usa iniciais sobre `primary-container`.

## Quando usar

- Representar uma pessoa (quem anuncia, quem conversa) em listas, conversas e no Perfil.

## Quando não usar

- Representar um livro — para isso use [Capa ilustrativa](capa-ilustrativa.md).

## Anatomia

1. Círculo de fundo (`primary-container` quando sem foto)
2. Foto (quando houver) ou iniciais (`on-primary-container`)

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| 40 px | Listas e conversas | `radius-full` |
| 64 px | Tela de Perfil | `radius-full` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Com foto | Imagem recortada em círculo | Estático ou tocável conforme o contexto | Nome completo no rótulo acessível |
| Sem foto | Iniciais sobre `primary-container` | Idem | Nome completo no rótulo acessível |

## Acessibilidade

- Não é o alvo de toque principal da linha — quando tocável, a linha inteira responde, com alvo
  mínimo de 48 dp.
- `accessibilityLabel` sempre com o nome completo da pessoa, nunca só "Avatar" ou as iniciais.

## Faça e evite

- **Faça:** gerar as iniciais a partir do nome completo (duas primeiras letras de nome e
  sobrenome).
- **Evite:** mostrar um ícone genérico de pessoa — use iniciais, que identificam melhor.

## Código

```tsx
import { Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function Avatar({ nome, tamanho = 40 }: { nome: string; tamanho?: number }) {
  const iniciais = nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return (
    <View
      accessibilityLabel={nome}
      style={{ width: tamanho, height: tamanho, borderRadius: tokens.radius.full, backgroundColor: tokens.colors.soft, alignItems: "center", justifyContent: "center" }}
    >
      <Text style={{ color: tokens.colors.action, ...tokens.typography.labelMedium }}>{iniciais}</Text>
    </View>
  );
}
```
