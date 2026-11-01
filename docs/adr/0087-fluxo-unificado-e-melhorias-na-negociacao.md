# ADR 0087 — Fluxo Unificado e Melhorias na Negociação

- **Status:** Aceito
- **Data:** 2026-10-31
- **Decisores:** Antigravity, Usuário Micael
- **Contexto técnico:** Spec 113, Spec 052, Spec 061, Spec 082, Spec 095

## Contexto
O processo de negociação presencial de livros em Piripiri, PI (troca, venda e doação) é composto por múltiplos momentos: manifestação de interesse, conversa/alinhamento, agendamento de encontro em ponto seguro, validação da entrega física por QR code e avaliação mútua.

Anteriormente, o leitor enfrentava fricções:
1. Ao demonstrar interesse em um livro para troca, não havia como indicar qual livro oferecia em contrapartida nem enviar uma mensagem preliminar.
2. A mensagem no chat prometia que era possível tirar dúvidas antes do aceite, mas o chat era totalmente bloqueado no status `pending`.
3. Os dados do encontro e o acesso ao QR de entrega exigiam sair do chat e navegar para uma tela separada (`/negociacao/[id]`).
4. Eventos de encontro e reagendamento não deixavam rastros na conversa.
5. Após ler o QR code, o usuário voltava para uma tela estática antes de conseguir avaliar a pessoa.

## Decisão
1. **Extensão do Pedido (`v2_book_requests`):**
   - Adicionar colunas `initial_message` (texto opcional até 500 caracteres) e `offered_book_id` (referência opcional ao livro do solicitante para trocas).
   - Inserir a mensagem inicial como marco no histórico da conversa quando o pedido for criado.

2. **Cartão de Negociação Integrado no Topo do Chat (`NegotiationStatusCard`):**
   - Incorporar o status do encontro e entrega diretamente no cabeçalho do chat, permitindo consultar local, horário, abrir mapa e acessar o QR de entrega sem sair da conversa.

3. **Eventos na Linha do Tempo (`chatTimeline`):**
   - Introduzir elementos do tipo `event` na timeline do chat para registrar cronologicamente: proposta de encontro, confirmação, reagendamento e conclusão da entrega.

4. **Transição Contínua para Avaliação:**
   - Na conclusão da entrega por código ou QR code, acionar diretamente o modal de avaliação para reforçar a cultura de reputação na comunidade.

5. **Ação "Adicionar à Agenda":**
   - Fornecer utilitário para exportar o compromisso no calendário pessoal do leitor.

## Consequências
- **Positivas:**
  - Redução drástica de cliques e trocas de telas durante a negociação.
  - O anunciante recebe propostas de troca muito mais qualificadas (já sabendo qual livro o leitor oferece).
  - Aumento na taxa de encontros pontuais e de avaliações registradas.
- **Negativas / Mitigações:**
  - Maior responsabilidade do componente de chat, mitigada por separação de componentes especializados (`NegotiationStatusCard`, `chatTimeline`).
