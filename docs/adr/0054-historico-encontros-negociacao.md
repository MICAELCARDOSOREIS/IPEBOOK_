# ADR 0054 — Histórico de Encontros na Negociação e Perfil

- **Status:** Aceito
- **Data:** 25 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 071 (Histórico de Encontros na Negociação e Perfil), Figma `06.05`, `06.11`, `07.01 · Meu Perfil`.
- **Relacionado a:** ADR 0016 (Restrição territorial Piripiri), ADR 0037 (Encontros Combinados em Piripiri), ADR 0052 (Alinhamento Visual dos Encontros ao Figma).

---

## Contexto

As negociações de livros no IpêBook culminam no agendamento de encontros presenciais em um dos 4 pontos públicos e seguros de Piripiri (Campus IFPI, Praça da Bandeira, Museu de Piripiri e Praça de Eventos).
Durante a interação entre leitor e doador/vendedor, podem ocorrer cancelamentos, reagendamentos e conclusões de encontros.
Até o momento, a aplicação expunha apenas o encontro ativo mais recente (`findLatestByRequest`), deixando os participantes sem visibilidade dos encontros anteriores ou do histórico geral de trocas presenciais realizadas na cidade.

## Decisão

1. **Extensão da Camada de Dados de Encontros:**
   - Adicionar os métodos `listByRequest(requestId)` e `listByUser(userId)` à interface `IMeetingDataSource`.
   - Na implementação em memória (`MemoryMeetingDataSource`), filtrar os registros armazenados validando a participação do usuário na negociação e no livro.
   - Na implementação remota (`SupabaseMeetingDataSource`), consultar a tabela `v2_meetings` ordenada por `scheduled_at desc` / `created_at desc`, alavancando a função de segurança já existente `v2_is_meeting_participant` nas RLS do Supabase.
2. **Histórico na Negociação (`MeetingCard`):**
   - O ViewModel de negociação disponibiliza a lista de histórico de encontros (`history`).
   - O componente `MeetingCard` exibe uma seção secundária dedicada caso existam encontros anteriores (cancelados ou passados), detalhando data/hora formatada, ponto de encontro e situação.
3. **Histórico de Encontros no Perfil do Leitor:**
   - Adicionar o atalho "Histórico de encontros" na seção de Atividade do `ProfileHub`.
   - Disponibilizar a visualização completa na rota `/perfil/encontros` (`meetingHistory.tsx`), alimentada pelo ViewModel `useUserMeetingsViewModel`.

## Consequências

- **Positivas:**
  - Total transparência e rastreabilidade para os leitores de Piripiri sobre todas as tentativas e encontros realizados.
  - Segurança reforçada ao documentar o ponto público onde cada encontro foi agendado.
  - Reutilização das regras de negócio e permissões RLS estabelecidas no banco.
- **Negativas / Limitações:**
  - Encontros antigos mantêm-se no histórico da negociação enquanto o pedido existir; pedidos excluídos em cascata removem o histórico associado.
