# Plano de implementação

- Reutilizar os casos de uso de encontro, o cartão de situação no chat e os componentes de confirmação existentes. A regra de expiração segue a validação já aplicada pelo banco.
- Consultar o histórico de encontros apenas na tela de Notificações, usando o estado atual para apresentar o aviso principal de cada negociação. Avisos legados sem vínculo reconhecível mantêm uma ação genérica. A falha dessa consulta mantém a lista navegável.
- Manter as camadas MVVM e os contratos de persistência existentes. Seguir as decisões dos ADRs 0037 e 0088 sobre encontros. A mudança de apresentação e o reuso dos contratos dispensam novo ADR.
- Verificar CA1 a CA3 com Jest e o fluxo de conversas. Verificar CA4 a CA6 com Jest e o fluxo de notificações. Usar o CDP para checar as larguras e navegação representativas, além das verificações padrão do projeto.
- Para CA7 e CA8, reaproveitar a folha modal com posicionamento lateral e o cartão de encontro no chat. No CDP, abrir e fechar o painel por teclado e verificar o encontro e o último item do histórico em janela baixa. A revisão retoma o registro «Mais espaço para o histórico de Conversas na web» do Obsidian Mind.
- Para CA9, limitar a largura das mensagens e da composição e usar o mesmo comportamento de fechamento nos dois menus do chat. No CDP, comparar os limites do histórico com os menus abertos e fechados.
