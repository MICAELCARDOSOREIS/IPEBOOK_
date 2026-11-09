# 0101. Banner global de conectividade, cache offline da estante e blindagem de ações offline

- **Status:** Aceito
- **Data:** 2026-11-09
- **Contexto:** Resiliência / Modo offline / Estados de conectividade / Design system / UX comunitária
- **Especificação:** [130](../../specs/130-resiliencia-offline-e-banner-conexao/spec.md)

## Contexto

O IpêBook foi projetado para a comunidade de Piripiri, PI, onde as conexões móveis (3G/4G) oscilam frequentemente entre bairros. A arquitetura já conta com `CachedBookDataSource` para o catálogo geral (ADR 0035 / ADR 0073) e com `OfflineState` para telas vazias após falha de rede (ADR 0097).

Entretanto, uma análise integral identificou três lacunas de usabilidade e resiliência:
1. **Ausência de percepção em tempo real**: quando o usuário já carregou uma tela e a internet cai, não há indicativo visual de que o aparelho está offline até que uma navegação ou recarga falhe.
2. **Estante vazia offline**: enquanto o catálogo público possui cache em `AsyncStorage`, a consulta aos próprios anúncios da pessoa (`listByOwner`) não mantinha cópia local, fazendo com que "Minha Estante" ficasse inacessível offline mesmo após visualização recente.
3. **Frustração em ações de envio**: em telas de interação (como envio de mensagens no chat de negociação e publicação de anúncios), a pessoa conseguia acionar botões de submissão sem conexão, sofrendo com esperas longas de timeout seguidas por erros de rede.

## Decisão

1. **Banner global de conectividade (`ConnectionStatusBanner`):**
   - Criar um componente acessível e não intrusivo inserido no topo da aplicação (`src/view/components/ConnectionStatusBanner.tsx`), alimentado pelo hook `useNetworkStatus(networkStatusDataSource)`.
   - Exibir faixa discreta com o token semântico de aviso/erro suave, ícone de rede desligada (`wifiOff`), texto explicativo em português (*"Sem conexão com a internet"*) e região viva acessível (`accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`).
   - Ocultar-se automaticamente quando a conectividade for restabelecida.

2. **Cache local da estante pessoal em `CachedBookDataSource`:**
   - Estender a camada de persistência local para armazenar e recuperar anúncios da pessoa autenticada (`listByOwner`) sob a chave `ipebook:cache:books:owner:<ownerId>`.
   - Invalidar o cache da estante nas operações de criação, atualização de dados, mudança de status e exclusão de livro.
   - Entregar os dados locais como fallback caso a chamada remota falhe por motivo de rede.

3. **Blindagem e feedback prévio de ações offline:**
   - No chat de negociação (`src/view/conversations/chat.tsx`), desabilitar o botão de envio quando `!isOnline`, com rótulo acessível explicativo (*"Envio indisponível sem conexão"*).
   - Prevenir requisições de submissão desnecessárias que certamente falhariam e causariam frustração.

## Consequências

- **Positivas:** Feedback visual imediato e contínuo sobre o estado da rede; acesso aos próprios livros mesmo sem internet; economia de dados e bateria; prevenção de erros e timeouts desnecessários.
- **Negativas / Mitigações:** O cache da estante em `AsyncStorage` ocupa espaço no dispositivo, sendo mitigado pela limpeza centralizada já existente nas Configurações do perfil (`useSettingsViewModel`). A ausência de fila de escrita offline é mantida por design para evitar conflitos na negociação física de exemplares únicos.
