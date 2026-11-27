# Guia e Ficha de Publicação iOS (App Store / TestFlight)

Este documento reúne o passo a passo técnico para compilar e enviar o **IpêBook** (`com.ipebook.app`) ao **TestFlight** e à **App Store** a partir de um Mac (via Xcode ou EAS Build), além de todos os textos e respostas prontos para preencher no **App Store Connect**.

> O código iOS está implementado. A homologação em iPhone e a distribuição pelo TestFlight seguem pendentes. [Estado e continuidade](../estado.md)

---

## 1. Pré-requisitos na Conta Apple Developer

No portal [Apple Developer](https://developer.apple.com/account), certifique-se de que o identificador **`com.ipebook.app`** está registrado em *Certificates, Identifiers & Profiles → Identifiers* com as seguintes **Capabilities** ativas:

1. **Sign in with Apple** (obrigatório: o app usa `expo-apple-authentication` em `entrar.tsx` e `criar-conta.tsx`).
2. **Push Notifications** (gere uma chave `.p8` de APNs para notificações remotas).
3. **Associated Domains** (o app declara `applinks:ipebook.app` para retorno nativo de redefinição de senha em `/redefinir-senha?origem=ios`).

Anote o **Apple Team ID** (código de 10 caracteres alfanuméricos, ex.: `A1B2C3D4E5`) e envie ao responsável pelo Cloudflare Pages e Supabase para:
- Configurar `APPLE_TEAM_ID` no Cloudflare Pages (gera automaticamente `https://ipebook.app/.well-known/apple-app-site-association` no `npm run build:web`).
- Ativar o provedor **Apple** no Supabase Auth (*Authentication → Providers → Apple*) autorizando `com.ipebook.app` e a URL de retorno `https://ipebook.app/redefinir-senha?origem=ios`.

---

## 2. Variáveis de Ambiente (`.env`)

Crie o arquivo `.env` na raiz do repositório com as chaves **públicas** de produção (nunca inclua `SUPABASE_SERVICE_ROLE_KEY`):

```dotenv
EXPO_PUBLIC_BACKEND=supabase
EXPO_PUBLIC_SUPABASE_URL=https://xiuuiggpccpgrwkzeloc.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave_publicavel_do_supabase>
EXPO_PUBLIC_AUTH_REDIRECT_URL=https://ipebook.app/redefinir-senha?origem=ios
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<client_id_web_google_oauth>
```

---

## 3. Opção A — Compilar e Arquivar Localmente no Mac (Xcode)

No macOS com **Node.js 24**, **Xcode** e **CocoaPods** instalados:

```bash
# 1. Instala dependências Node, gera a pasta nativa ios/ e executa pod install
npm run ios:preparar -- --limpar

# 2. Abre o workspace no Xcode
open ios/Ipebook.xcworkspace
```

Dentro do **Xcode**:
1. Selecione o alvo **Ipebook** → aba **Signing & Capabilities**.
2. Marque **Automatically manage signing** e selecione a sua **Team** (Apple Developer).
3. No topo do Xcode, selecione o destino **Any iOS Device (arm64)**.
4. No menu superior, clique em **Product → Archive**.
5. Ao concluir o archive, na janela *Organizer*, clique em **Distribute App → App Store Connect → Upload** para enviar ao TestFlight / App Store Connect.

> **Criptografia de exportação:** O `app.json` já declara `"ITSAppUsesNonExemptEncryption": false` no `infoPlist`, dispensando documentação adicional de criptografia no App Store Connect.

---

## 4. Opção B — Compilar na Nuvem com EAS Build

Se a conta estiver vinculada ao projeto no Expo (`eas login`):

```bash
# Gera o binário .ipa assinado para a App Store / TestFlight
npx --no-install eas-cli build --platform ios --profile production

# Envia a build gerada para o App Store Connect / TestFlight
npx --no-install eas-cli submit --platform ios --profile production
```

Para configurar a chave APNs (`.p8`) de notificações push no Expo:
```bash
npx --no-install eas-cli credentials -p ios
```

---

## 5. Ficha da Loja no App Store Connect (Textos Prontos)

- **Nome (até 30 caracteres):** `IpêBook — Livros em Piripiri`
- **Subtítulo (até 30 caracteres):** `Troca, venda e doação local`
- **Bundle ID:** `com.ipebook.app`
- **SKU:** `ipebook-ios`
- **Idioma principal:** Português (Brasil)
- **Categoria principal:** Livros (*Books*)
- **Categoria secundária:** Estilo de vida (*Lifestyle*)
- **Classificação indicativa (*Age Rating*):** `17+` / maiores de 18 anos (conforme Termos de Uso, seção 2, por permitir troca de mensagens e combinação de encontros presenciais entre usuários)
- **Preço:** Gratuito (*Free*)
- **URL de Política de Privacidade:** `https://ipebook.app/termos?aba=privacidade`
- **URL de Suporte:** `https://ipebook.app/ajuda`
- **URL de Marketing:** `https://ipebook.app`
- **Direitos Autorais (*Copyright*):** `2026 IpêBook Piripiri`
- **Palavras-chave (*Keywords*, até 100 caracteres):** `livros,leitura,troca,doação,sebo,piripiri,piauí,comunidade,literatura,estante`

### Texto Promocional (até 170 caracteres)
> Compre, troque ou doe livros físicos com leitores de Piripiri, PI. Negocie pelo chat e combine a entrega em pontos de encontro públicos sugeridos na cidade!

### Descrição Completa
> O IpêBook conecta quem tem livros parados na estante a quem quer ler, aqui em Piripiri (PI).
>
> - Anuncie em segundos: leia o código de barras (ISBN) com a câmera e o app preenche título, autor, editora e sinopse automaticamente.
> - Encontre livros do seu bairro para comprar, trocar ou receber de doação, além de boxes e coleções completas.
> - Converse pelo chat do app em tempo real, sem precisar expor seu número de telefone.
> - Combine a entrega em pontos públicos sugeridos da cidade, com horários de funcionamento e lembretes antes do encontro.
> - Confirme a entrega presencial pelo leitor de QR Code (ou código de 8 caracteres) e avalie a negociação.
> - Salve seus favoritos e crie alertas de busca para ser avisado quando aparecer o livro que você procura.
> - Ambiente comunitário moderado: denuncie anúncios ou perfis e bloqueie usuários com um toque.
>
> Feito para a comunidade de leitores de Piripiri, PI. Seus dados podem ser exportados ou excluídos definitivamente a qualquer momento em Configurações.

---

## 6. Questionário de Privacidade da App Store (*App Privacy*)

Ao preencher o rótulo de privacidade no App Store Connect:
- **O app coleta dados?** **Sim**.
- **Algum dado é usado para rastrear o usuário (*Tracking*) em apps/sites de terceiros?** **Não** (nenhum dado é vendido ou usado para publicidade/tracking).

| Categoria Apple | Dado Coletado | Finalidade | Vinculado à identidade do usuário? | Usado para Rastreamento (*Tracking*)? |
|---|---|---|---|---|
| **Informações de Contato** (*Contact Info*) | Nome | Funcionalidade do App (*App Functionality*) | Sim | Não |
| **Informações de Contato** (*Contact Info*) | Endereço de E-mail | Funcionalidade do App (*App Functionality*) | Sim | Não |
| **Conteúdo do Usuário** (*User Content*) | Fotos ou Vídeos (fotos de livros e de perfil escolhidas pelo usuário) | Funcionalidade do App (*App Functionality*) | Sim | Não |
| **Conteúdo do Usuário** (*User Content*) | E-mails ou Mensagens de Texto (mensagens do chat da negociação) | Funcionalidade do App (*App Functionality*) | Sim | Não |
| **Conteúdo do Usuário** (*User Content*) | Outro Conteúdo do Usuário (anúncios, avaliações e denúncias) | Funcionalidade do App (*App Functionality*) | Sim | Não |
| **Identificadores** (*Identifiers*) | ID do Usuário (*User ID*) | Funcionalidade do App (*App Functionality*) | Sim | Não |
| **Identificadores** (*Identifiers*) | ID do Dispositivo (token de notificação push) | Funcionalidade do App (*App Functionality*) | Sim | Não |

- **Localização (GPS), Histórico de Busca remoto para anúncios, Dados Financeiros e Dados de Diagnóstico/Crash de terceiros:** **Não coletados** (o bairro de Piripiri é escolhido manualmente pelo usuário no cadastro/filtro, sem uso de GPS, e o histórico de busca fica salvo apenas localmente no aparelho).

---

## 7. Informações para o Revisor da Apple (*App Review Information*)

- **Exige login (*Sign-in required*)?** Marque **Sim** e informe um usuário e senha de demonstração já cadastrado no Supabase com bairro de Piripiri selecionado e pelo menos um livro publicado.
- **Contato para o Revisor:** Nome, telefone com código `+55` e e-mail `ipebook738@gmail.com`.
- **Notas para o Revisor (*Review Notes*):**
  > O IpêBook é uma plataforma comunitária hiperlocal gratuita para moradores de Piripiri, PI trocarem, doarem ou venderem livros físicos presencialmente em 4 pontos públicos sugeridos da cidade. Não há venda de bens, assinaturas ou serviços digitais no aplicativo (In-App Purchase não se aplica, Guideline 3.1.5(a) — bens físicos fora do app); toda entrega de livros físicos ocorre presencialmente entre os moradores com confirmação por QR Code. O catálogo público pode ser navegado sem login; para testar a criação de anúncio, chat, agendamento de encontro, Sign in with Apple e exclusão definitiva da conta (*Perfil → Configurações → Excluir minha conta*), utilize a conta de teste informada acima.
