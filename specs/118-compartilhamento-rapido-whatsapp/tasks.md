# Tarefas — Spec 118: Compartilhamento Rápido no WhatsApp

- [ ] T1: Atualizar caso de uso `ShareUseCases` com `buildWhatsAppShareMessage` e suporte a WhatsApp Web em `buildWhatsAppShareUrl`.
- [ ] T2: Atualizar testes unitários em `tests/unit/shareUseCases.test.ts`.
- [ ] T3: Atualizar ViewModel `useShareListingViewModel` com abertura Web do WhatsApp (`api.whatsapp.com/send`) e suporte a card de imagem com legenda.
- [ ] T4: Adicionar ícone `whatsapp` em `AppIcon.tsx`.
- [ ] T5: Integrar botão de 1 toque no WhatsApp em `bookDetail.tsx` (mobile e desktop).
- [ ] T6: Integrar botão "Divulgar no WhatsApp" em `createListingSuccess.tsx` e `manageListing.tsx`.
- [ ] T7: Atualizar e expandir testes de componentes e hooks para cobrir os fluxos do WhatsApp.
- [ ] T8: Validar regressões gerais com `npm test`, `npx tsc --noEmit` e `npm run check:architecture`.
