# Rascunho da ficha na Play Store

Rascunho para revisar antes de publicar. Os dados de coleta abaixo foram levantados do código em 2026-10-29 (Supabase, Expo Push, Sentry); conferir de novo se surgirem integrações novas.

## Identificação
- **Nome:** IpêBook — livros em Piripiri
- **Pacote:** `com.ipebook.app`
- **Categoria:** Livros e referências
- **Público-alvo:** maiores de 18 anos (Termos de Uso, seção 2)
- **Contato:** ipebook738@gmail.com
- **Política de privacidade (URL pública):** https://ipebook.app/termos?aba=privacidade

## Descrição curta (até 80 caracteres)
Venda, troque e doe livros com leitores de Piripiri, em pontos de encontro recomendados.

## Descrição completa
O IpêBook conecta quem tem livros parados a quem quer ler, aqui em Piripiri (PI).

- Anuncie em segundos: leia o código de barras (ISBN) e o app preenche título, autor e sinopse.
- Encontre livros do seu bairro para comprar, trocar ou receber de doação.
- Converse pelo chat do app, sem expor seu telefone.
- Combine o encontro em pontos públicos recomendados da cidade, com lembrete antes do horário.
- Confirme a entrega pelo QR code e avalie a negociação.
- Favoritos e alertas avisam quando aparece o livro que você procura.
- Denuncie e bloqueie quem não respeita a comunidade; a moderação analisa cada denúncia.

Feito para a comunidade de Piripiri. Seus dados podem ser baixados ou excluídos a qualquer momento em Configurações.

## Segurança dos dados (formulário da Play Console)
| Dado | Coletado | Compartilhado | Finalidade | Obrigatório |
|---|---|---|---|---|
| Nome | Sim | Não | Perfil público e negociação | Sim |
| E-mail | Sim | Não | Conta e recuperação de senha | Sim |
| ID do usuário | Sim | Não | Funcionamento da conta | Sim |
| Fotos (anúncio e perfil) | Sim | Não | Mostrar o livro e o perfil | Não |
| Mensagens no app | Sim | Não | Chat da negociação | Não |
| Localização aproximada (bairro escolhido) | Sim | Não | Mostrar livros perto de você | Não |
| Registros de falhas e diagnóstico | Sim (com Sentry ligado) | Não | Corrigir erros | — |
| ID do dispositivo para push | Sim | Não | Enviar avisos | Não |

- Dados criptografados em trânsito: **sim** (HTTPS no Supabase, Expo e Sentry).
- Exclusão de dados: **sim**, pelo app (Configurações > Privacidade e dados > Excluir conta) — informar também o link web da política.
- Localização precisa (GPS): **não** coletada.

## Recursos visuais produzidos (`docs/loja/imagens/`)
- Ícone 512×512: [`imagens/icone-512.png`](imagens/icone-512.png) (base em `assets/`).
- Imagem de destaque 1024×500: [`imagens/destaque-1024x500.png`](imagens/destaque-1024x500.png).
- Capturas de tela: [`imagens/tela-inicio.png`](imagens/tela-inicio.png), [`imagens/captura-explorar.png`](imagens/captura-explorar.png), [`imagens/captura-detalhe-livro.png`](imagens/captura-detalhe-livro.png), [`imagens/captura-anunciar.png`](imagens/captura-anunciar.png), [`imagens/captura-encontro.png`](imagens/captura-encontro.png), [`imagens/tela-entrar.png`](imagens/tela-entrar.png) e [`imagens/tela-cadastro.png`](imagens/tela-cadastro.png).

## Checklist de envio e acompanhamento
- Política de privacidade revisada juridicamente antes da promoção para produção aberta.
- Build de produção com `EXPO_PUBLIC_SENTRY_DSN` configurado (para uso do Sentry).
- Build Android `0.2.0` enviada à Play Store e validada em aparelho real com duas contas (2026-11-16).
