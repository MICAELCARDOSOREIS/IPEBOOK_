# Beta na Play Store (teste interno)

Roteiro para publicar o primeiro beta. Itens marcados com **(você)** dependem da conta Google do responsável.

## Já pronto no projeto
- Build de produção em App Bundle com versão automática (`eas.json`, perfil `production`).
- Envio pelo EAS para a faixa **interna** como rascunho (`eas.json` > `submit.production`).
- Política de privacidade pública e fiel ao que o app coleta: https://ipebook.app/termos?aba=privacidade
- Ficha da loja e respostas do formulário de segurança dos dados: [play-store.md](play-store.md).
- Supabase com moderação e limites contra abuso aplicados; Sentry e login Google configurados no EAS.

## Passo a passo
1. **(você)** Criar a conta de desenvolvedor em https://play.google.com/console (taxa única de US$ 25; conta pessoal exige verificação de identidade).
2. **(você)** Criar o app: nome "IpêBook", idioma português (Brasil), tipo App, gratuito.
3. Gerar o App Bundle: na nuvem `npx eas-cli build -p android --profile production`, ou na máquina `npm run aab:local` (desacoplado; acompanhe com `npm run aab:local:status`).
4. **(você)** Primeiro envio manual (exigência do Google): Testes > Teste interno > Criar versão > enviar o `.aab` baixado do EAS.
5. **(você)** Em Configuração > Integridade do app > Assinatura de apps, copiar o **SHA-1 da chave de assinatura do Google Play** e adicioná-lo no Firebase (app `com.ipebook.app` > Adicionar impressão digital). Sem isso, o login com Google falha no app baixado da loja.
6. **(você)** Preencher: Conteúdo do app (política de privacidade, anúncios: não, acesso ao app com conta de teste, classificação de conteúdo, público-alvo 18+, segurança dos dados conforme [play-store.md](play-store.md)) e a Ficha da loja.
7. **(você)** Teste interno > Testadores: criar lista com os e-mails (até 100) e compartilhar o link de participação.
8. Próximas versões: `npx eas-cli build -p android --profile production` e `npx eas-cli submit -p android --profile production` (exige chave de conta de serviço da Play Console em `eas credentials`).

## Conta de teste para a revisão do Google
O Google pede um login para revisar apps com conta. Criar uma conta exclusiva (e-mail e senha) e informá-la só no formulário "Acesso ao app" da Play Console; não registrar a senha no repositório.
