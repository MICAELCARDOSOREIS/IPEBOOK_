# Especificação 113 — Fluxo Unificado e Melhorias na Negociação

## 1. Visão Geral e Contexto
A negociação é o coração da plataforma IpêBook, conectando leitores em Piripiri, PI para troca, doação ou venda comunitária de livros físicos. Atualmente, a experiência apresenta atritos cognitivos e fragmentação de telas: o chat é bloqueado enquanto o pedido está pendente (impossibilitando perguntar o que a outra pessoa tem na troca), a negociação divide-se em 5 telas desconectadas, e após a entrega presencial por QR code o leitor não é conduzido imediatamente à avaliação de reputação.

Esta especificação unifica a jornada de negociação com foco em simplicidade, clareza e acolhimento comunitário.

## 2. Requisitos e Comportamentos Esperados

### RF-01: Proposta Inicial com Mensagem e Seleção de Livro para Troca
- Ao clicar em "Tenho interesse" ou "Propor troca" na tela de detalhes do livro (`bookDetail.tsx`), o usuário visualiza um diálogo/modal de confirmação da proposta (`ProposalSheet`).
- **Mensagem inicial (opcional):** campo de texto permitindo enviar uma saudação ou detalhe inicial (ex.: disponibilidade de horários).
- **Seleção de contrapartida (específico para modalidade `trade`):** se o leitor tiver livros ativos no catálogo, o modal exibe seus livros disponíveis em um seletor visual simples para que ele anexe qual livro está oferecendo na troca.
- Ao submeter, a mensagem inicial e o livro oferecido são registrados junto ao pedido (`v2_book_requests`).

### RF-02: Resolução da Inconsistência de Chat em Propostas Pendentes
- A mensagem inicial enviada pelo solicitante é exibida como primeiro item da conversa.
- No card de proposta pendente do chat (`chat.tsx`), as copies são alinhadas com o modelo de negócio:
  - O anunciante visualiza claramente a proposta, o livro oferecido na troca (se houver) e a mensagem inicial.
  - O solicitante visualiza o resumo da sua proposta enviada e um aviso de que assim que o anunciante aceitar, o bate-papo em tempo real e o agendamento do encontro presencial são ativados.

### RF-03: Cartão de Status do Encontro e Entrega Integrado no Chat
- No topo do chat (`chat.tsx`), fixado abaixo do cabeçalho, um cartão compacto de status exibe:
  - Se o encontro ainda não foi marcado: banner informativo com botão de ação rápida "Combinar encontro".
  - Se o encontro está proposto aguardando confirmação: aviso de quem precisa confirmar ("Aguardando resposta de [Nome]" ou "Sua vez: confirme o encontro").
  - Se o encontro está confirmado: data/hora formatada, nome do ponto seguro de Piripiri, atalho "Como chegar" e atalho "Entrega do livro" (QR Code).
  - Se a entrega já foi concluída: badge de "Entrega realizada" com atalho direto "Avaliar negociação".

### RF-04: Balões de Eventos do Sistema na Linha do Tempo do Chat
- O chat integra eventos marcos da negociação na linha do tempo cronológica com visual de sistema (centralizado, discreto e com ícone):
  - Proposta de encontro: *"📅 [Nome] sugeriu encontro para [data/hora] em [Ponto Seguro]"*.
  - Confirmação de encontro: *"✅ Encontro confirmado para [data/hora] em [Ponto Seguro]"*.
  - Reagendamento / Cancelamento de encontro.
  - Conclusão da entrega: *"🎉 Entrega do livro confirmada presencialmente"*.

### RF-05: Condução Imediata à Avaliação Pós-Entrega
- Na tela de entrega (`delivery.tsx`), quando o código QR ou os 8 dígitos forem validados com sucesso por ambas as partes, o modal de avaliação mútua (`NegotiationRatingModal`) é aberto automaticamente, eliminando cliques desnecessários.

### RF-06: Ação Rápida "Adicionar à Agenda"
- Para encontros confirmados, disponibilizar ação para adicionar o compromisso ao calendário (Google Calendar / link nativo) com o endereço e ponto público de Piripiri preenchidos.

## 3. Critérios de Aceite
1. O leitor pode incluir mensagem opcional e selecionar livro de troca ao solicitar um anúncio.
2. O topo do chat exibe o estado atual da negociação (encontro, local e entrega) sem obrigar navegação para telas externas.
3. Eventos de encontro e entrega aparecem de forma clara na cronologia do chat.
4. Conclusão de entrega via QR code abre imediatamente o modal de avaliação.
5. Todos os testes passam e a cobertura global de código permanece ≥ 80%.
