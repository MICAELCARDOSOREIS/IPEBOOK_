# ADR 0089 — Melhorias de Contexto, Acessibilidade e Layout Web na Entrega do Livro

- **Status:** Aceito
- **Data:** 2026-11-02
- **Decisores:** Antigravity, Usuário Micael
- **Contexto técnico:** Spec 115, Spec 095, Spec 113, Spec 114, ADR 0070, ADR 0087, ADR 0088

## Contexto

A tela de conclusão presencial da negociação por QR Code (`/negociacao/[id]/entrega`, Spec 095 / ADR 0070) é o ponto culminante da troca ou doação no IpêBook em Piripiri. Nela, o doador/vendedor gera o QR Code e o código alfanumérico de 8 dígitos de uso único, enquanto quem recebe o livro lê o QR com a câmera ou digita o código para concluir a entrega de forma mútua e segura.

Durante a análise integral da usabilidade dessa tela, identificaram-se as seguintes lacunas de IHC e experiência do usuário:

1. **Ausência de Contexto Visual do Livro e da Contraparte:**
   - A tela carregava diretamente no bloco técnico do QR Code ou no visor da câmera sem apresentar nenhum detalhe do livro negociado (título, autor, capa ou modalidade) nem da pessoa com quem a entrega está sendo realizada. Caso o usuário possuísse múltiplas negociações ativas na comunidade, faltava clareza sobre qual livro estava sendo entregue naquele momento.
2. **Layout Estrito a Coluna Estreita no Desktop (`useIsWideWeb`):**
   - Em navegadores web em computadores e laptops (resolução de 1440px), todo o conteúdo ficava confinado a uma coluna de 560px centralizada com grandes espaços vazios laterais, sem aproveitar a tela horizontal para orientações de segurança e conferência da edição.
3. **Ergonomia da Câmera em Navegadores Web:**
   - Na versão Web, a abertura forçada de permissão de câmera e o leitor de QR via webcam frequentemente falham ou geram atrito desnecessário em notebooks, onde o receptor prefere digitar diretamente o código de 8 caracteres exibido no smartphone da outra pessoa.
4. **Orientações Comunitárias de Conferência do Livro:**
   - A entrega presencial é o momento de checagem do estado físico do livro (páginas intactas, ausência de mofo ou rabiscos) antes do fechamento do ciclo. Faltavam dicas explícitas de verificação amigável para ambas as partes.

## Decisão

1. **Card de Contexto do Livro e da Negociação (`BookDeliverySummaryCard`):**
   - Integrar no topo da tela um cartão com a miniatura da capa do livro (`BookCover`), título, autor, etiqueta de modalidade (`Tag`: Troca, Doação ou Venda) e o avatar/nome da contraparte comunitária com quem a entrega está sendo efetuada, obtidos diretamente de `useRequestDetailViewModel`.
2. **Layout Desktop Widescreen em 2 Colunas (`useIsWideWeb`):**
   - Em telas largas (≥ 960px):
     - **Coluna Esquerda:** Apresentar o resumo detalhado do livro, a identificação dos participantes e um cartão com dicas de segurança comunitária para a conferência presencial do exemplar.
     - **Coluna Direita:** Bloco de ação da entrega: o QR Code em alta definição com código tipográfico legível e cronômetro de validade (para o anunciante) ou o formulário de confirmação por código e leitor (para o leitor).
   - Em telas móveis: manter o fluxo vertical contínuo com o cabeçalho contextual do livro precedendo as ações.
3. **Adaptação Graciosa de Leitura na Web:**
   - Na plataforma Web (`Platform.OS === "web"`), priorizar a digitação do código de 8 dígitos com campo acessível e foco inteligente, mantendo a câmera como recurso preferencial em aplicativos móveis Android/iOS.
4. **Feedback de Conclusão e Transição para Avaliação:**
   - Manter o disparo suave do modal de avaliação mútua (`NegotiationRatingModal`) ao detectar a conclusão da entrega, destacando o botão de avaliar negociação caso o modal seja dispensado temporariamente.

## Consequências

- **Positivas:**
  - Total clareza sobre qual exemplar e qual pessoa fazem parte da entrega em andamento.
  - Diagramação balanceada e moderna em telas desktop, alinhada à identidade Material 3 do IpêBook.
  - Eliminação de atrito com câmera em navegadores web de desktop.
  - Incentivo à verificação atenta do exemplar físico antes da confirmação.
- **Negativas / Mitigações:**
  - Acréscimo de testes para cobrir as variações de papéis (`giver` vs `receiver`) em layouts mobile e desktop widescreen.
