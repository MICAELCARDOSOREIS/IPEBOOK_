# Especificação 108 — Página de convite para o beta na Play Store

Status: implementada; migração aplicada no Supabase remoto (2026-10-31); site publicado (2026-10-31).

## Objetivo
Chamar leitores de Piripiri para testar o app Android antes do lançamento, juntando os Gmails num
só lugar para depois colocá-los na lista de testadores do Play Console.

## Escopo
- Página pública `/beta` no site (sem login): o que é o IpêBook, como funciona o teste, link da
  Play Store e formulário com nome (opcional) e Gmail.
- Os e-mails ficam na tabela `v2_beta_testers` do Supabase, gravados só pela função
  `v2_register_beta_tester` (SECURITY DEFINER). Ninguém lê pela API; o dono consulta no painel do
  Supabase ou pelo SQL abaixo.
- Fora do escopo: adicionar os e-mails no Play Console automaticamente (a API pública não permite
  editar listas de testadores) e enviar e-mail de confirmação.

## Site só com o convite (por enquanto)
- Na web, a página inicial troca Entrar/Criar conta por "Quero testar o app" (`/beta`) e
  "Ver na Play Store"; as demais telas do app redirecionam para `/bem-vindo`.
- Continuam abertas pelo endereço: `/beta`, `/sobre`, `/ajuda`, `/termos`, `/excluir-conta`,
  `/entrar`, `/esqueci-senha`, `/redefinir-senha` e `/auth/callback` (a Play Store exige o link de
  exclusão de conta; o login volta para `/excluir-conta`). O app Android não muda.
- Para reabrir o site completo, desligar `WEB_BETA_ONLY` em `src/view/webBetaMode.ts`.

## Regras
- **RN-01** E-mail obrigatório, com formato válido, até 254 caracteres; guardado em minúsculas e sem
  espaços. Precisa ser uma Conta Google (a página pede Gmail; outros domínios são aceitos porque
  podem ser contas Google).
- **RN-02** Nome opcional, sanitizado, até 80 caracteres.
- **RN-03** Inscrever o mesmo e-mail de novo não é erro: a pessoa vê a mesma confirmação.
- **RN-04** Anônimos não leem, alteram nem apagam a tabela; só chamam a função.
- **RN-05** Contra spam, no máximo 300 inscrições novas por hora no total (código `IBLIM`).

## Links
- Play Store: `https://play.google.com/store/apps/details?id=com.ipebook.app`
- Teste fechado: o link de participação aparece após a aprovação da faixa Alpha.

## Entrada automática no teste (Grupo do Google)
- A lista de testadores do teste fechado é um Grupo do Google com entrada livre; quem entra no
  grupo vira testador sem ação do desenvolvedor.
- O `/beta` mostra 3 passos com botão: entrar no grupo (`BETA_GROUP_URL`), aceitar o convite
  (`https://play.google.com/apps/testing/com.ipebook.app`) e instalar pela Play Store, com aviso de
  que a liberação pode levar alguns minutos. Sem grupo configurado, o primeiro passo mostra
  "abre em breve". Configuração em `src/view/playStore.ts`.
- Grupo criado em 2026-10-31: `ipebook-testadores@googlegroups.com` (qualquer pessoa vê e participa; só proprietários postam), configurado como testadores do Teste fechado (Alpha) no lugar das listas de e-mails.
- O formulário continua só para avisos de novas versões.

## Conexão com Google e redirecionamento para a loja
- O cartão de inscrição oferece o botão destacado "Continuar com Google" (`GoogleLogo`), permitindo ao visitante conectar sua conta Google com 1 toque.
- Ao autenticar com o Google (ou se já estiver conectado), a tela grava o Gmail e nome em `v2_beta_testers` automaticamente e exibe o estado conectado com o e-mail em destaque.
- A ação principal passa a ser "Abrir teste na Play Store" (levando a `TESTING_OPT_IN_URL` para aceitar o convite e baixar o app), além do botão para entrar no grupo de testadores e opção de trocar de conta.
- O formulário manual de nome e Gmail permanece disponível como alternativa ("ou informe seu Gmail").
- No retorno de autenticação web, `/auth/callback` preserva a rota de origem (`/beta`) via `sessionStorage.auth_return_to` para que o retorno volte diretamente para `/beta`.

## Exportar os e-mails para o Play Console
```sql
select string_agg(email, ',' order by created_at) from public.v2_beta_testers where invited_at is null;
update public.v2_beta_testers set invited_at = now() where invited_at is null;
```
Cole a lista em *Teste fechado → Testadores → lista de e-mails*.

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | Valida e normaliza e-mail e nome (RN-01, RN-02) | `tests/unit/betaSignupUseCases.test.ts` |
| CA2 | Inscrição repetida confirma sem erro (RN-03) | `tests/unit/betaSignupUseCases.test.ts` e `npm run test:sql` |
| CA3 | Anônimo não lê nem altera a tabela; função grava (RN-04) | `npm run test:sql` |
| CA4 | Limite global por hora (RN-05) | `npm run test:sql` |
| CA5 | Tela mostra link da loja, envia, exibe erro e sucesso | `tests/components/betaInviteScreen.test.tsx` |
| CA6 | Rota `/beta` gerada no build web | `npm run build:web` |
| CA8 | Passos de instalação abrem grupo, convite e loja; aviso de espera | `tests/components/betaInviteScreen.test.tsx` |
| CA7 | Site sem entrar/criar conta e com redirecionamento | `tests/unit/webBetaMode.test.ts`, `tests/components/welcomeWide.test.tsx` |
| CA9 | Login com Google registra testador e exibe link da loja | `tests/components/betaInviteScreen.test.tsx` |
