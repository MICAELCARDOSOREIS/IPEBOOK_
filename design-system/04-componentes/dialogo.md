# Diálogo (Dialog)

> [!NOTE]
> **IMPLEMENTADO (Issue #89 e ADR 0019)**: Implementado e ativo em `src/view/components/Dialog.tsx`, fornecendo diálogo modal com foco, acessibilidade e confirmação para ações destrutivas.

Origem no sistema base: Material 3, Basic dialog. Situação: **Herdado**.

## Quando usar

- Confirmar uma ação que não dá para desfazer ou que avisa outra pessoa: "Excluir anúncio?".

## Quando não usar

- Mensagens de confirmação rápida sem decisão a tomar (use
  [snackbar.md](snackbar.md)).

## Anatomia

1. Título em pergunta curta
2. Texto que explica a consequência
3. Ações à direita, a de confirmar por último, com verbo (nunca "OK")
4. Véu (`scrim`) atrás do diálogo

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Padrão | Confirmação neutra | `surface-container-high`, botão Contornado/Texto |
| Destrutivo | Ação irreversível | mesma estrutura + botão [Perigo](botao.md) na confirmação |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Fechado | - | Não renderizado | - |
| Aberto | `surface-container-high`, `elevation-3`, `scrim` atrás | Bloqueia interação com o resto da tela | Foco vai para o diálogo ao abrir |
| Fechando | - | Esc ou voltar cancela, devolve o foco ao gatilho | Foco retorna ao elemento que abriu o diálogo |

## Acessibilidade

- Foco preso dentro do diálogo enquanto aberto (focus trap); devolvido ao gatilho ao fechar.
- Esc (Web) e o botão voltar (Android) cancelam, equivalentes à ação "Cancelar".
- Contraste do título/texto `on-surface` sobre `surface-container-high` ≥ 4,5:1.
- No iOS (quando entrar em escopo), usar o alerta oficial da plataforma, não este componente.

## Faça e evite

- **Faça:** título em pergunta, ação de confirmar com verbo ("Excluir anúncio").
- **Evite:** usar "OK"/"Cancelar" genéricos quando a ação tem nome mais claro.

## Código

```tsx
import { Modal, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { BotaoPreenchido } from "./botao";

// Token `scrim` (claro) de design-kit/tokens.json — ainda não existe em src/view/tokens.ts
// (ver a tabela "Nomes no código" em 02-tokens.md). Nomeado e comentado em vez de literal solto.
const SCRIM_CLARO = "#00000052";

function DialogoConfirmacao({ visivel, titulo, texto, onConfirmar, onCancelar }: { visivel: boolean; titulo: string; texto: string; onConfirmar: () => void; onCancelar: () => void }) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={{ flex: 1, backgroundColor: SCRIM_CLARO, justifyContent: "center", padding: tokens.spacing[24] }}>
        <View style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.radius.extraLarge, padding: tokens.spacing[24] }}>
          <Text style={tokens.typography.titleMedium}>{titulo}</Text>
          <Text style={tokens.typography.bodyMedium}>{texto}</Text>
          <BotaoPreenchido label="Excluir anúncio" onPress={onConfirmar} />
        </View>
      </View>
    </Modal>
  );
}
```
