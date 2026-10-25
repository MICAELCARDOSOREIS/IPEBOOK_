# Especificação 071 — Histórico de Encontros na Negociação e Perfil

- **Autor:** Micael Cardoso Reis (`pessoa:micael`)
- **Data:** 25 de outubro de 2026
- **Status:** Aprovada
- **Contexto técnico:** Spec 052 (Encontros Combinados em Piripiri), Spec 069 (Alinhamento Visual de Encontros), Figma `06.05`, `06.11`, `07.01 · Meu Perfil`.

---

## 1. Objetivo

Exibir na tela de negociação e no hub de perfil do leitor o histórico de encontros realizados, confirmados e cancelados nos 4 pontos seguros de Piripiri (Campus IFPI, Praça da Bandeira, Praça de Alimentação / Mercado Central e Praça de Eventos), permitindo auditoria visual, transparência e segurança comunitária.

---

## 2. Requisitos

1. **Consulta de Histórico por Negociação:**
   - A camada de dados e casos de uso de encontros deve permitir listar todos os encontros de uma negociação específica (`listByRequest`), ordenados cronologicamente (do mais recente ao mais antigo).
2. **Consulta de Histórico por Usuário (Perfil):**
   - Deve ser possível listar os encontros em que o usuário autenticado participou (`listByUser`), respeitando as políticas de segurança e RLS.
3. **Exibição na Negociação (`MeetingCard`):**
   - Quando existirem encontros anteriores (cancelados ou passados) na negociação além do convite ativo, o card deve exibir um bloco ou lista de histórico com o ponto seguro de Piripiri, data/hora e o estado do encontro (Cancelado ou Confirmado).
4. **Exibição no Perfil (`ProfileHub` & Tela de Encontros):**
   - O `ProfileHub` deve oferecer um atalho na seção de Atividade para "Histórico de encontros".
   - A tela `/perfil/encontros` (`meetingHistory.tsx`) deve apresentar os encontros do leitor com pontos seguros, horários e badges de situação.
5. **Acessibilidade e Usabilidade:**
   - Textos claros em português, sem termos técnicos expostos, suporte a leitores de tela e contraste M3.
