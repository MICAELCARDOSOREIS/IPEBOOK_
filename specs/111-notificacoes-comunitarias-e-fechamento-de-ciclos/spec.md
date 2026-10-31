# Especificação 111 — Notificações comunitárias e fechamento de ciclos de interação

Status: especificada; implementação em andamento. ADR: [0085](../../docs/adr/0085-notificacoes-comunitarias-e-fechamento-de-ciclos.md).

## Objetivo
Implementar os fluxos de notificação faltantes no ecossistema do IpêBook para garantir o fechamento de ciclos (avaliação pós-entrega, reabertura de livros favoritos, feedback de denúncias), acolhimento de novos leitores com diretrizes de segurança nos Pontos Seguros de Piripiri, e transparência sobre permissões de notificação do sistema.

## Escopo
- **Servidor / Banco de Dados**:
  - Atualização da RPC `complete_delivery`: emitir confirmação e convite de avaliação tanto para o dono do livro quanto para o leitor solicitante.
  - Gatilho `v2_profile_onboarding_notifications`: ao criar registro em `v2_profiles`, gerar notificação de boas-vindas (`system`) e dica de segurança dos Pontos Seguros (`safety_tip`).
  - Atualização do gatilho `v2_notify_favorite_change`: quando status transiciona de `reserved` ou `paused` para `available`, notificar quem favoritou (`favorite_update`).
  - Atualização da RPC `v2_moderation_resolve`: notificar os denunciantes abertos quando a denúncia for arquivada ou acionada (`system`).
- **Aplicativo / Interface**:
  - Banner in-app na central de Notificações alertando caso as notificações do sistema estejam desativadas no aparelho.
- **Fora do escopo**:
  - Envio de SMS ou mensagens fora do protocolo push já estabelecido (Expo / FCM v1).

## Regras de negócio
- **RN-01** A entrega confirmada via QR Code gera notificações de avaliação mútua para as duas pontas da negociação (`dono` e `solicitante`), vinculadas à rota `/negociacao/[id]`.
- **RN-02** Todo novo perfil criado recebe na sua central de notificações uma mensagem de acolhimento comunitário e uma dica de segurança sobre os Pontos Seguros de Piripiri.
- **RN-03** Se uma negociação for cancelada ou um livro pausado for reativado, os usuários que o favoritaram devem ser avisados de que o livro voltou a estar disponível para troca/doação.
- **RN-04** A moderação deve ser transparente: os usuários que reportaram um anúncio ou perfil são avisados quando sua denúncia for processada.
- **RN-05** Se o sistema operacional não concedeu permissão de push ao IpêBook, a central de notificações deve orientar o usuário com aviso legível e não intrusivo.

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | Ao concluir entrega via QR code, dono e solicitante recebem notificação de avaliação mútua | Cenário SQL PGlite em `verificar-migracoes.mjs` |
| CA2 | Novo perfil cadastrado recebe notificação de boas-vindas e dica de segurança | Cenário SQL PGlite em `verificar-migracoes.mjs` |
| CA3 | Livro que volta para disponível notifica quem o favoritou | Cenário SQL PGlite em `verificar-migracoes.mjs` |
| CA4 | Resolução de denúncia notifica o denunciante sobre a análise | Cenário SQL PGlite em `verificar-migracoes.mjs` |
| CA5 | Central de notificações alerta quando permissão de notificações do sistema está inativa | Teste de unidade / componente em `notifications.tsx` |
