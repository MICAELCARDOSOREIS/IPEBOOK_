# Fundamentos

Regras de uso dos tokens definidos em [02-tokens.md](02-tokens.md). Detalhe completo da voz e do
brand book em [`design-kit/README.md`](../design-kit/README.md).

## Cor

- Use `primary` só para a ação principal da tela, o item ativo e links — nunca como cor
  decorativa. (Herdado)
- Fundo de tela em `surface`; cartões e campos em `surface-container-low`; busca, diálogo e
  bolha recebida em `surface-container-high`. (Herdado)
- Cada modalidade tem uma cor fixa de contêiner: Venda `secondary-container`, Troca
  `tertiary-container`, Doação `doacao-container`. Nunca troque a cor de uma modalidade por
  outra. (Adaptado)
- Nunca use cor como único sinal: toda tag leva o nome, todo chip selecionado tem check, todo
  erro tem ícone além da cor `error`. (Herdado, aplicação específica do app)
- `brand-amber` e `cover-sun` são decorativos (sol das capas); nunca viram cor de texto.
  (Novo)

## Tipografia

- Títulos de tela raiz, logotipo e título do livro usam a serifa da marca
  (`fontFamily.brand` → Source Serif 4 Bold); todo o resto da interface usa a escala M3 em
  Roboto. (Adaptado — ver [01-principios.md](01-principios.md) §4)
- Rótulo de botão em `m3-label-lg`; texto de campo e mensagem em `m3-body-lg`; descrições em
  `m3-body-md`. (Herdado)
- O texto respeita o tamanho de fonte escolhido no sistema Android, até 200%: nenhuma altura
  fixa em elemento com texto; listas e cartões crescem. (Herdado)

## Espaçamento

- Toda margem, padding e espaço entre elementos é um valor de `space-*` (grade de 4 px).
  (Herdado)
- Margem lateral das telas móveis: `space-4` (16 px). Padding de diálogo: `space-6` (24 px).
  Espaço entre seções: `space-8` (32 px). (Herdado)
- Web: conteúdo com margem de `space-12`/`space-16` (48–64 px) até 1440 px; abaixo de 840 px
  usa o layout móvel. (Herdado)

## Ícones

- Material Symbols Outlined, 24 px, cor herdada do texto ao lado (`on-surface-variant` quando
  inativo). (Herdado)
- Ícone sozinho (sem rótulo visível) sempre recebe um rótulo acessível ("Voltar", "Limpar
  busca"). (Herdado — requisito de acessibilidade do M3)
- A Estante usa um desenho próprio de livros na prateleira, fora do conjunto Material Symbols.
  (Novo)

## Elevação

- Elevação só onde algo flutua sobre o conteúdo: `elevation-1` em capas, `elevation-3` em FAB,
  diálogo e snackbar. (Herdado)
- Superfícies comuns (cartões, campos) são planas e se separam só pela cor de
  `surface-container-*`, sem sombra. (Herdado)

## Movimento

- Toque e foco animam em `duration-short2` (100 ms); chips e abas em `duration-short4`
  (200 ms); diálogo e snackbar em `duration-medium2` (300 ms). (Herdado)
- Com a opção "Remover animações" do Android ativa, troque deslocamentos por esmaecimento;
  nunca remova o feedback por completo. (Herdado)
