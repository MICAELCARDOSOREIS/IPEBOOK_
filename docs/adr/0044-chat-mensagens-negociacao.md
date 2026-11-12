# ADR 0044 — Chat e Mensagens Internas da Negociação Presencial

- **Status:** Aceito
- **Data:** 23 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 061 (Mensagens e Chat da Negociação Presencial), Figma `06.01`, `06.02`, `06.10`, `06.16`.
- **Relacionado a:** ADR 0011 (navegação três destinos), ADR 0019 (design system e componentes), ADR 0030 (aceite atômico), ADR 0037 (encontro presencial), ADR 0039 (bloqueio de usuários).

---

## Contexto

O ADR 0011 estabeleceu a navegação de 3 destinos principais (`/`, `/pesquisa`, `/perfil`), mantendo as negociações vinculadas ao fluxo de pedidos. No ADR 0019, o componente de chat foi postergado para evitar sobrecarga no escopo inicial do MVP, até que os encontros presenciais estivessem modelados.
Com a consolidação da Spec 052 (combinar encontro nos pontos seguros de Piripiri) e da Spec 056 (bloqueio e segurança de usuários), surgiu a necessidade de comunicação pontual entre comprador e vendedor diretamente no app (ex.: alinhamento do local exato, imprevistos de trânsito ou identificação no ponto seguro).

## Decisão

1. **Escopo Restrito à Negociação:**
   - O chat não é uma rede social aberta de mensagens diretas avulsas.
   - Cada conversa é estritamente vinculada a um `requestId` ativo e aceito (`status = 'accepted'`).
   - Não é permitida a criação de canais de mensagens em pedidos pendentes ou rejeitados.

2. **Políticas de Autorização e RLS:**
   - Apenas os dois participantes da negociação (quem solicitou o livro e quem é o dono do anúncio) possuem permissão para ler e inserir mensagens.
   - Tentativas de injeção ou leitura por terceiros são rejeitadas tanto nas regras de negócio quanto via Row Level Security (RLS) no PostgreSQL.

3. **Integração com Bloqueio de Usuários (ADR 0039):**
   - Se qualquer um dos usuários envolvidos tiver uma relação ativa na tabela `blocked_users`, o envio de mensagens é imediatamente bloqueado, prevenindo assédio ou perseguição.

4. **Persistência e Arquitetura:**
   - Adicionada a tabela `negotiation_messages` com chaves estrangeiras para `book_requests` e `profiles`.
   - Adicionadas interfaces de repositório `IMessageDataSource`, implementações `MemoryMessageDataSource` e `SupabaseMessageDataSource`.

## Consequências

- **Positivas:**
  - Usuários de Piripiri conseguem se comunicar com privacidade dentro do app para fechar o encontro presencial, sem precisar expor seu número de telefone pessoal ou WhatsApp caso não queiram.
  - Segurança reforçada através do isolamento por pedido e respeito à moderação/bloqueio de usuários.
- **Negativas / Limitações:**
  - Requer nova tabela e migração SQL no banco de dados.
