# Especificação 021: Estados Globais de Carregamento e Erro

## 1. Contexto e Problema

Hoje cada tela provavelmente trata carregamento/erro/sem conexão à sua maneira (ou não trata),
porque não existe um padrão único documentado. Isso gera inconsistência visual e, em alguns
casos, telas que travam silenciosamente sem avisar a pessoa usuária o que aconteceu.

Telas correspondentes no Figma (fluxo 10 · Estados do sistema): `10.01 · Explorar carregando`,
`10.02 · Sem conexão`, `10.03 · Erro ao carregar`.

Esta é a spec de menor prioridade das 6 — é transversal (não é uma tela nova navegável, é um
padrão reaproveitado) e pode ser adiada sem bloquear as outras.

## 2. Escopo e Restrições

- **O que faz parte:**
  - Um componente de estado de carregamento padrão (skeleton ou spinner, a decidir na
    implementação) para listas (Explorar, Estante, Conversas, etc.).
  - Um componente de estado "sem conexão" reaproveitável, detectando perda de rede.
  - Um componente de estado de erro genérico reaproveitável ("Algo deu errado" + ação de tentar
    de novo), para quando uma chamada a datasource falha.
  - Aplicar esses três componentes nas telas que já existem e hoje não tratam esses estados
    (telas específicas a levantar no início da implementação, não listadas aqui de antemão).
- **O que NÃO faz parte:**
  - Modo offline de verdade (cache local, fila de ações pendentes) — só avisar que está sem
    conexão, não operar offline.
  - Retry automático silencioso — a ação de tentar de novo é sempre explícita (botão), nunca
    automática em loop.

## 3. Critérios de Aceite

- [ ] Toda lista que busca dados de um datasource mostra um estado de carregamento visível
  enquanto espera a resposta.
- [ ] Quando a rede cai durante o uso, o app mostra um aviso de "sem conexão" sem travar a tela.
- [ ] Quando uma chamada a datasource falha por outro motivo (erro do servidor, dado inválido),
  o app mostra uma mensagem de erro com ação de tentar de novo, nunca uma tela em branco.
- [ ] Os três estados usam os tokens do design system (`tokens.colors`, `tokens.typography`),
  sem cor ou texto literal.
- [ ] Cobertura de testes acima de 80% e zero violações em `npm run check:architecture`.
