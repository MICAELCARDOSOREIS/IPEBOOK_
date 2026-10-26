# ADR 0058 — Configurações como hub de preferências do dispositivo

- **Status:** Aceito
- **Data:** 26 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Contexto técnico:** Spec 073 (Configurações e tema do perfil), continuação da entrega inicial
  (T01–T08) que deixou a tela com apenas a seção "Aparência".
- **Relacionado a:** ADR 0036 (tema claro/escuro por preferência local), ADR 0027 (resiliência
  offline no catálogo via `CachedBookDataSource`) e ADR 0022 (estado guardado no dispositivo).

## Contexto

A primeira versão de Configurações (Spec 073) entregou só o seletor de aparência. A tela era
anunciada em Meu perfil como "Aparência e preferências do aplicativo", mas não tinha nenhuma
outra preferência, e quem abria encontrava uma tela quase vazia. Precisávamos de conteúdo real,
não de enfeites: cada opção nova tinha de corresponder a um comportamento que já existisse ou
fosse implementável de verdade.

## Decisão

Configurações passa a ser o **hub de preferências do dispositivo**, reunindo apenas opções que
de fato fazem algo e que valem também para quem não tem conta:

1. **Aparência** — seletor Sistema/Claro/Escuro existente (ADR 0036), sem mudanças de contrato.
2. **Dados neste dispositivo** — botão "Limpar dados salvos" que remove a chave do catálogo
   offline escrita por `CachedBookDataSource` (ADR 0027). Novo contrato
   `ILocalCacheDataSource` (`src/model/datasources/`), adaptadores AsyncStorage/Memória,
   `LocalCacheUseCases` e `useSettingsViewModel`, com estados de carregamento, sucesso e erro
   amigável (sem detalhes técnicos nem dados sensíveis).
3. **Sobre o IpêBook** — versão do aplicativo lida de `expo-constants` (`App.version`) e atalhos
   para Termos, Exportar/excluir dados e Ajuda, renderizados somente quando a navegação é
   fornecida pela rota.

Preferências que exigiriam comportamento inexistente (ex.: um toggle de notificações que não
desliga push real) **não** foram adicionadas: uma configuração que não faz nada é pior que a
ausência dela. A limpeza usa a mesma chave exportada (`BOOKS_LIST_CACHE_KEY`) do gravador do
cache, para a limpeza nunca divergir do que é escrito.

## Consequências

- Positivas: a tela cumpre o que o rótulo do perfil promete; funciona sem sessão e sem conexão;
  a chave do cache fica centralizada; novos itens entram depois como seções isoladas.
- Negativas/custos: três arquivos novos em `model/infra/usecase/viewmodel` para uma ação simples;
  `expo-constants` exigiu mock no Vitest (alias `tests/mocks/expo-constants.ts`), pois
  `expo-modules-core` não resolve em ambiente de teste node.
- Riscos: limpar o cache dá a impressão de "apagar dados"; a descrição da seção explicita que
  anúncios e conta não são afetados, e a exportação LGPD real continua em `/excluir-conta`.
