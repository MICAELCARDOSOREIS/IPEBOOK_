# Especificação 012: Central de Ajuda, FAQ e Guia de Segurança em Piripiri

## 1. Contexto e Motivação
O Ipebook é uma plataforma comunitária voltada para a circulação de livros físicos na cidade de Piripiri, PI. Para garantir a melhor experiência para os usuários (ISO/IEC 25010 - Usabilidade e Acessibilidade) e esclarecer dúvidas operacionais, é necessária uma tela de Central de Ajuda e Perguntas Frequentes (FAQ), detalhando o funcionamento de trocas, doações, vendas acessíveis, pontos de encontro seguros e canais de contato com a equipe.

## 2. Escopo
- **Incluído:**
  - Modelo de dados de conteúdo `src/model/helpContent.ts` com categorias organizadas (Como funciona, Segurança e Encontros em Piripiri, Regras e Taxas, Suporte).
  - Tela `HelpAndFaq` em `src/view/help/helpAndFaq.tsx` com itens expansíveis/acessíveis ou seções claras.
  - Rota `src/app/ajuda.tsx` no Expo Router.
  - Atalho de navegação na tela Home (`src/view/home.tsx` e `src/app/index.tsx`).
  - Testes de componentes automatizados cobrindo acessibilidade, renderização das seções e navegação.
- **Fora de escopo:**
  - Chat em tempo real ou bot de inteligência artificial externo.
  - Escopo de perfil/avatar da Maria Clara (Issue #55).

## 3. Critérios de Aceite
1. **CA1 — Seções claras:** A tela apresenta respostas objetivas sobre:
   - Trocas e doações gratuitas e vendas a preços populares.
   - Pontos de encontro públicos e seguros sugeridos em Piripiri (Campus IFPI, Praça da Bandeira, Memorial Espedito Resende).
   - Ausência de taxas (100% comunitário e gratuito).
   - Canal de contato e reporte com os moderadores.
2. **CA2 — Navegação acessível:** Disponível a partir de um link no rodapé da Home, com botão de retorno ("Voltar") e rótulos semânticos para leitores de tela.
3. **CA3 — Design System e responsividade:** Utiliza os tokens do Ipebook, tipografia Roboto/Source Serif e suporta layout responsivo móvel e desktop (largura máxima 720px centralizada).
