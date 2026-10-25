# Relatório de Alinhamento — Grupo E: Perfil, Notificações e Sistema

**Status:** Concluído com sucesso (37/37 testes aprovados)  
**Telas cobertas:** 07.01–07.23, 09.01, 09.06–09.07  
**Data:** 25/10/2026

## Telas Verificadas e Alinhadas
1. **07.01 · Meu perfil (`src/view/profile/profileHub.tsx`)**:
   - Layout fiel ao Figma `25:524`.
   - Card de identidade com Avatar, nome, bio e tempo de comunidade.
   - Itens de menu com ícones M3, rótulos e chevrons acessíveis: Meus anúncios, Avaliações recebidas, Histórico de encontros, Favoritos e alertas, Notificações, Segurança e senha, Privacidade e dados, Usuários bloqueados, Convidar amigos, Termos de uso e Ajuda.
   - Diálogo nativo M3 de confirmação para "Sair da conta".
2. **07.02 / 07.18–07.21 · Perfil e Segurança (`src/view/profile/profile.tsx`, `security.tsx`)**:
   - Formulários com validação inline, campos de alteração de senha e confirmação.
3. **07.04 · Notificações (`src/view/notifications/notifications.tsx`)**:
   - Lista agrupada com status lido/não lido e badges contextuais de proposta/encontro.
4. **07.05 / 07.06 · Avaliações e Histórico de Encontros (`receivedRatings.tsx`, `meetingHistory.tsx`)**:
   - Listas com cards de avaliação da comunidade e histórico de pontos de encontro em Piripiri.
5. **07.14–07.16 / 09.01 · Termos, Privacidade e Ajuda (`termsAndPrivacy.tsx`, `helpAndFaq.tsx`)**:
   - FAQ expansível com acordeão acessível e textos em português.
6. **07.17 · Exclusão de Conta (`src/view/auth/deleteAccount.tsx`)**:
   - Alertas visuais e confirmação destrutiva respeitando padrões de acessibilidade.

## Testes Automatizados Validados
- `tests/components/profileHubView.test.tsx` (9/9 passaram)
- `tests/components/securityView.test.tsx` (2/2 passaram)
- `tests/components/receivedRatingsView.test.tsx` (5/5 passaram)
- `tests/components/meetingHistoryView.test.tsx` (3/3 passaram)
- `tests/components/notificationsView.test.tsx` (4/4 passaram)
- `tests/components/helpAndFaqView.test.tsx` (6/6 passaram)
- `tests/components/deleteAccountView.test.tsx` (8/8 passaram)

