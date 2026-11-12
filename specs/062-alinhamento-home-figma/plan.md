# Plano de Implementação — Spec 062 (Alinhamento Home Figma 02.01)

## Arquitetura e Decisões Técnicas

- **Camada View:** Refatorar `src/view/home.tsx` preservando sua separação MVVM com `useHomeViewModel`, `useAuthViewModel` e `useTheme`.
- **Componentes do Design System:** Reutilizar `BookCover`, `SearchField`, `AppIcon`, `Tag` e `fontFamily.brand`.
- **Acessibilidade:** Garantir os atributos semânticos exigidos pelas normas ISO/IEC 25010 e testes já existentes.

## Etapas de Execução

1. **Definição de Tipos e Props:**
   - Adicionar suporte a props de bairro (`currentNeighborhood`, `onSelectNeighborhood`) e de busca rápida na Home.
2. **Construção dos Subcomponentes Visuais:**
   - Header com Bairro Picker (`[ 📍 Centro ⌄ ]`) e Notificações (`bell`).
   - Manchete Serifada (`Encontre sua próxima história.`) + Subtítulo.
   - Campo de Busca (`SearchField`) com navegação para a Pesquisa.
   - Fileira de Chips de Filtro (`Todos`, `Venda`, `Troca`, `Doação`).
   - Seção "Perto de você" com carrossel horizontal de livros e "Ver todos".
   - Banner "Doações da semana".
3. **Harmonização do Rodapé e Acessibilidade:**
   - Manter `theme-toggle-radiogroup` estilizado discretamente na seção de preferências/rodapé.
   - Manter links institucionais e estado vazio.
4. **Atualização e Execução dos Testes:**
   - Atualizar `tests/components/homeView.test.tsx` e `tests/components-mocked/homeViewMocked.test.tsx` para cobrir os novos nós semânticos.
   - Executar validações automatizadas.
