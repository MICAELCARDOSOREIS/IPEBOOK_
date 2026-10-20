# Spec 028 — Alinhamento das telas do Micael ao Figma e ao Design System

**Responsável:** Micael Cardoso Reis
**Fonte visual:** [Figma — IpêBook](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?m=dev),
canvas `APP · 10 · Android · Material 3` (inventário em `design-system/telas-android-figma.md`).

## Problema

As telas sob responsabilidade do Micael foram implementadas antes do fechamento do design system
e divergem das telas do Figma em copy, hierarquia visual, campos e estados. A auditoria registrada
em `docs/estado.md` afirmava alinhamento que não se confirma na comparação nó a nó.

Divergências que esta spec corrige:

| Figma | Divergência encontrada |
| --- | --- |
| `01.10 · Entrar com e-mail` (`354:6017`) | Manchete e copy genéricas; logotipo fora do lugar |
| `01.03 · Criar conta` (`336:118`) | Sem campo "Nome completo" e sem aceite explícito dos termos |
| `01.04 · Recuperar acesso` (`6:534`) | Copy divergente; sem ação secundária contornada |
| `01.05 · Confira seu e-mail` (`6:597`) | Sem ícone, sem "Corrigir e-mail" e sem contador de reenvio |
| `01.06 · Nova senha` (`254:3595`) | Copy divergente |
| `04.01 · Anunciar — etapa 1` (`12:210`) | Fluxo de 3 etapas colapsado em 1; `StepProgress` decorativo |
| `04.04 · Mostre seu livro` (`28:685`) | Sem etapa de fotos, sem dica de foto, sem lombada/páginas |
| `04.05 · Detalhes do livro` (`12:360`) | Sem conservação, sem descrição com contador, categoria sem chips |
| `04.07 · Anúncio publicado` (`12:418`) | Sucesso como texto inline, sem próximos passos |
| `04.08 · Gerenciar anúncio` (`149:3348`) | Sem tela de gerenciamento por anúncio |
| `04.09 · Editar anúncio` (`19:242`) | Sem conservação; ações sem hierarquia |
| `02.06 · Favoritos` (`10:227`) | Sem abas Livros/Alertas; linha sem modalidade, preço e bairro |
| Tokens da marca | `theme_color` do PWA em `#0D47A1`, fora da paleta |

## Escopo

1. **Design System** — implementar as variantes de botão que o `botao.md` documenta e ainda não
   existiam em código (contornado e texto) e a caixa de seleção usada no aceite dos termos.
2. **Acesso** — alinhar `01.03`, `01.04`, `01.05`, `01.06` e `01.10`, incluindo o nome da pessoa
   no cadastro (persistido) e o aceite explícito dos termos.
3. **Publicação** — reconstruir `/anunciar` em 3 etapas (`04.01`, `04.04`, `04.05`), com tela de
   sucesso (`04.07`); alinhar `/editar-anuncio/[id]` a `04.09`; criar `/gerenciar-anuncio/[id]`
   conforme `04.08`.
4. **Descoberta** — alinhar `/favoritos` a `02.06` (abas, linha completa, desfavoritar na lista).
5. **Marca** — corrigir a cor de tema e o ícone declarados para a Web/PWA.

## Fora de escopo (e por quê)

- `01.02 · Entrar` e `Continuar com Google`: exigem provedor OAuth configurado e credenciais
  externas, que não existem no projeto.
- `04.02`, `04.03`, `04.18` (ISBN pela câmera): exigem `expo-camera` e um serviço externo de
  catalogação bibliográfica.
- `04.11`–`04.16` (rascunhos): já especificados na Spec 017, que permanece pendente.
- `11.01`–`11.05` (permissões do sistema): já especificados na Spec 020, que permanece pendente.
- `Marcar como concluído` em `04.08`: exige um novo valor de `BookStatus` e revisão do ciclo de
  negociação (Specs 004/009), fora do recorte visual desta spec.
- `Compartilhar` em `04.07`: pertence à Spec 019, de outra pessoa da equipe.
- Fluxo "Tirar outra foto" (`04.04`): sem `expo-image-picker` no projeto, os três slots de foto
  continuam recebendo endereço de imagem, como já acontece hoje.

## Comportamento esperado

### Acesso

- **RN-01** O cadastro pede nome completo, e-mail e senha; o nome é obrigatório, tem no mínimo
  2 caracteres e é gravado junto da conta, passando a alimentar o perfil público.
- **RN-02** O cadastro só envia depois do aceite explícito dos termos; sem aceite, o botão
  permanece ativo e a mensagem de erro aparece junto da caixa de seleção.
- **RN-03** Depois de pedir a recuperação, a tela mostra o endereço informado, a caixa "Não
  chegou?", a ação "Corrigir e-mail" (volta ao formulário com o e-mail preenchido) e um contador
  de 45 segundos que libera o reenvio.
- **RN-04** As manchetes das telas de acesso usam a serifa da marca com a copy do Figma.

### Publicação

- **RN-05** `/anunciar` tem três etapas navegáveis — Livro, Fotos e Detalhes — com `StepProgress`
  refletindo a etapa real; só a última etapa publica.
- **RN-06** A etapa Detalhes oferece conservação (Novo, Bom estado, Com marcas, Desgastado) e
  categoria como chips de escolha única, descrição com limite de 280 caracteres e contador, e
  bairro de Piripiri escolhido a partir da lista oficial.
- **RN-07** Publicado o anúncio, a tela de sucesso mostra o livro, os próximos passos e as ações
  "Ver meus anúncios" e "Voltar ao início".
- **RN-08** `/editar-anuncio/[id]` edita título, autor, preço, conservação, categoria, descrição e
  bairro, com a ação principal fixa no rodapé.
- **RN-09** `/gerenciar-anuncio/[id]` mostra o anúncio, o estado atual e as ações editar, pausar
  ou retomar e excluir (com confirmação em diálogo).

### Descoberta

- **RN-10** `/favoritos` tem abas "Livros (n)" e "Alertas (n)"; a aba de alertas leva à rota de
  alertas já existente.
- **RN-11** Cada favorito mostra modalidade, preço quando houver, autor, conservação e bairro, e
  permite desfavoritar na própria lista.

### Marca

- **RN-12** A cor de tema da Web é a cor de ação do design system e o manifesto aponta para um
  ícone que existe no pacote publicado.

## Critérios de aceite

1. Cada tela listada no escopo corresponde ao nó do Figma em estrutura, ordem dos elementos e
   copy, salvo as exceções declaradas em "Fora de escopo".
2. Nenhuma tela do escopo usa cor, tipografia ou espaçamento fora de `src/view/tokens.ts`.
3. Nome e aceite dos termos no cadastro têm teste de unidade (validador), de hook e de componente.
4. O fluxo de três etapas tem teste de componente cobrindo avanço, retorno e publicação.
5. A conservação e a descrição percorrem entidade, validador, casos de uso, adaptadores de memória
   e Supabase e migração SQL validada em PGlite.
6. `npm run validate` e `npm run build:web` passam; cobertura permanece acima de 80% nas quatro
   dimensões.
