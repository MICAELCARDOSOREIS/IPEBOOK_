# Issue #219 — [Design/Figma] Sincronizar mockups do Figma com a evolução do app e auditoria de UX/Acessibilidade

* **Responsável:** Eric Vinícius dos Santos Oliveira ([@Eric2025gh](https://github.com/Eric2025gh))
* **Labels:** `pessoa:eric-vinicius`, `design`, `figma`, `ux`, `accessibility`, `no-code`
* **Tipo:** Design / Documentação (Zero alterações em código da aplicação)
* **Arquivo do Figma:** [IpêBook no Figma](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook) (Canvas `APP · 10 · Android · Material 3`)
* **Documento Base de Referência:** [`docs/relatorio-alinhamento-figma-e-evolucao-ux.md`](../../docs/relatorio-alinhamento-figma-e-evolucao-ux.md)
* **Inventário de 137 Telas com Node IDs:** [`design-system/telas-android-figma.md`](../../design-system/telas-android-figma.md)

---

## ⚠️ AVISO IMPORTANTE SOBRE A AMPLITUDE: QUASE TODAS AS TELAS FORAM ALTERADAS

> **Atenção:** O trabalho de design não é pontual em uma ou duas telas. Durante o ciclo de testes em Piripiri (PI), refinamentos de IHC, WCAG 2.2 AA e Material Design 3, **praticamente todas as 42 telas e fluxos do aplicativo receberam atualizações no código e estão defasadas no Figma**.
> 
> O Eric precisa passar sistematicamente pelos 8 fluxos e conferir os frames correspondentes no Figma, aplicando as alterações descritas no relatório de alinhamento.
>
> 🛑 **REGRA DE OURO:** **NÃO MEXER NO CÓDIGO DA APLICAÇÃO**. O código React Native / Expo já está validado, com testes automatizados passando e em conformidade técnica. O trabalho é 100% no arquivo do Figma e nos artefatos visuais.

---

## 📌 Contexto e Objetivo

O aplicativo **IpêBook** passou por sucessivas rodadas de testes com leitores reais de Piripiri (PI) e por uma auditoria exaustiva de acessibilidade (WCAG 2.2 AA) e ergonomia móvel baseada em Material Design 3 (M3).

Como consequência natural dessas melhorias, a base de código implementada em React Native / Expo evoluiu além dos mockups originais desenhados no Figma, gerando um descompasso visual e estrutural entre o que está no arquivo de design e o produto real entregue.

O objetivo do Eric é atualizar o arquivo do Figma para refletir 1:1 a realidade madura do aplicativo, utilizando como guia detalhado o inventário já mapeado em `docs/relatorio-alinhamento-figma-e-evolucao-ux.md`.

---

## 🛑 Restrições Obrigatórias

- **Nenhum arquivo de código em `src/`, `tests/`, `package.json` ou configs deve ser alterado.**
- Todo o trabalho prático é executado diretamente na interface do **Figma**.
- Preservar os padrões e tokens do Design System do IpêBook (`tokens.colors`, `tokens.radius`, `tokens.typography`).

---

## 🔍 Pilares Transversais (Afetam Praticamente Todas as Telas)

O Eric deve aplicar estes 5 padrões transversais em todos os frames:

1. **Tipografia Unificada Plus Jakarta Sans:**
   - Toda a interface foi padronizada na tipografia **Plus Jakarta Sans**, garantindo legibilidade editorial superior e acolhimento comunitário.
2. **Acessibilidade WCAG 2.2 AA & Contraste:**
   - **Bordas e limites (Critério 1.4.11):** Substituir bordas cinzas claras antigas (`#d3ccc2`) pela cor canônica M3 `outline` (`#7E776F`, contraste 4.23:1).
   - **Alvos de Toque (Critério 2.5.8):** Garantir que botões de ação e ícones interativos tenham área clicável mínima visual/espacial de **48×48 dp**.
   - **Cores Semânticas de Modalidade:** Venda (`#436815`), Troca (`#745B00`), Doação (`#9C4146`).
3. **Material Design 3 Canônico & Raios Concêntricos:**
   - **Diálogos e BottomSheets:** Raio arredondado canônico de **28 dp** (`tokens.radius.xxl`), abandonando raios arbitrários de 12–16 dp.
   - **Raios Concêntricos:** $R_{externo} = R_{interno} + \text{Padding}$ em cards aninhados e linhas da estante.
4. **Ergonomia Móvel e Thumb Zone:**
   - CTAs primários no terço inferior da tela, acessíveis com o polegar.
   - Mensagens de erro de formulário com o padrão `InlineErrorCard` (ADR 0102).
5. **Resiliência e Zero States (Estados Vazios):**
   - Ilustrações e microcópia acolhedora nos estados vazios (Busca sem resultado, Estante vazia, Sem propostas, Sem favoritos, Histórico limpo).
   - Feedback não intrusivo com ação de "Desfazer" (*Undo* via Snackbar).

---

## 📋 Inventário Completo de Telas a Ajustar (Fluxo a Fluxo)

Consulte `docs/relatorio-alinhamento-figma-e-evolucao-ux.md` e `design-system/telas-android-figma.md` para os `Node IDs` exatos no Figma:

### FLUXO 01 — Boas-vindas, Onboarding e Autenticação
- [ ] `01.01 · Boas-vindas` (`324:38` / `146:457`): cards das modalidades nas cores canônicas e cantos de 16px; layout responsivo com cabeçalho adaptativo.
- [ ] `01.02 · Como Funciona e Segurança` (`146:610`): adicionar seção de segurança comunitária de Piripiri com ícone de escudo e etapas ilustradas de encontro público.
- [ ] `01.03 · Termos de Uso e Privacidade` (`354:5810`): seletor de abas acessível e formatação em duas colunas.
- [ ] `01.10 · Entrar com E-mail` (`354:6017`): encadeamento de foco de teclado, `InlineErrorCard` e botão Google destacado.
- [ ] `01.11 · Criar Conta` (`354:6200`): checkbox acessível de termos e tela de confirmação pós-cadastro "Quase lá! Confirme seu e-mail".
- [ ] `01.12 / 01.13 · Recuperar e Redefinir Senha`: feedback de link enviado com botão para reenviar.
- [ ] `01.17 · Excluir Conta`: tela destrutiva em tons de alerta vermelho com diálogo de confirmação sobre perda irreversível de trocas e avaliações.

### FLUXO 02 — Descoberta, Bairros e Catálogo
- [ ] `02.01 · Início (Home)` (`9:525`): **Seletor de Bairros de Piripiri** no topo (modal de seleção por proximidade comunitária) e carrosséis com proporção de capa editorial 2:3.
- [ ] `02.02 / 02.04 · Explorar e Catálogo` (`10:2`, `10:96`): barra permanente de busca, chips de modalidade ativos e layout de grade responsivo.
- [ ] `02.03 · Filtrar Livros` (`149:2803`): BottomSheet com filtros por bairro, gênero, modalidade e ordenação avançada.
- [ ] `02.05 · Busca sem Resultado` (`10:169`): estado vazio acolhedor com ilustração, dicas de busca e botão para limpar filtros.
- [ ] `02.06 / 02.14 · Favoritos e Alertas`: estados com itens e estados vazios com CTAs para explorar livros.
- [ ] `02.15 / 02.16 · Histórico de Busca`: chips de buscas recentes e diálogo de confirmação para limpar histórico.

### FLUXO 03 — Detalhe do Livro e Proposta
- [ ] `03.01 · Detalhes do Anúncio`: badge visual da modalidade, localização aproximada (bairro de Piripiri sem expor endereço privado), informações do leitor anunciante e botão fixo inferior "Tenho interesse".
- [ ] `03.02 · Modal de Enviar Proposta`: seleção de livros da estante do interessado para troca, oferta em dinheiro para venda ou pedido direto de doação.
- [ ] `03.03 · Denúncia de Anúncio`: modal acessível com opções de denúncia e aviso de moderação comunitária.

### FLUXO 04 — Cadastro e Edição de Anúncio
- [ ] `04.01 · Busca por ISBN`: campo inteligente com preenchimento automático via BrasilAPI / Crossref.
- [ ] `04.02 · Formulário de Anúncio`: seleção de estado do livro (Novo, Excelente, Bom, Marcas de uso), modalidade (Troca, Venda, Doação) e bairro de entrega.
- [ ] `04.03 · Upload de Fotos`: preview de capa com proporção 2:3 e botão de remoção acessível.
- [ ] `04.04 · Rascunhos de Anúncios`: tela de rascunhos salvos localmente com andamento segmentado e acolhimento.
- [ ] `04.05 · Edição de Anúncio`: formulário pré-preenchido com validação instantânea.

### FLUXO 05 — Minha Estante
- [ ] `05.01 · Minha Estante Geral`: **Barra única permanente de chips de filtro** (Meus Livros, Propostas, Emprestados, Rascunhos), substituindo o modelo antigo de abas deslizantes.
- [ ] `05.02 · Linha do Livro na Estante`: cards com raios concêntricos, menu de ações contextuais (Editar, Pausar, Marcar como trocado, Excluir) e feedback via Snackbar.
- [ ] `05.03 · Estante Vazia`: zero state com ilustração empática e botão direto "Anunciar meu primeiro livro".

### FLUXO 06 — Negociações e Mensagens
- [ ] `06.01 · Lista de Conversas`: threads de negociação ativas com badges de status (Aguardando resposta, Aceita, Recusada, Concluída).
- [ ] `06.02 · Chat / Detalhes da Negociação`: cabeçalho com livro envolvido, mensagens seguras e sugestão de **Pontos de Encontro Públicos Seguros de Piripiri** (ex: Praça de Eventos, Estação Ferroviária, Biblioteca Municipal).
- [ ] `06.03 / 06.04 · Aceite e Conclusão`: confirmação mútua da troca/entrega e diálogo de avaliação.

### FLUXO 07 — Perfil e Avaliações Comunitárias
- [ ] `07.01 · Meu Perfil`: estatísticas de circulação (livros trocados, doados, economia gerada), selos de leitor comunitário e nota de reputação.
- [ ] `07.02 · Editar Perfil`: alteração de nome, bairro habitual e biografia de leitor com foco acessível.
- [ ] `07.03 · Perfil Público de Outro Leitor`: visão transparente para segurança na negociação, sem dados sensíveis de contato.

### FLUXO 08 — Configurações e Modais Globais
- [ ] `08.01 · Configurações`: alternância de tema Claro/Escuro (Material 3 Dynamic Colors), preferências de notificações e avisos.
- [ ] `08.02 · Modal Offline / Erro de Rede`: ilustração de desconexão amigável e botão "Tentar novamente" com auto-recuperação (ADR 0102).

---

## ✅ Critérios de Aceite

1. O arquivo [IpêBook no Figma](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook) está atualizado e sincronizado com os 8 fluxos descritos no relatório.
2. Praticamente todas as telas do Figma foram revisadas e refletem a versão real do código implementado.
3. Contrastes de borda e texto cumprem WCAG 2.2 AA (mínimo 3:1 para limites de componentes; 4.5:1 para texto normal).
4. Modais e diálogos adotam o raio canônico M3 de 28 dp.
5. **Nenhum arquivo de código do repositório foi modificado.**
6. O inventário em `docs/relatorio-alinhamento-figma-e-evolucao-ux.md` foi validado visualmente contra os frames atualizados no Figma.
