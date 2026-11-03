# Especificação — Melhorias de Contexto, Acessibilidade e Layout Web na Entrega do Livro

## 1. Identificação
- **Número:** 115
- **Título:** Melhorias de Contexto, Acessibilidade e Layout Web na Entrega do Livro
- **Status:** Concluída
- **Data:** 2026-11-02
- **Autor:** Antigravity / Micael
- **ADR Vinculado:** [ADR 0089](../../docs/adr/0089-melhorias-entrega-livro.md)

## 2. Objetivo e Motivação
A tela de entrega do livro (`/negociacao/[id]/entrega`, Spec 095 / ADR 0070) é o fechamento do encontro presencial em Piripiri. O anunciante exibe o QR Code e o código alfanumérico de 8 caracteres, e quem recebe o livro lê pela câmera ou digita o código.

Identificaram-se melhorias essenciais de IHC e usabilidade:
1. **Contexto do exemplar negociado:** exibir um resumo compacto com a capa, título, autor, modalidade da negociação e nome da contraparte, garantindo que o usuário saiba exatamente qual livro está sendo entregue caso possua mais de uma negociação em andamento.
2. **Layout responsivo para desktop / web larga:** em monitores widescreen (≥ 960px), adotar layout em 2 colunas diagramadas em vez de uma coluna estreita de 560px.
3. **Ergonomia e acessibilidade web:** no navegador web de desktop, onde o uso de câmera traseira de celular não se aplica, priorizar a digitação do código de 8 dígitos de forma limpa e confortável.
4. **Orientações comunitárias para conferência física do livro:** orientar ambas as partes a conferir o estado de conservação do exemplar antes de finalizar a troca ou doação.

## 3. Critérios de Aceite
1. **CA1 — Resumo do Livro na Entrega:**
   - A tela de entrega deve exibir os dados do livro e da contraparte (`bookTitle`, `bookAuthor`, `bookPhotoUrl`, `modality` e `counterpartName`).
2. **CA2 — Layout Web Desktop Larga (≥ 960px):**
   - Na web larga (`useIsWideWeb()`), o layout divide-se em duas colunas:
     - Coluna 1 (esquerda): Resumo do livro e cartão com dicas comunitárias de segurança e conferência física do exemplar.
     - Coluna 2 (direita): Ação de entrega (QR code e código para o doador/vendedor; formulário de confirmação para o receptor; ou mensagem de sucesso após conclusão).
3. **CA3 — Preservação da Experiência Móvel:**
   - Dispositivos móveis mantêm fluxo vertical natural, acessível com leitores de tela e áreas de toque de no mínimo 48dp.
4. **CA4 — Digitação Amigável de Código:**
   - O campo de texto para o código continua aceitando entradas com hífen ou espaços (ex.: `K7M2 QXWA`) e normalizando automaticamente para 8 caracteres maiúsculos.
5. **CA5 — Conclusão e Avaliação Mútua:**
   - Ao concluir com sucesso a entrega, a tela exibe o estado de confirmação com botão direto para "Avaliar negociação" e "Voltar à negociação".
