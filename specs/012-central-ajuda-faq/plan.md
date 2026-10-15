# Plano de Implementação: Central de Ajuda e FAQ (Spec 012)

## Arquitetura MVVM Sofisticada em 7 Camadas

1. **Camada Model (Domínio):**
   - `src/model/helpContent.ts`: Estrutura de tópicos, perguntas frequentes e orientações da comunidade de Piripiri.
2. **Camada View:**
   - `src/view/help/helpAndFaq.tsx`: Componente visual com TopAppBar, cartões de tópicos temáticos (Como Funciona, Encontros em Piripiri, Perguntas Frequentes, Suporte).
   - `src/view/home.tsx`: Inclusão de atalho "Central de Ajuda" ao lado de "Termos de Uso e Privacidade".
3. **Camada App (Rotas):**
   - `src/app/ajuda.tsx`: Rota no Expo Router.
   - `src/app/index.tsx`: Passagem do callback `onNavigateToHelp`.
4. **Testes e Validação:**
   - `tests/components/helpAndFaqView.test.tsx`: Testes de componente verificando títulos, tópicos locais de Piripiri e botão voltar.
   - Execução de `npm run validate` e `npm run build:web`.
