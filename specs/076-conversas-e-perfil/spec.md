# Spec 076 — Aba Conversas como lista de conversas (Figma `06.01`/`06.09`) e ajustes do Meu perfil (`07.01`)

**Data:** 26 de outubro de 2026
**Telas:** `06.01 · Conversas` (`27:519`), `06.09 · Conversas · vazio` (`254:5566`), `07.01 · Meu perfil` (`25:524`).

## Problema

A aba Conversas abre "Meus pedidos", uma lista de livros pedidos sem conversa nenhuma: não mostra com quem se
fala, a última mensagem nem as propostas recebidas. O Figma `06.01` lista pessoas, última mensagem, horário e
"Sobre <livro>".

## Escopo

1. **Conversas** (rota `/meus-pedidos`, destino "Conversas"): manchete "Conversas" em serifa e uma linha por
   negociação, enviada ou recebida, sem as recusadas:
   - avatar com iniciais e nome da outra pessoa (quem pediu, nos recebidos; quem anunciou, nos enviados);
   - prévia: última mensagem do chat quando a negociação foi aceita ("Você: …" quando enviada por mim);
     sem mensagens, "Combinem os detalhes pelo chat"; pendente recebida, "Proposta recebida"; pendente enviada,
     "Aguardando resposta";
   - horário relativo da última mensagem (`9h`, `Ontem`, `sáb`) e "Sobre <título>";
   - toque: aceita → `/negociacao/[id]`; pendente recebida → pedidos recebidos; pendente enviada → detalhe do livro.
   - Ordem: conversas com mensagem mais recente primeiro, depois as demais.
   - Rodapé "Combine sempre pelo chat do IpêBook. Não compartilhe senhas ou códigos."
2. **Estado vazio** (`06.09`), carregamento, erro e sem conexão.
3. **Meu perfil**: rótulos de seção ("Atividade", "Conta") na cor primária, como no `07.01`.

## Fora do escopo

- Contador de não lidas (o modelo não registra leitura).
- Conversa antes do aceite: o chat só existe em negociação aceita (Spec 061).

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Lista junta enviados e recebidos, sem recusados, com nome da outra pessoa | teste do viewmodel |
| CA2 | Prévia e horário vêm da última mensagem da negociação aceita | teste do viewmodel |
| CA3 | Prévias de pendente recebida/enviada e de aceita sem mensagem | teste do viewmodel |
| CA4 | Toque leva ao destino certo por situação | teste de componente |
| CA5 | Estado vazio do `06.09` | teste de componente |
| CA6 | Conferência no Galaxy A16 | captura via ADB |
