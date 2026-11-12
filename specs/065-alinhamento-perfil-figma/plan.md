# Plano de Implementação — Spec 065: Alinhamento Visual do Perfil ao Figma

## 1. Arquitetura e Decisões Técnicas

- **Componente Principal:**
  - `src/view/profile/profileHub.tsx`: Refatoração visual com cabeçalho serifado, card de identidade M3, botão outline "Editar perfil", tríade de métricas e lista agrupada por seções.
- **Integração de Dados:**
  - Uso de `useProfileViewModel` para dados do usuário, reputação e trocas concluídas.
  - Uso de `useMyListingsViewModel` para contagem em tempo real de publicações cadastradas.
- **Decisão Arquitetural:**
  - `docs/adr/0048-alinhamento-perfil-figma.md`: Formalização da estrutura de seções, métricas e tipografia.

## 2. Etapas de Desenvolvimento

1. **ADR 0048:** Redigir o ADR de alinhamento visual do Perfil e atualizar `docs/adr/README.md`.
2. **Implementação de `ProfileHub`:**
   - Tipografia do título: `fontFamily.brand`, 34px, cor `colors.brandBrown`.
   - Card de identidade com `borderRadius: 20` e serifa no nome.
   - Botão outline destacado para "Editar perfil".
   - Cards de estatísticas ("publicações", "trocas", "avaliação").
   - Divisão em seções "Atividade" e "Conta" com ícones do design system e chevrons `AppIcon name="chevronRight"`.
3. **Atualização e Execução dos Testes:**
   - Atualizar `tests/components/profileHubView.test.tsx` e afins para validar a nova hierarquia visual e garantir que todos os links e ações continuem funcionando.
4. **Verificação no Aparelho via ADB:**
   - Capturar screenshot da tela do celular via ADB e comparar visualmente.
5. **Validação Final:**
   - `npm test`, `npm run check:architecture`, `npm run check:numbering`.
