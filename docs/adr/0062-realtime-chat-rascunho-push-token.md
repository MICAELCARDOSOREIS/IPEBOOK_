# ADR 0062 — Assinatura Realtime de Mensagens, Rascunhos de Anúncios e Push Token Remoto

- **Status:** Aceito
- **Data:** 26 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 061 (Chat em tempo real da negociação), Spec 017 / Spec 072 (Persistência de rascunhos de anúncio), Spec 060 (Push token remoto em preferências de usuário).
- **Relacionado a:** ADR 0043 (Notificações push locais e lembretes de encontros), ADR 0044 (Chat e mensagens internas da negociação presencial), ADR 0058 (Configurações e armazenamento local), ADR 0061 (Editar perfil e guarda de dados).

---

## Contexto

Com as funcionalidades essenciais de negociação e publicação consolidadas nas rodadas anteriores, três lacunas críticas de experiência e confiabilidade demandavam evolução arquitetural:

1. **Tempo real no chat de negociação:** O envio de mensagens funcionava via API REST (`insert`), mas a recepção de novas mensagens enviadas pela outra parte da negociação exigia recarregamento manual da tela ou ação explícita de refresh, prejudicando a comunicação ágil no momento do encontro presencial em Piripiri.
2. **Resiliência no fluxo de publicação de anúncios:** O formulário de anúncio possui múltiplas etapas (identificação do livro, seleção de fotos, conservação, categoria, bairro comunitário e revisão). Quedas de conexão, trocas acidentais de aplicativo ou interrupções no preenchimento faziam com que o usuário perdesse todo o progresso digitado.
3. **Persistência de Push Token remoto:** A infraestrutura de notificações da Spec 060 (ADR 0043) registrava o serviço local de push (`expo-notifications`), mas o token de dispositivo precisava ser armazenado de forma persistente nas preferências do usuário no Supabase (`v2_user_preferences`) para viabilizar notificações disparadas por eventos do servidor (ex.: novas mensagens ou propostas).

## Decisão

1. **Assinatura Realtime Desacoplada no Chat (`IMessageDataSource`):**
   - Adicionado o método opcional `subscribeToMessages?(requestId: string, onMessage: (message: NegotiationMessage) => void): () => void` no contrato `IMessageDataSource`.
   - Na implementação Supabase (`SupabaseMessageDataSource`), a subscrição utiliza o cliente Realtime (`client.channel(...)`) filtrando eventos `INSERT` na tabela `v2_negotiation_messages` com a cláusula de filtro `request_id=eq.${requestId}`. Ao encerrar a assinatura, a função de retorno executa `channel.unsubscribe()` e `client.removeChannel(channel)`.
   - Na implementação em memória (`MemoryMessageDataSource`), os ouvintes são gerenciados por `requestId` em um `Map<string, Set<Listener>>` e notificados de forma síncrona a cada `sendMessage()`.
   - No ViewModel (`useNegotiationChatViewModel`), o hook efetua a inscrição no ciclo de vida do componente (`useEffect`), deduplicando mensagens que chegam via canal para evitar repetições com mensagens recém-enviadas pelo próprio remetente.

2. **Persistência Local de Rascunho no Formulário de Anúncio:**
   - Adicionadas as operações `saveDraft()`, `loadDraft()` e `clearDraft()` no `useCreateListingViewModel`, utilizando o `AsyncStorage` sob a chave padronizada `ipebook.rascunho_anuncio`.
   - O formulário restaura automaticamente o rascunho anterior ao ser montado (caso os campos estejam em branco), avisa o usuário através de ação visual de descarte e salva o progresso a cada avanço de etapa.
   - Ao publicar o anúncio com sucesso ou ao acionar o reset do formulário, o rascunho em disco é removido deterministicamente.

3. **Sincronização de Push Token em Preferências (`v2_user_preferences`):**
   - Adicionado o campo opcional `pushToken?: string | null` na entidade de domínio `UserPreferences`.
   - O `IUserPreferencesDataSource`, o `SupabaseUserPreferencesDataSource` e o `MemoryUserPreferencesDataSource` foram atualizados para persistir e recuperar a coluna `push_token` (mapeada de/para snake_case no banco).
   - O caso de uso `UserPreferencesUseCases` preserva o token existente em atualizações parciais de preferências, e o ViewModel `useUserPreferencesViewModel` expõe a propriedade `pushToken` e a ação `setPushToken()`.

## Consequências

- **Positivas:**
  - Mensagens chegam instantaneamente no chat com latência mínima via WebSockets, mantendo a experiência nativa e fluida.
  - Zero acoplamento de bibliotecas externas na camada de domínio: o contrato de cancelamento da assinatura é uma simples closure `() => void`.
  - Usuários que anunciam livros em Piripiri não perdem o preenchimento de fotos e dados em caso de imprevistos ou travamentos.
  - Infraestrutura de push preparada para receber mensagens push acionadas por Edge Functions ou triggers do PostgreSQL.
- **Limitações:**
  - A assinatura Realtime no Supabase requer a replicação ativada na tabela `v2_negotiation_messages` no banco de dados remoto.
