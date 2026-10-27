# Validação — Spec 076

## Automatizada (2026-10-26)

`npm run validate` aprovado: 176 arquivos / 1.285 testes, 0 violações de arquitetura (331 arquivos).
Novos: `tests/hooks/useConversationsViewModel.test.tsx` (CA1–CA3, horário relativo, erro) e
`tests/components-mocked/conversationsView.test.tsx` (CA4, CA5, carregamento e erro). O viewmodel foi
escrito depois do teste, que falhava por o módulo não existir.

## Aparelho Android (Galaxy A16, ADB, Expo Go, Supabase remoto)

Aba Conversas com três negociações reais: aceita com mensagem ("Você: Opa", "6 min", "Sobre Wotakoi…"),
pedido enviado pendente ("Aguardando resposta", "Sobre Memórias Póstumas…") e aceita sem mensagem
("Combinem os detalhes pelo chat", "Sobre 1984"), mais o aviso de segurança no rodapé. **Aprovado (CA6).**
Os toques de navegação ficaram cobertos por teste; o estado vazio não foi visto no aparelho.

## Limitações

- Uma consulta de mensagens por negociação aceita (N+1); aceitável na escala da beta, rever se a lista crescer.
- Sem contador de não lidas.
