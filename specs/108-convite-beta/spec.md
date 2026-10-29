# Especificação 108 — Página de convite para o beta na Play Store

Status: implementada localmente; migração, publicação remota e conferência em produção pendentes.

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
- Na web, a página inicial mostra apenas "Quero testar o app" (`/beta`), sem o botão "Ver na Play Store" e sem Entrar/Criar conta; as demais telas do app redirecionam para `/bem-vindo`.
- Continuam abertas pelo endereço: `/beta`, `/sobre`, `/ajuda`, `/termos`, `/excluir-conta` e `/auth/callback` (a Play Store exige o link de exclusão de conta; quando sem sessão na web, `/excluir-conta` mostra instrução direta de solicitação por e-mail sem levar para `/entrar`). O app Android não muda.
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
- Play Store: `https://play.google.com/store/apps/details?id=com.ipebook.app&hl=pt-BR`
- Convite do teste fechado: `https://play.google.com/apps/testing/com.ipebook.app?hl=pt-BR`
- Grupo do Google dos testadores: `https://groups.google.com/g/ipebook-testadores?hl=pt-BR`

## Conexão com Google, grupo de testadores e Play Store
- O cartão de inscrição oferece o botão destacado "Continuar com Google" (`GoogleLogo`), permitindo ao visitante conectar sua conta Google com 1 toque (ou digitar nome e Gmail manualmente).
- Ao autenticar com o Google (ou enviar o formulário), a tela grava o Gmail e nome em `v2_beta_testers` automaticamente.
- A confirmação exibe o botão principal "Abrir teste na Play Store" (`TESTING_OPT_IN_URL`) e o botão "Entrar no grupo de testadores" (`BETA_GROUP_URL`).
- A coluna esquerda apresenta 3 cartões de destaque horizontais sobre a comunidade (*Troca, venda e doação*, *Encontros em Piripiri*, *Leitores fundadores*) e, logo abaixo, o botão expansível **"Precisa de ajuda para instalar?"**, que abre um guia visual em 4 etapas com as capturas de tela reais marcadas em vermelho indicando onde clicar (1. Participar do grupo no Google Grupos, 2. Confirmar entrada no grupo, 3. Toque em "Torne-se um testador" no Google Play, 4. Toque em "baixe-o no Google Play").
- A barra superior conta com link/botão "Início" para voltar à página inicial (`/`) e logotipo clicável.
- O layout web ocupa a largura total da tela com margens de `64px`, evitando que o conteúdo fique espremido no centro.
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
| CA10 | Navegação para home e passos guiados para liberação da Play Store | `tests/components/betaInviteScreen.test.tsx` |
