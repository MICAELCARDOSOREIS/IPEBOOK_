# ADR 0043: Notificações Push Locais e Lembretes de Encontros Presenciais

- **Status**: Aceito
- **Data**: 2026-10-23
- **Decisores**: Equipe de Arquitetura e Engenharia Ipebook
- **Contexto de Especificação**: Spec 060

## Contexto

As negociações no Ipebook envolvem propostas de livros e encontros presenciais em pontos seguros de Piripiri (Figma `06.11`–`06.14`). Sem lembretes no aparelho, os leitores correm risco de esquecer encontros agendados ou perder notificações de novas propostas.

O Expo SDK 57 disponibiliza a biblioteca oficial `expo-notifications`, que permite:
1. Agendamento de notificações locais precisas (sem dependência de servidor push ativo).
2. Solicitação e verificação de permissões do sistema operacional no momento adequado.
3. Obtenção de token Expo Push para futuras notificações remotas (Supabase Webhooks / Edge Functions).

## Decisão

1. **Adoção do `expo-notifications` (`~57.0.24`)**:
   - Configurar o handler de notificações para exibir alertas sonoros e visuais quando o app estiver em primeiro plano ou segundo plano.
   - No Android, registrar o canal de notificação padrão ("Lembretes e Avisos Ipebook") com importância alta e vibração.
2. **Contrato de Serviço na Camada de Domínio (`model/services`)**:
   - Criar interface `IPushNotificationService` com métodos para solicitar permissão, agendar notificação local e agendar lembrete de encontro com data/hora.
3. **Implementações Real e em Memória (`infra/services`)**:
   - `ExpoPushNotificationService`: utiliza a API nativa do Expo com tratamento de ambiente web e simulador.
   - `MemoryPushNotificationService`: armazena agendamentos em memória para testes e modo offline sem dependência de APIs nativas.
4. **Respeito à Autonomia e Privacidade**:
   - O pedido de permissão deve ser contextual e respeitar a decisão do usuário, mantendo o aplicativo 100% funcional caso a permissão seja negada.

## Consequências

### Positivas
- Usuários recebem avisos e lembretes de encontros diretamente no dispositivo móvel.
- Alta pontualidade e segurança nos encontros comunitários em Piripiri.
- Arquitetura desacoplada e testável via `MemoryPushNotificationService`.

### Negativas / Mitigações
- Notificações em navegadores desktop possuem suporte heterogêneo: mitigado com detecção de plataforma e fallback gracioso sem erros.
