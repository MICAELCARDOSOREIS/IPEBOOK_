# ADR 0050 — Seletor de Bairro Comunitário e Persistência de Localidade Ativa

- **Status:** Aceito
- **Data:** 25 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 067 (Seletor de Bairro e Filtro Territorial de Piripiri), Figma `02.01 · Início`, `02.02 · Explorar`.
- **Relacionado a:** ADR 0016 (Restrição territorial Piripiri), ADR 0022 (Primeiro Acesso no Dispositivo), ADR 0029 (Vocabulário Fechado de Bairro), ADR 0045 (Alinhamento Visual Home), ADR 0049 (Alinhamento Visual Explorar).

---

## Contexto

O IpêBook opera com foco exclusivo na comunidade leitora de Piripiri, PI (ADR 0016). Tanto a tela inicial (Home) quanto a tela de busca (Explorar) apresentam no cabeçalho superior a pílula de localização `[ 📍 Centro ⌄ ]`.

Até então:
- O chip era apenas visualmente renderizado, mas estático/sem ação ao toque em `src/app/index.tsx` e `src/app/pesquisa.tsx`;
- Não existia componente de seleção ou filtro para alternar entre os 17 bairros oficiais cadastrados em `PIRIPIRI_NEIGHBORHOODS`;
- O ViewModel de busca (`useSearchViewModel`) não realizava filtragem por bairro;
- A localidade ativa ficava presa em um valor estático, sem persistência no dispositivo via `AsyncStorage`.

## Decisão

1. **Componente Reutilizável `NeighborhoodSelectorModal`:**
   - Criar modal acessível (`src/view/components/NeighborhoodSelectorModal.tsx`) que lista todos os 17 bairros oficiais de Piripiri, PI e a opção "Todos os bairros (Piripiri)".
   - Incluir campo de busca rápida (*search field*) para filtrar a lista de bairros localmente.
   - Indicar com clareza o bairro ativo atualmente selecionado.
   - Assegurar área de toque mínima de 48dp por item e atributos acessíveis (`accessibilityRole="button"`, `accessibilityState={{ selected }}`).

2. **Hook de Localidade Ativa e Persistência:**
   - Implementar `useActiveNeighborhood` com persistência sob a chave `@ipebook:active_neighborhood` em `AsyncStorage`.
   - Ler preferência do usuário logado se existir, ou o valor salvo no dispositivo, com fallback seguro para `"Centro"`.
   - Propagar a alteração para a interface imediatamente.

3. **Filtro Territorial no `useSearchViewModel`:**
   - Expandir o estado de busca para conter `neighborhood: string | "all"`.
   - Ao selecionar um bairro no seletor, atualizar o estado e filtrar a lista de livros disponíveis pelo campo `book.neighborhood`.
   - Aceitar `"all"` ou `"Todos os bairros"` para exibir todo o catálogo de Piripiri sem restrição por bairro.

4. **Conexão nas Rotas:**
   - Conectar o modal e o estado ativo nas rotas principais `src/app/index.tsx` e `src/app/pesquisa.tsx`.

## Consequências

- **Positivas:**
  - O leitor em Piripiri tem controle direto sobre a vizinhança onde deseja encontrar e trocar livros.
  - Concretização funcional da pílula de localização que estava estática no Figma `02.01` e `02.02`.
  - Persistência sem login obrigatório: visitantes navegam no seu bairro imediatamente.
  - Pleno respeito ao isolamento das 7 camadas MVVM e acessibilidade M3.
- **Negativas / Limitações:**
  - Anúncios antigos que eventualmente não tenham bairro especificado só aparecem na opção "Todos os bairros".
