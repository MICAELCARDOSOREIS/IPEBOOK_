# Validação — Spec 082

`npm run validate` aprovado (186 arquivos / 1.370 testes, 0 violações de arquitetura, 82 specs e 65 ADRs).
Novos: `tests/unit/chatTimeline.test.ts` (CA1), `tests/components-mocked/chatView.test.tsx` (CA2–CA4),
casos em `conversationsView.test.tsx` e `requestDetailView.test.tsx` (CA5); todos falharam antes da
implementação. O teste do modal antigo (`negotiationChatView.test.tsx`) saiu junto com o componente.

Pendente: conferência no Galaxy A16 (CA6).
