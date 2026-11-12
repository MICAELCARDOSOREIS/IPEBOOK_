# Spec 091 — Melhorias de usabilidade: chat, anúncio, cores, perfil e segurança

## Objetivo
Reunir os ajustes de usabilidade (IHC) feitos depois da Spec 090, conferidos em aparelho e por teste.

## Comportamento
1. **Chat** (continuação da 089): cabeçalho com foto, rolagem até a última mensagem na montagem, "Combinar" tonal.
2. **Anunciar**: título e autor em largura total; foto de capa em linha própria; leitura de ISBN numa linha tocável (sem campo de código nem "Buscar": ao escanear a busca é automática); barra de ações com o botão principal e "Voltar"/"Salvar para depois" lado a lado. O rascunho já é salvo no aparelho, então sair não perde dados.
3. **Cores**: modalidades (Venda verde, Troca amarelo, Doação terracota) e categorias (cor fixa por nome) em chips da Home, Explorar, filtros, alertas, anúncio e edição; fundo da capa na cor da modalidade (`ModalityCoverArea`) na Home, Explorar, Favoritos e Estante; etiqueta de modalidade colorida nos cartões da Home. `Chip` usa ícone de check.
4. **Filtros**: seções com título e divisor, condição em chips, rodapé com "Limpar" ao lado do botão principal, aviso quando nenhum livro bate.
5. **Explorar**: cabeçalho menor, capa sem foto com a inicial do título, aviso "Nenhum livro no <bairro>… Há N em outros bairros" com "Ver em toda Piripiri".
6. **Folhas e galeria**: modais em tela cheia com barras translúcidas; alça na folha de bairros; galeria de fotos com tamanho em pixels (a foto não aparecia no Android).
7. **Perfil público**: "Conversar" abre a negociação aceita com a pessoa (ou explica como começar); "Denunciar ou bloquear" abre folha com bloquear (com confirmação), denunciar um anúncio e denunciar a pessoa (nova tela `/denunciar-pessoa/[userId]`).
8. **Toque duplo**: `pushOnce`/`backOnce`/`replaceOnce` nas rotas e `useGuardedPress` nos botões base e no voltar.
9. **Notificações**: canal Realtime com nome único por assinatura (erro "cannot add postgres_changes callbacks after subscribe()"), sem texto de contagem repetido, "Marcar todas como lidas" e puxar para atualizar.
10. **Barra de navegação**: selo em "Conversas" com propostas recebidas pendentes; barra de status segue o tema do app.

## Dados
Migração `202610270002_denuncias_de_pessoas.sql` (`v2_user_reports`, RLS por denunciante, uma denúncia por par). Junto com a `202610270001` (Spec 090), **pendentes no Supabase remoto**.

## Validação
`npm run validate`: 197 arquivos, 1.430 testes. Cobertura nova: `useChatWithUser`, `useProfileSafetyViewModel`, `useReportUserViewModel`, `reportUseCases` (pessoa), `useNavigationBadgesViewModel`, `useGuardedPress`, `pushOnce`, notificações (refresh, canal único), galeria, chips e perfil. Parte conferida no Galaxy A16 durante o desenvolvimento; **pendente conferir após recarregar**.
