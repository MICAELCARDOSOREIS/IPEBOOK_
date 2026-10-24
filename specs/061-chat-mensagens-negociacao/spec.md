# Spec 061 — Mensagens e Chat da Negociação Presencial

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)
**Data:** 23 de outubro de 2026
**Issue:** #204
**Telas no Figma:** `06.01 · Conversas` (`27:519`), `06.02 · Conversa com Ana Paula` (`27:612`), `06.10 · Mensagem não enviada` (`370:6475`), `06.16 · Mensagem enviada` (`375:11741`).
**Depende de:** Spec 004 (negociação e pedidos), Spec 052 (combinar encontro), Spec 056 (bloqueio de usuários), ADR 0030 (aceite atômico), ADR 0037 (encontro), ADR 0039 (bloqueio).

## Problema

No fluxo de negociação de livros em Piripiri (Figma `06.05 · Encontro combinado` e `06.06 · Acompanhar encontro`), as partes precisam alinhar detalhes práticos para o encontro presencial no ponto seguro (ex: ponto de referência exato na Praça de Fátima, identificação visual de quem entrega ou pequenos imprevistos de trânsito). O Figma previa o botão "Abrir conversa" em `06.05` e as telas de conversa bidirecional `06.02`, `06.10` e `06.16`. Até agora, a comunicação interna por mensagens não estava implementada no aplicativo, forçando os usuários a depender exclusivamente de canais externos ou adivinhação no local público.

## Usuários afetados

Leitores participantes de um pedido aceito: a pessoa solicitante do livro (comprador/solicitante) e a pessoa proprietária do anúncio (vendedora/doadora).

## Escopo

1. **Modelo de Domínio:** Entidade `NegotiationMessage` (`id`, `requestId`, `senderId`, `content`, `createdAt`).
2. **Autorização Rígida:** Somente os dois participantes legítimos do pedido em estado `accepted` podem visualizar o histórico e enviar mensagens. Terceiros são terminantemente bloqueados.
3. **Bloqueio de Usuários (Spec 056):** Se qualquer um dos participantes tiver bloqueado o outro, o envio de novas mensagens é imediatamente negado com feedback claro.
4. **Interface de Chat (`06.02`):**
   - Lista cronológica de mensagens com balões estilizados conforme os tokens do tema (mensagens enviadas à direita na cor primária/verde Ipebook, mensagens recebidas à esquerda no tom de superfície).
   - Indicação de horário formatado e identificação do remetente.
   - Campo de texto inferior acessível com botão de envio.
5. **Tratamento de Falha e Reenvio (`06.10`):** Se houver falha de rede ou envio, exibir indicador de erro visual e opção de tentar novamente.
6. **Acesso Direto:** Ação "Abrir conversa" integrada no detalhe do pedido (`RequestDetail` / Figma `06.05`).

## Fora do escopo

- Envio de mídias pesadas (vídeos/áudio). A troca de fotos de livros já é atendida na publicação do anúncio.
- Conversas avulsas sem negociação aberta (o chat é estritamente vinculado a um pedido ativo entre vizinhos em Piripiri, prevenindo spam e assédio).
- Criptografia ponta-a-ponta assimétrica (incompatível com moderação comunitária e denúncias).

## Regras de negócio

- **RN-01 (Vínculo com Pedido Aceito):** Uma mensagem só pode ser criada vinculada a um `requestId` válido cujo status seja `accepted`. Pedidos pendentes ou rejeitados não têm conversa aberta.
- **RN-02 (Participantes Autorizados):** O remetente (`senderId`) deve ser o `requesterId` do pedido ou o proprietário (`userId`) do anúncio vinculado ao pedido. Qualquer outro remetente recebe erro de autorização.
- **RN-03 (Tamanho e Higienização do Texto):** O conteúdo da mensagem deve conter entre 1 e 1000 caracteres, sendo higienizado contra injeções XSS e tags maliciosas. Mensagens contendo apenas espaços em branco são rejeitadas.
- **RN-04 (Respeito a Bloqueios):** Se o remetente bloqueou o destinatário ou o destinatário bloqueou o remetente (tabela `blocked_users`), o envio de mensagem é recusado com erro `USUARIO_BLOQUEADO`.
- **RN-05 (Ordenação Cronológica):** As mensagens são recuperadas em ordem estritamente cronológica crescente (`createdAt ASC`).

## Critérios de aceite

1. Participante de negociação aceita visualiza botão "Abrir conversa" e acessa o histórico de mensagens do pedido.
2. Mensagem enviada aparece imediatamente no chat e persiste na base de dados.
3. Tentativa de terceiro (fora da negociação) de consultar ou postar mensagem é rejeitada tanto no caso de uso quanto nas políticas RLS do Supabase.
4. Se o usuário estiver bloqueado pelo outro participante, o envio falha e avisa o usuário.
5. Mensagem vazia não habilita o botão de envio.
6. Todos os testes unitários e de integração passam com 100% de cobertura.
