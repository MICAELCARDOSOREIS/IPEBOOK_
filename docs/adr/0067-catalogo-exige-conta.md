# 0067 — Catálogo exige conta: fim da navegação de visitante

Data: 2026-10-27. Status: aceito.

## Contexto

Até aqui o app oferecia navegação sem sessão: a Boas-vindas tinha o botão "Explorar livros
sem entrar" (e "Explorar livros" na web larga), e as rotas `/` (Início) e `/pesquisa`
(Explorar) listavam o catálogo para qualquer pessoa, com um banner discreto sugerindo entrar.
Na revisão de segurança pedida pelo usuário para a `develop`, esse acesso anônimo ao catálogo
foi apontado como o principal ponto de melhoria: expõe a vitrine comunitária inteira
(títulos, bairros, anunciantes) a qualquer visitante e a raspadores, sem benefício direto
para o beta restrito a Piripiri.

A ADR 0038 mantém valor em outro caminho: os **links compartilhados** de anúncio
(`/livro/[id]`) e a página de apresentação (`/sobre`) continuam públicos, e as políticas RLS
de leitura anônima de `v2_profiles`/`v2_ratings` existem justamente para essas telas.

## Decisão

1. Remover os botões de acesso de visitante da Boas-vindas (`src/view/onboarding/welcome.tsx`
   e `welcomeRoute.tsx`); sem conta, a tela só oferece "Começar" (criar conta) e
   "Já tenho conta" (entrar).
2. Criar o guard `RequireAuth` (`src/view/components/RequireAuth.tsx`), no mesmo padrão já
   usado por "Meus anúncios": enquanto a sessão é verificada nada é renderizado; sem usuário,
   a rota redireciona.
3. Aplicar o guard nas rotas de catálogo: `/pesquisa` → `/entrar` e `/` → `/bem-vindo`
   (mesmo destino do portão de primeiro acesso, sem corrida de redirecionamento).
4. Manter públicos `/livro/[id]` (destino do compartilhamento no WhatsApp, Specs 019/050)
   e `/sobre` (apresentação do app), conforme ADR 0038.

## Consequências

- **Positivas**: o catálogo só aparece para pessoas com sessão; o funil passa a começar no
  cadastro/login; deep links compartilhados continuam funcionando e convertem na tela de
  acesso quando a pessoa toca em "Conversar"/"Tenho interesse".
- **Negativas**: quem chegava pela web sem conta e só "dava uma olhada" encontra o login
  primeiro; a Início perde eventual efeito de vitrine para SEO — o beta é comunitário e
  restrito a Piripiri, o custo foi considerado aceitável.
- **Segurança**: a barreira é de rota (não só visual): digitar a URL não contorna. A
  proteção de dados continua garantida pela RLS no Supabase; o guard é UX e redução de
  superfície.
- **Histórico**: o registro da Spec 026 (boas-vindas) descreve o botão de visitante como
  comportamento da época e foi preservado como histórico.
