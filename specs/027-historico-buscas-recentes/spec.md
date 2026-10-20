# Especificação 027: Histórico de Buscas Recentes (Issue #94)

## 1. Contexto e Problema

A pesquisa (spec 006/#56) não guarda nada: ao sair da tela, o termo digitado se perde e não há
sugestão de buscas recentes. Quem procura o mesmo livro em dias diferentes precisa redigitar
tudo.

Telas correspondentes no Figma (fluxo 02 · Descoberta): `02.15 · Busca` (com histórico) e
`02.16 · Limpar histórico?`.

## 2. Decisão de armazenamento

**Guardar no dispositivo (AsyncStorage), não no banco.** O histórico é pessoal, não precisa
sincronizar entre aparelhos e guardá-lo no dispositivo evita tabela nova, política de RLS e
qualquer dúvida de privacidade — conforme a recomendação já registrada na issue #94.

- A chave de armazenamento é isolada por conta: `search-history:<userId>` para quem está
  autenticado e `search-history:guest` para quem não está. Isso garante que o histórico não vaze
  entre contas diferentes no mesmo dispositivo (duas pessoas usando o mesmo celular).
- **Sair da conta não limpa o histórico** — ele continua isolado sob a chave da conta e volta a
  aparecer no próximo login da mesma pessoa no mesmo dispositivo.
- **Excluir a conta (spec 014) limpa o histórico dessa conta** — ação irreversível, consistente
  com a LGPD: ao confirmar `useDeleteAccountViewModel.deleteAccount`, o histórico sob
  `search-history:<userId>` é removido do dispositivo atual.

## 3. Escopo e Restrições

- **O que faz parte:**
  - Guardar os termos buscados (que efetivamente geraram alguma interação de busca) e exibi-los
    como sugestões quando o campo de busca está vazio.
  - Toque em um termo recente refaz a busca com aquele termo.
  - Ação de limpar todo o histórico, com diálogo de confirmação (componente `Dialog`, #89).
  - Limite de 10 termos guardados (o mais recente substitui o mais antigo); termo repetido sobe
    para o topo sem duplicar.
- **O que NÃO faz parte:**
  - Sincronizar o histórico entre dispositivos ou contas (decisão da seção 2).
  - Autocompletar com sugestões de livros que não foram buscados (isso seria outra
    funcionalidade, não histórico).
  - Alterar o comportamento de busca client-side já existente (spec 006) — a busca em si
    continua igual; esta spec só adiciona memória de termos.

## 4. Critérios de Aceite

- [ ] Especificação pelo Spec Kit com a decisão de armazenamento justificada (esta seção 2).
- [ ] Histórico sobrevive a fechar e reabrir o aplicativo (persistido via AsyncStorage).
- [ ] Limpar histórico pede confirmação (Dialog) e remove de fato os itens armazenados.
- [ ] O histórico não vaza entre contas diferentes no mesmo dispositivo (chave isolada por
  `userId`/`guest`).
- [ ] Excluir a conta remove o histórico dessa conta no dispositivo atual.
- [ ] Lista limitada a 10 termos; termo repetido não duplica, apenas sobe ao topo.
- [ ] Testes cobrindo guardar, reusar, limitar e limpar.
- [ ] `npm run validate` passando; cobertura acima de 80% nas áreas tocadas.
