# Backlog futuro — Build Android e deploy Web (quando houver o que publicar)

> **Reformulada em 2026-10-14.** Esta tarefa era sobre `/home/usermicael/Projetos/IpeBook`,
> projeto que a equipe decidiu **não usar mais**. A parte sobre "corrigir o remoto do GitHub
> quebrado" não se aplica mais — era especificamente sobre a infraestrutura daquele projeto
> abandonado, e o `IPEBOOK_` já tem remoto funcional. Só a parte de build/deploy foi mantida
> como ideia de backlog, por ser relevante para qualquer app Expo eventualmente.

Responsável: Micael Cardoso Reis (quando a ideia for retomada)

## Ideia para quando o IPEBOOK_ tiver algo pronto para publicar

- Gerar build Android via EAS Build quando houver uma versão com valor real para instalar (hoje
  só há a listagem de exemplo).
- Configurar deploy Web (ex.: Vercel) quando `npm run build:web` gerar algo que valha a pena
  publicar.
- Manter o README com o estado real do que está implementado (ver
  `CONTRIBUTING.md`, seção 6, sobre manter documentação atualizada).

## O que não fazer agora

- Não gerar build nem configurar deploy antes de haver uma entrega com valor real (specs 003/004
  implementadas).

---

## Registro de execução

- Data: 2026-10-14
- Pré-requisito cumprido: specs 003 (#19) e 004 (#21) foram implementadas e mergeadas em
  `develop` — há agora uma entrega com valor real para publicar.
- O que foi feito:
  - Configurado deploy Web estático na Vercel (`vercel.json`: `buildCommand: npm run build:web`,
    `outputDirectory: dist`, com fallback de 404 para `/+not-found.html`).
  - `npm run build:web` validado localmente: gera 8 rotas estáticas em `dist/`
    (`/`, `/entrar`, `/criar-conta`, `/anunciar`, `/meus-pedidos`, `/pedidos-recebidos`,
    `/_sitemap`, `/+not-found`).
  - README atualizado: nota de "spec ainda não implementada" corrigida, e nova seção "Deploy
    Web" documentando o comando e a configuração.
- O que não foi feito: build Android via EAS Build — exige login/credenciais da conta Expo
  (ação externa que precisa de autorização direta do usuário); e a publicação em si na Vercel
  (exige conectar a conta/projeto Vercel, também ação externa).
- Testes executados e resultado: `npm run validate` completo (typecheck, arquitetura, testes)
  passando antes e depois da mudança — mudança não tocou código de produto.
- Pendências: publicar de fato (conectar repositório a um projeto Vercel) e, separadamente,
  gerar o build Android via EAS — ambos dependem de autorização/credenciais externas do
  usuário.
