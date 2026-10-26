# ADR 0060 — Meu perfil curto e Configurações como destino único de preferências

- **Status:** Aceito
- **Data:** 26 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Contexto técnico:** Spec 073 (Configurações e tema), Spec 048 (hub do perfil, Figma `07.01`),
  continuação entregue pelo ADR 0058.
- **Relacionado a:** ADR 0058 (Configurações como hub de preferências do dispositivo), ADR 0048
  (alinhamento do perfil ao Figma `07.01`) e ADR 0036 (tema local).

## Contexto

`Meu perfil` acumulava 12 destinos: card de identidade, métricas, quatro itens de atividade e oito
linhas na seção "Conta". O pedido do usuário foi direto: "tem muita coisa nele". Além disso, a
entrada de Configurações era uma linha entre outras oito, fácil de perder, e a tela tinha conteúdo
novo (limpeza de dados, versão, atalhos) que duplicava caminhos já existentes.

## Decisão

1. **Entrada de Configurações no topo**: `ProfileHub` passou a exibir uma engrenagem (`AppIcon
   name="settings"`, alvo de toque de 48 dp, rótulo "Abrir configurações") ao lado do título
   "Meu perfil", disponível também para quem não tem conta. A linha "Configurações" saiu da lista
   para não haver dois caminhos para o mesmo destino.
2. **Migração de itens para Configurações**: "Privacidade e dados" e "Pessoas bloqueadas" passaram
   para a seção "Conta e dados" da tela de configurações, renderizada apenas com sessão (a própria
   tela consulta `useAuthViewModel`, como já faz `BlockedUsers`). "Termos e privacidade" e "Ajuda e
   suporte" já viviam na seção "Sobre o IpêBook" desde o ADR 0058.
3. **Contrato reduzido**: `ProfileHubProps` perdeu `onNavigateToPrivacy`, `onNavigateToBlockedUsers`,
   `onNavigateToTerms` e `onNavigateToHelp`; a rota `src/app/perfil.tsx` deixou de passá-los e
   `src/app/perfil/configuracoes.tsx` passou a passá-los. As props continuaram obrigatórias onde o
   perfil ainda as usa, para a rota continuar sendo a única fonte de navegação.
4. **Sem conta**: a seção "Conta" desaparece por inteiro (não há conta para gerenciar), restando o
   card de convidado e a engrenagem. Isso substitui o filtro de "itens públicos" criado na entrega
   anterior.

`Meu perfil` fica com 7 destinos (4 em Atividade, 2 em Conta + Sair) contra 12 anteriores.

## Consequências

- Positivas: menos escolhas na tela de identidade; um único caminho para cada destino; o hub de
  configurações agrupa tudo que é escolha do aplicativo e funciona sem sessão.
- Negativas/custos: **divergência do Figma `07.01`**, que ainda desenha as oito linhas de conta e
  nenhum botão de engrenagem — o frame precisa ser atualizado no design system, e os registros
  históricos das Specs 048/065/072 descrevem o layout antigo.
- Riscos: a engrenagem é um ícone sem rótulo textual; para leitura de tela o `accessibilityLabel`
  cobre, mas a descoberta visual por pessoas menos familiarizadas depende do Figma revisar o
  contraste/tamanho do botão. Item "Pessoas bloqueadas" some do perfil de quem o usava como atalho.
- Alternativa rejeitada: mover também "Notificações" e "Segurança" para Configurações — notificação
  é atividade, e trocar senha é cuidado direto com a conta, ambos continuam visíveis no perfil.
