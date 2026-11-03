# 0096. Aprimoramento das Telas da Barra de Navegação e IHC

- **Status:** Aceito
- **Data:** 2026-11-03
- **Contexto:** Usabilidade Móvel / IHC / Material 3 / Microinterações / Circulação Local

## Contexto

A barra de navegação inferior conecta os cinco pontos focais da experiência no IpêBook (*Início*, *Explorar*, *Estante*, *Conversas* e *Perfil*). Após a resolução de problemas de sobreposição e safe area em celulares Android, uma revisão minuciosa sob a ótica de Interação Humano-Computador (IHC) revelou fricções que prejudicavam a circulação comunitária de livros em Piripiri:

1. **Estante:** Compartilhar anúncios nos grupos e status de WhatsApp de Piripiri exigia navegar para a tela de gerenciamento de cada anúncio, desencorajando a divulgação rápida.
2. **Conversas:** Na lista de conversas, o leitor não conseguia identificar de imediato se o livro daquela negociação era doação, venda ou troca sem abrir a mensagem.
3. **Início:** O feed comunitário precisava de maior clareza visual na relação entre o bairro ativo e os livros recomendados na região.
4. **Perfil:** As métricas de trocas e leituras existiam apenas como números brutos, sem celebrar a identidade comunitária de Piripiri com selos de reputação (*Leitor de Piripiri*, *Estante Ativa*, *Ponto Seguro*).

## Decisão

1. **Estante com Compartilhamento de 1 Toque:**
   - Adicionar botão direto de WhatsApp no componente `ShelfRow` com área de toque mínima de 44x44dp (`tokens.accessibility.touchTarget`), acionando o caso de uso `shareToWhatsApp` sem propagar o clique para a linha inteira.
2. **Conversas com Rótulos de Modalidade:**
   - Incorporar o componente `Tag` nos itens da lista de `Conversations`, associando visualmente a cor da modalidade (verde para doação, âmbar para troca, marrom para venda) ao card.
3. **Início com Contextualização de Bairro:**
   - Enfatizar a quantidade de livros em circulação no bairro ativo no carrossel "Perto de você".
4. **Perfil com Selos Comunitários de Piripiri:**
   - Adicionar uma seção elegante de "Selos Comunitários" com ícones do Ipê e M3, valorizando leitores que realizam entregas nos pontos seguros públicos e mantêm estantes ativas.

## Consequências

- **Positivas:**
  - Redução drástica dos passos necessários para divulgar livros da estante no WhatsApp local.
  - Reconhecimento cognitivo instantâneo do tipo de negociação na lista de conversas.
  - Maior engajamento com os pontos seguros e valorização da comunidade de Piripiri através de selos.
  - Padrões rigorosos de IHC, contraste e acessibilidade mantidos em 100% dos componentes.
- **Negativas / Mitigações:**
  - Adição de novos elementos interativos nas linhas de lista: mitigada com contenção estrita de propagação de toque e tamanhos mínimos recomendados pela WCAG.
