# Rascunho da ficha na Play Store

Rascunho para revisar antes de publicar. Os dados de coleta abaixo foram levantados do código em 2026-10-29 (Supabase, Expo Push, Sentry); conferir de novo se surgirem integrações novas.

## Identificação
- **Nome:** IpêBook — livros em Piripiri
- **Pacote:** `com.ipebook.app`
- **Categoria:** Livros e referências
- **Público-alvo:** maiores de 13 anos (há chat entre pessoas; ajustar se a política decidir 18+)
- **Contato:** e-mail de suporte definido em `src/view/supportContact.ts`

## Descrição curta (até 80 caracteres)
Venda, troque e doe livros com leitores de Piripiri, com encontro seguro.

## Descrição completa
O IpêBook conecta quem tem livros parados a quem quer ler, aqui em Piripiri (PI).

- Anuncie em segundos: leia o código de barras (ISBN) e o app preenche título, autor e sinopse.
- Encontre livros do seu bairro para comprar, trocar ou receber de doação.
- Converse pelo chat do app, sem expor seu telefone.
- Combine o encontro em pontos públicos e seguros da cidade, com lembrete antes do horário.
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

## Recursos visuais a produzir
- Ícone 512×512 (base em `assets/`), imagem de destaque 1024×500.
- Pelo menos 4 capturas de tela do celular: Início, Detalhe do livro, Chat, Encontro combinado.

## Antes de enviar
- Política de privacidade revisada e publicada em URL pública.
- Build de produção com `EXPO_PUBLIC_SENTRY_DSN` configurado (se for usar o Sentry).
- Teste interno (faixa "Teste interno" da Play Console) com pelo menos duas contas reais.
