# Especificação: Configurações e tema do perfil

Branch: `develop` | Data: 2026-10-26 | Status: aprovado para planejamento

## Objetivo e escopo

Organizar a experiência de perfil para que a pessoa encontre uma entrada clara de **Configurações** e possa escolher a aparência do aplicativo entre **Sistema**, **Claro** e **Escuro** em uma tela dedicada. A aparência escolhida deve ser aplicada imediatamente, persistir no dispositivo e manter as superfícies do aplicativo e os elementos visuais do sistema coerentes.

O escopo inclui a entrada de Configurações em Meu perfil, a tela de configurações, a preferência de aparência e a coerência visual do tema no aplicativo. Ficam fora do escopo novas preferências de conta, sincronização da aparência entre dispositivos, alto contraste, mudanças nos dados do perfil e reformulação das demais opções já existentes em Meu perfil.

## Histórias e cenários de aceite

### US1 — Acessar configurações pelo perfil (P1)

Como pessoa usuária, quero acessar Configurações a partir de Meu perfil para encontrar preferências do aplicativo em um local previsível.

- Dado que estou em Meu perfil, quando aciono **Configurações**, então uma tela dedicada é aberta com título, retorno e seção de aparência.
- Dado que uso leitor de tela, quando foco a entrada, então ela é anunciada como botão e descreve que contém preferências de aparência.

### US2 — Escolher a aparência (P1)

Como pessoa usuária, quero escolher entre seguir o sistema, tema claro ou tema escuro para usar o aplicativo com a aparência que prefiro.

- Dado que estou em Configurações, quando seleciono **Claro** ou **Escuro**, então a aparência muda imediatamente e a opção escolhida é indicada como selecionada.
- Dado que seleciono **Sistema**, quando a aparência do dispositivo muda, então o aplicativo acompanha essa mudança.
- Dado que fecho e abro novamente o aplicativo, quando volto a Configurações, então a última preferência escolhida continua selecionada.

### US3 — Manter a interface coerente (P2)

Como pessoa usuária, quero que toda a moldura visível do aplicativo acompanhe o tema para não encontrar áreas claras em modo escuro ou escuras em modo claro.

- Dado que o tema escuro está ativo, quando navego pelas telas, então fundo, conteúdo, barra de status e demais elementos visíveis usam uma aparência escura coerente.
- Dado que o tema claro está ativo, quando navego pelas telas, então os mesmos elementos usam uma aparência clara coerente e legível.

## Requisitos

- FR-001: Meu perfil deve exibir uma entrada **Configurações** na seção de conta, com descrição de sua finalidade e área de toque acessível.
- FR-002: A entrada Configurações deve abrir uma tela dedicada com navegação de retorno.
- FR-003: A tela deve apresentar uma seção **Aparência** com as opções **Sistema**, **Claro** e **Escuro**.
- FR-004: Somente uma opção de aparência pode estar selecionada por vez, com estado perceptível visualmente e por tecnologia assistiva.
- FR-005: A seleção deve ser aplicada imediatamente a todas as superfícies visíveis do aplicativo.
- FR-006: A preferência escolhida deve persistir localmente entre sessões, sem depender de autenticação ou conectividade.
- FR-007: A opção Sistema deve acompanhar a aparência vigente do dispositivo e reagir a alterações enquanto o aplicativo estiver em uso.
- FR-008: A moldura do aplicativo e os elementos visuais do sistema devem refletir o tema resolvido, preservando contraste e legibilidade.
- FR-009: O seletor de aparência não deve permanecer duplicado em Meu perfil após existir na tela dedicada.
- FR-010: Falhas ao recuperar ou salvar a preferência não devem bloquear o uso; o aplicativo deve continuar seguindo a aparência do sistema.
- FR-011: Todos os controles novos devem ter alvo de toque de pelo menos 48 dp e rótulos acessíveis em português.

## Critérios de sucesso

- SC-001: Em teste funcional, uma pessoa acessa Configurações a partir de Meu perfil em no máximo dois acionamentos.
- SC-002: As três opções de aparência são identificáveis, mutuamente exclusivas e operáveis por toque e leitor de tela em 100% dos cenários de aceite.
- SC-003: A mudança entre Claro, Escuro e Sistema é perceptível imediatamente, sem exigir reinício ou nova navegação.
- SC-004: A preferência escolhida permanece ativa após reiniciar o aplicativo em 100% das tentativas de validação local.
- SC-005: Nenhuma superfície principal ou elemento visual do sistema permanece com aparência conflitante após a troca de tema nas telas verificadas.
- SC-006: As verificações automatizadas pertinentes ao perfil, às configurações, à persistência e ao contraste são aprovadas sem regressões.

## Casos de erro e suposições

- Se a preferência armazenada estiver ausente ou inválida, o aplicativo segue o tema do sistema.
- Se a leitura ou gravação local falhar, a tela continua utilizável e a escolha da sessão é aplicada sem expor detalhes técnicos.
- A preferência é do dispositivo, não da conta, e por isso Configurações permanece disponível mesmo sem sessão autenticada.
- A tela inicialmente agrupa apenas aparência; novas preferências poderão ser acrescentadas posteriormente sem alterar este escopo.
- A implementação reutiliza os padrões visuais, de navegação, persistência e acessibilidade já adotados pelo projeto.
