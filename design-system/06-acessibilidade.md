# Acessibilidade

Razão de contraste = (L1 + 0,05) / (L2 + 0,05), com L1 a luminância relativa da cor mais clara e
L2 a da mais escura (fórmula WCAG). Os seis pares abaixo foram recalculados manualmente na
Tarefa 26 ([registro de execução](../tasks/micael-cardoso-reis/26-resolver-pendencias-design-kit.md))
e batem com os valores documentados em `tokens.json`. Os ~50 tokens de cor restantes
não foram auditados manualmente — só têm a razão declarada na origem (artifact do Figma).

## Contraste dos pares de cor (modo claro — único implementado, ver ADR 0008)

| Par (texto sobre fundo) | Cores | Razão | Mínimo | Resultado |
| --- | --- | --- | --- | --- |
| `on-surface` sobre `surface` | `#1d1b18` sobre `#fcfaf5` | 16,47:1 | 4,5:1 | Aprovado |
| `on-surface-variant` sobre `surface` | `#4d4740` sobre `#fcfaf5` | 8,79:1 | 4,5:1 | Aprovado |
| `error` sobre `surface` | `#b3261e` sobre `#fcfaf5` | 6,27:1 | 4,5:1 | Aprovado |
| `focus-ring` sobre `surface` | `#4e8a68` sobre `#fcfaf5` | 3,90:1 | 3:1 (elemento gráfico/foco) | Aprovado |
| `on-secondary-container` sobre `secondary-container` | `#18291f` sobre `#dce8de` | 12,10:1 | 4,5:1 | Aprovado |
| `on-doacao-container` sobre `doacao-container` | `#6e3a28` sobre `#f4ddd3` | 7,02:1 | 4,5:1 | Aprovado |

## Alvos de toque

- Mínimo de 48 dp em todo elemento tocável (Android/Web): botão (52 px, 48 px nas variantes
  Texto/Perigo), item da barra de navegação, campo de texto.
- Chip (32 px) e Tag (20 px, não tocável) são menores visualmente, mas a área de toque do Chip é
  ampliada para 48 dp por padding invisível — confirmar em cada componente de
  [04-componentes/](04-componentes/).

## Foco

- Anel sólido de 3 px em `focus-ring`, por fora do componente, com 2 px de folga — nunca
  removido, nem em botão nem em campo.
- Ordem de foco segue a ordem visual de leitura (topo → base, esquerda → direita).

## Leitor de tela

- Ícone sozinho sem rótulo visível ganha `accessibilityLabel` ("Voltar", "Limpar busca").
- Badge numérico entra no rótulo do elemento ("Conversas, 3 não lidas"), não fica separado.
- Mensagens de status (sucesso, snackbar) usam `accessibilityLiveRegion="polite"`
  (equivalente React Native de `role="status"`).
- Diálogo prende o foco e devolve ao gatilho ao fechar (ver
  [04-componentes/dialogo.md](04-componentes/dialogo.md)).

## Texto ampliado e movimento

- Nenhum componente usa altura fixa em elemento com texto: até 200% do tamanho de fonte do
  sistema, listas e cartões crescem em vez de cortar o texto.
- Com "Remover animações" ativo no sistema, deslocamentos viram esmaecimento
  (`duration-short4`), sem remover o feedback.
