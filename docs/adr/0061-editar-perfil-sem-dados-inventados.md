# ADR 0061 — Editar perfil sem dados inventados e guarda de alterações

- **Status:** Aceito
- **Data:** 26 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Contexto técnico:** Spec 034 (preferências privadas do perfil), Spec 006 US4 (edição de perfil,
  Figma `07.02`), continuação do ADR 0060 (perfil enxuto).
- **Relacionado a:** ADR 0060 (Meu perfil curto), ADR 0058 (Configurações como hub de preferências),
  ADR 0034 (preferências privadas) e ADR 0026 (armazenamento de imagens no Supabase).

## Contexto

A tela "Editar perfil" tinha quatro problemas que enganavam ou atrapalhavam quem usa:

1. `neighborhood` nascia com `"Centro"` e o hub de perfil também fixava `"Centro"`, apresentando
   como morador do Centro alguém que nunca escolheu bairro — o mesmo tipo de dado inventado que
   levou à remoção do perfil de demonstração (ADR 0060).
2. O bloco de atalhos se chamava "Bairros mais frequentes", mas eram apenas os seis primeiros de
   `PIRIPIRI_NEIGHBORHOODS`; não existia nenhum dado de frequência.
3. Com sessão em verificação ou sem sessão, a tela devolvia `null`: um vazio total, sem aviso e sem
   botão, enquanto o redirecionamento para "Entrar" podia atrasar (visível no Web).
4. Qualquer alteração era descartada em silêncio ao voltar, e a foto só saía do perfil se a pessoa
   descobrisse que precisava apagar o link campo a campo.

## Decisão

1. **Nenhum padrão que a pessoa não escolheu.** `neighborhood` passou a `string | null` com `null`
   inicial; o campo mostra "Selecionar bairro" e o rótulo acessível diz "Nenhum bairro selecionado".
   `ProfileHub` passou a consultar `useUserPreferencesViewModel` e mostra o bairro real, caindo para
   "Piripiri, PI" quando não há escolha. Salvar com `null` grava `undefined`, e o datasource de
   preferências converte `undefined` em `null` na coluna, então limpar de fato limpa (RN-03).
2. **Rótulo que diz o que é.** "Bairros mais frequentes" virou "Bairros de Piripiri", com texto de
   apoio indicando o modal para ver a lista completa. A contagem de atalhos saiu do literal `6` para
   a constante nomeada `NEIGHBORHOOD_QUICK_PICKS`.
3. **Estados de sessão visíveis.** Carregando a sessão → `LoadingState` "Carregando sessão". Sem
   sessão → cartão "Entre para editar seu perfil" com `FilledButton` "Entrar ou criar conta", além
   do redirecionamento que já existia. A tela nunca mais devolve `null` para usuário logável.
4. **Guarda de descarte por comparação, não por flag.** `dirty` é derivado dos valores carregados
   (perfil e preferências), então salvar atualiza a linha de base e a guarda se desliga sozinha, sem
   estado extra. Voltar pela barra superior e pelo botão físico de voltar do Android (`BackHandler`)
   abre o diálogo "Descartar alterações?" (destructivo, com "Continuar editando"). Com o modal de
   bairros aberto, o botão físico apenas o fecha; com a tela limpa, o sistema navega normalmente.
5. **Remover foto em um toque.** `TextButton` "Remover foto do perfil" aparece quando há link
   preenchido e limpa o campo (marcando a alteração).
6. **Acessibilidade do formulário.** Quando o salvamento é bloqueado por erros em linha, uma região
   viva (`accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`) avisa "Confira os campos
   destacados para salvar.", já que o foco não pula para o campo inválido; o nome ganhou contador
   `n/60` alinhado à direita; o `accessibilityLabel` redundante "Salvar" foi removido do botão, que
   agora lê o próprio rótulo visível (WCAG 2.5.3 — rótulo no nome).
7. **Foto continua por link.** Rejeitamos adicionar `expo-image-picker` nesta entrega: seria nova
   dependência nativa com permissões e build próprios, e o único bucket existente (`book-photos`,
   política `Insert {userId}/*`) é semanticamente de capas de livros. Publicar avatar a partir da
   galeria pede decisão própria de storage (bucket/prefixo e reuso de `IPhotoStorageDataSource`),
   registrada em ADR futuro quando houver pedido para isso.

## Consequências

- Positivas: a tela para de afirmar coisas falsas sobre a pessoa; nada mais é perdido em silêncio;
  quem não tem conta entende onde está e tem um caminho; o formulário fica utilizável com leitor de
  tela e teclado.
- Negativas/custos: mais um hook (`useUserPreferencesViewModel`) e uma requisição no hub de perfil;
  o diálogo de descarte adiciona um passo para sair da tela quando há edição em aberto; divergência
  do Figma `07.02`, que não desenha o diálogo de descarte, o botão "Remover foto" nem o estado de
  convidado.
- Riscos: `BackHandler` não existe no Web, onde o voltar fica a cargo do próprio Expo Router (o
  registro é pulado por `Platform.OS === "web"`); o mock compartilhado de `react-native` em
  `tests/mocks/react-native.ts` precisou ganhar `BackHandler`, e telas futuras que o usem já têm.
- Alternativa rejeitada: marcar `dirty` com `useState` atualizado em cada `onChangeText` — exigiria
  sincronizar a flag em sete pontos e continuaria errada depois de salvar; a comparação com os valores
  carregados cobre todos os campos de uma vez.
