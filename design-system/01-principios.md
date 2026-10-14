# Princípios

Valores herdados dos princípios do Material 3 ("o material é a metáfora", "ousado e
intencional", "movimento dá significado") e da voz de marca do IpêBook: português do Brasil,
tratamento por "você", frases curtas e concretas, botões com verbo ("Anunciar livro", "Enviar
proposta"), nunca "OK" ou caixa-alta, sem emoji na interface.

## Princípio 1: Uma ação principal por tela

- **Origem:** Herdado. Vem da regra do Material 3 de um botão Preenchido (filled) por tela,
  reservando `primary` para a ação de maior destaque.
- **O porquê:** Numa negociação entre vizinhos, a próxima ação precisa ser óbvia — "Enviar
  proposta", "Combinar encontro" — sem concorrência visual.
- **Na prática:** O token `primary` só aparece em um botão Preenchido, no item ativo da
  navegação, em links e na barra de progresso (`Button` variante `filled`,
  [04-componentes/botao.md](04-componentes/botao.md)).
- **Evite:** Dois botões Preenchidos na mesma tela, ou usar `primary` como cor decorativa.

## Princípio 2: A cor nunca é o único sinal

- **Origem:** Adaptado. O M3 recomenda não depender só de cor para estado, mas não prescreve
  como isso vale para modalidades de um marketplace; o IpêBook aplica isso especificamente às
  tags de Venda/Troca/Doação.
- **O porquê:** Pessoas com daltonismo ou em telas de brilho baixo precisam distinguir Venda de
  Doação sem depender da cor da tag.
- **Na prática:** Toda `Tag` de modalidade leva o nome por extenso junto da cor
  ([04-componentes/tag.md](04-componentes/tag.md)); chip selecionado tem um ícone de check, não
  só a cor de fundo.
- **Evite:** Um indicador de status que é só uma bolinha colorida sem texto.

## Princípio 3: Fale de bairro, não de distância ou nota

- **Origem:** Novo. Não existe no Material 3, que é agnóstico de conteúdo; vem da marca e do
  modelo mental de "confiança de vizinhança" do IpêBook.
- **O porquê:** O app não calcula distância nem coleta avaliação — mostrar esses dados passaria
  uma precisão que o produto não tem.
- **Na prática:** `BookRow` mostra "Machado de Assis · Centro", nunca "a 1,2 km" nem uma nota
  ([04-componentes/](04-componentes/)).
- **Evite:** Qualquer tela ou componente novo que invente um dado de distância, nota ou
  avaliação que o backend não envia.

## Princípio 4: A marca aparece na serifa, não na cor de tudo

- **Origem:** Adaptado. M3 recomenda uma única família tipográfica (`type.families.sans`); o
  IpêBook reserva uma segunda família (Source Serif 4 Bold) só para pontos de marca.
- **O porquê:** Usar a serifa só no logotipo, no título de tela raiz e no título do livro cria um
  momento de marca sem tornar a interface inteira "decorada" — texto corrido e botões continuam
  na escala neutra do M3 (Roboto).
- **Na prática:** `fontFamily.brand` (`SourceSerif4_700Bold`) só em `displayLarge`/título de
  capa; todo o resto usa `fontFamily.regular/medium/semiBold` (ver
  [02-tokens.md](02-tokens.md)).
- **Evite:** Serifa em botão, campo de texto ou qualquer texto corrido.

## Princípio 5: Nada de tema escuro ainda

- **Origem:** Adaptado (omissão deliberada). M3 dá suporte nativo a tema escuro; o app guarda os
  valores escuros em `tokens.json` mas não os implementa nesta etapa
  ([ADR 0008](../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md)).
- **O porquê:** Implementar dark mode agora dobraria o trabalho de cada tela nova sem benefício
  claro para o MVP decidido.
- **Na prática:** Todo componente usa só os valores de tema claro de
  [`tokens.json`](tokens.json); nenhuma tela usa `useColorScheme` nem
  lógica de tema.
- **Evite:** Adicionar um toggle de tema ou ler a cor do sistema antes dessa decisão mudar.
