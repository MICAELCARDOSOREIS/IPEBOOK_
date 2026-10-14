# Changelog

Versões no formato `MAIOR.MENOR.CORREÇÃO`. Mudança grande = versão nova.

## 1.0.0 · 2026-10-14

- Primeira versão do sistema, criada a partir do `design-kit/` já existente no repositório
  (importado do Figma e refinado nas Tarefas 23/24/26), reorganizado no formato de 8 arquivos
  exigido pela atividade de IHC + PDM, com Material 3 como sistema base único.
- **Responsáveis:** Micael Cardoso Reis.
- **Mudanças:**
  - `README.md`: visão geral, cinco forças, inventário de telas, mapa de arquivos, etiquetas de
    origem, glossário, governança e instruções para IA.
  - `01-principios.md`: 5 princípios (uma ação por tela, cor nunca é o único sinal, bairro não
    distância, marca na serifa, sem dark mode ainda).
  - `02-tokens.md` e `03-fundamentos.md`: tokens primitivos/semânticos/de componente e regras de
    uso, extraídos de `design-kit/tokens.json`.
  - `04-componentes/`: 6 componentes (botão, campo de texto, tag, capa ilustrativa, barra de
    navegação, diálogo), cada um com anatomia, variantes, estados, acessibilidade e código React
    Native.
  - `05-padroes.md`: fluxos "Entrar/Criar conta" e "Anunciar livro", com estados de carregando,
    erro, vazio e sucesso.
  - `06-acessibilidade.md`: tabela de contraste com os 6 pares já verificados na Tarefa 26.
  - `07-teste-com-ia.md`: teste cego com um assistente de IA construindo a tela Explorar.
- Ajustes feitos após o teste com IA: ver [07-teste-com-ia.md](07-teste-com-ia.md), seção
  "Desvios e correções na documentação".
