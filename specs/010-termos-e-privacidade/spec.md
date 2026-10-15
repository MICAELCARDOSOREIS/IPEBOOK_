# 010 — Termos de Uso e Política de Privacidade

Status: especificada. Data: 2026-10-15.

## Objetivo

Disponibilizar aos leitores e visitantes uma tela clara e acessível contendo os Termos de Uso e a Política de Privacidade do Ipebook, alinhada à Lei Geral de Proteção de Dados (LGPD) e às exigências de conformidade para publicação em lojas de aplicativos e na Web pública.

## Escopo

- Definição textual estruturada dos Termos de Uso (regras da comunidade, atuação prioritária em Piripiri, PI, livros físicos, 18+, segurança nos encontros).
- Definição textual da Política de Privacidade (LGPD: dados coletados, sigilo do e-mail, direitos do titular e exclusão).
- Componente de visualização `TermsAndPrivacy` com alternância entre as duas seções e cabeçalho `TopAppBar`.
- Rota estática do Expo Router `src/app/termos.tsx`.
- Links de acesso na tela de cadastro (`signUp.tsx`) e rodapé/informações da Home.
- Testes automatizados de componentes garantindo renderização e acessibilidade.

## Critérios de aceite

1. A tela apresenta abas ou seletor claro para alternar entre "Termos de Uso" e "Política de Privacidade".
2. Os Termos de Uso explicitam a finalidade da comunidade de livros físicos, restrição a Piripiri, PI, e responsabilidade nos encontros presenciais.
3. A Política de Privacidade esclarece que o e-mail não é divulgado a terceiros e cita os direitos da LGPD.
4. A rota `/termos` é pública e pode ser acessada por qualquer visitante sem exigir login.
5. Acessibilidade semântica com cabeçalhos acessíveis (`accessibilityRole="header"`) e navegação de retorno.

## Validação

- Testes de renderização semântica e alternância de seções.
- `npm run validate` e `npm run build:web` exportando a rota `/termos`.
