import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { launchChromeCdp, startStaticServer } from "./cdp.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST_E2E = join(RAIZ, "dist-e2e");
const FALHAS_DIR = join(RAIZ, "coverage", "e2e-falhas");

function garantirBuildWebMemoria(forcarBuild) {
  if (!forcarBuild && existsSync(join(DIST_E2E, "index.html"))) {
    console.log("Usando build existente em dist-e2e/ (passe --build para regerar).");
    return;
  }

  console.log("Exportando app Web em modo memória para dist-e2e/...");
  rmSync(DIST_E2E, { recursive: true, force: true });
  const env = {
    ...process.env,
    EXPO_PUBLIC_BACKEND: "memory",
    EXPO_PUBLIC_AUTH_REDIRECT_URL: "http://127.0.0.1/auth/callback",
  };
  const res = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["expo", "export", "--platform", "web", "--output-dir", "dist-e2e"],
    { cwd: RAIZ, env, stdio: "inherit", shell: process.platform === "win32" },
  );
  if (res.status !== 0) {
    throw new Error(`Falha ao exportar build Web E2E (código ${res.status ?? "desconhecido"}).`);
  }
}

async function assertSemOverflowHorizontal(page, contexto) {
  const overflow = await page.eval(
    "document.documentElement.scrollWidth - document.documentElement.clientWidth",
  );
  if (typeof overflow === "number" && overflow > 2) {
    throw new Error(`Transbordamento horizontal de ${overflow}px em ${contexto}.`);
  }
}

async function assertContrasteBusca(page, selector) {
  const contraste = await page.eval(`(() => {
    const field = document.querySelector(${JSON.stringify(selector)}).parentElement;
    const { borderTopColor, backgroundColor } = getComputedStyle(field);
    const luminance = (color) => color.match(/\\d+/g).slice(0, 3).map(Number).reduce((sum, channel, index) => {
      const value = channel / 255;
      return sum + [0.2126, 0.7152, 0.0722][index] *
        (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    }, 0);
    const a = luminance(borderTopColor);
    const b = luminance(backgroundColor);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  })()`);
  if (contraste < 3) {
    throw new Error(`Borda do campo ${selector} em repouso com contraste de ${contraste.toFixed(2)}:1.`);
  }
}

async function marcarComEspaco(page, selector) {
  await page.waitFor(`document.querySelector(${JSON.stringify(selector)})?.getAttribute("aria-checked") === "false"`, {
    message: "controle anuncia estado inicial desmarcado",
  });
  await page.eval(`document.querySelector(${JSON.stringify(selector)}).focus()`);
  const key = { key: " ", code: "Space", windowsVirtualKeyCode: 32 };
  await page.send("Input.dispatchKeyEvent", { ...key, type: "keyDown", text: " ", unmodifiedText: " " });
  await page.send("Input.dispatchKeyEvent", { ...key, type: "keyUp" });
  await page.waitFor(`document.querySelector(${JSON.stringify(selector)})?.getAttribute("aria-checked") === "true"`, {
    message: "controle marcado com Espaço anuncia o novo estado",
  });
}

function assertSemExcecoes(page, nomeCenario) {
  if (page.exceptions.length > 0) {
    throw new Error(`Exceção JS em "${nomeCenario}": ${page.exceptions.join(" | ")}`);
  }
}

async function dispensarAvisoNotificacoesSeVisivel(page) {
  await page.waitForText("O Pequeno Príncipe", {
    timeoutMs: 15000,
    message: "chegada à Home autenticada",
  });
  await new Promise((resolve) => setTimeout(resolve, 600));
  const temAviso = await page.eval(
    "Boolean(document.body && document.body.innerText.includes('Avisos no seu celular'))",
  );
  if (temAviso) {
    await page.clickByText("Agora não", { exact: true });
    await page.waitFor(
      "!document.body.innerText.includes('Avisos no seu celular')",
      { timeoutMs: 10000, message: "fechamento do diálogo de avisos" },
    );
  }
}

async function preencherCadastro(page, { nome, email, senha }) {
  await page.waitForText("Crie sua");
  await page.fillInput('input[aria-label="Nome completo"]', nome);
  await page.fillInput('input[aria-label="E-mail"]', email);
  await page.fillInput('input[aria-label="Senha"]', senha);
  await marcarComEspaco(page, '[role="checkbox"][aria-label="Aceito os termos de uso"]');
  await page.clickByText("Criar conta", { exact: true });
  await dispensarAvisoNotificacoesSeVisivel(page);
}

async function criarContaPelaBoasVindas(page, dados) {
  await page.waitForText("Começar agora");
  await page.clickByText("Começar agora", { exact: true });
  await preencherCadastro(page, dados);
}

async function criarContaPelaTelaEntrar(page, dados) {
  await page.waitForText("Criar uma conta");
  await page.clickByText("Criar uma conta", { exact: true });
  await preencherCadastro(page, dados);
}

async function entrarPelaTelaEntrar(page, { email, senha }) {
  await page.waitForText("Sua próxima leitura");
  await page.fillInput('input[aria-label="E-mail"]', email);
  await page.fillInput('input[aria-label="Senha"]', senha);
  await page.clickByText("Entrar", { exact: true });
  await dispensarAvisoNotificacoesSeVisivel(page);
}

async function sairDaContaPeloPerfil(page) {
  await page.clickBySelector('[aria-label="Meu perfil"]');
  await page.waitForText("Minhas publicações");
  await page.clickBySelector('[aria-label="Sair da conta"]');
  await page.waitForText("Sair da conta?");
  await page.clickByText("Sair", { exact: true });
  await page.waitForText("Sua próxima leitura", {
    timeoutMs: 15000,
    message: "retorno para a tela de entrada após sair",
  });
}

async function publicarLivroDoacao(page, { titulo, autor }) {
  await page.clickBySelector('[aria-label="Anunciar um livro"]');
  await page.fillInput('input[aria-label="Título"]', titulo);
  await page.fillInput('input[aria-label="Autor"]', autor);
  await page.clickBySelector('[aria-label="Modalidade Doação"]');
  await page.waitForText("Gratuito", { message: "prévia atualizada para Doação antes de avançar" });
  await page.clickByText("Continuar", { exact: true });

  await page.waitForText("Mostre seu livro.");
  await page.clickByText("Usar estas fotos", { exact: true });

  await page.waitForText("Conservação");
  await page.clickBySelector('[aria-label^="Conservação "]');
  await page.clickBySelector('[aria-label^="Categoria "]');
  await page.clickBySelector('[aria-label^="Local de retirada "]');
  await page.clickByText("Publicar anúncio", { exact: true });

  await page.waitForText("Publicado com sucesso", { timeoutMs: 15000 });
}

const CENARIOS = [
  {
    nome: "1. Boas-vindas, catálogo público (Desktop/Mobile), busca e detalhe",
    async executar(page, baseUrl) {
      await page.setViewport(1440, 900, false);
      await page.goto(baseUrl);
      await page.waitForText("Começar agora");
      await assertSemOverflowHorizontal(page, "Boas-vindas Desktop 1440x900");
      await page.clickByText("Explorar livros", { exact: true });
      await page.waitForText("O Pequeno Príncipe");
      await assertSemOverflowHorizontal(page, "Pesquisa Desktop 1440x900");

      await page.setViewport(390, 844, true);
      await page.goto(baseUrl);
      await page.waitForText("Começar");
      await assertSemOverflowHorizontal(page, "Boas-vindas Mobile 390x844");

      await page.clickByText("Explorar livros", { exact: true });
      await page.waitForText("O Pequeno Príncipe");
      await assertSemOverflowHorizontal(page, "Pesquisa Mobile 390x844");
      await marcarComEspaco(page, '[role="checkbox"][aria-label="Filtrar por Troca"]');

      await page.setViewport(320, 844, true);
      await page.waitFor(
        `(() => {
          const field = document.querySelector('input[aria-label="Buscar livros"]');
          const canvas = document.createElement('canvas').getContext('2d');
          if (!field || !field.placeholder || !canvas) return false;
          const style = getComputedStyle(field);
          canvas.font = style.fontSize + ' ' + style.fontFamily;
          const textWidth = canvas.measureText(field.placeholder).width;
          return textWidth <= field.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        })()`,
        { message: "orientação de busca cabe no campo a 320 px" },
      );
      await assertSemOverflowHorizontal(page, "Pesquisa Mobile 320x844");
      await assertContrasteBusca(page, 'input[aria-label="Buscar livros"]');

      await page.setViewport(1440, 900, false);
      await page.goto(`${baseUrl}/pesquisa`);
      await page.waitFor('Boolean(document.querySelector("input"))', {
        message: "campo de busca em /pesquisa",
      });
      await assertSemOverflowHorizontal(page, "Pesquisa Desktop 1440x900");

      await page.fillInput("input", "Dom Casmurro");
      await page.waitForText("Dom Casmurro");
      await page.clickByText("Dom Casmurro");
      await page.waitForText("Machado de Assis");
      await page.waitForText("Propor troca");
    },
  },
  {
    nome: "2. Cadastro, edição de perfil e limpeza de histórico em configurações",
    async executar(page) {
      await page.setViewport(1440, 900, false);
      await criarContaPelaBoasVindas(page, {
        nome: "Leitor E2E",
        email: "leitor.e2e@ipebook.app",
        senha: "SenhaForte123!",
      });
      await assertSemOverflowHorizontal(page, "Home Desktop autenticada");
      await assertContrasteBusca(page, '[data-testid="web-header-search"] input');
      await page.eval(`document.querySelector('[aria-label="IpêBook, ir para o início"]').focus()`);
      const tab = { key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 };
      await page.send("Input.dispatchKeyEvent", { ...tab, type: "keyDown" });
      await page.send("Input.dispatchKeyEvent", { ...tab, type: "keyUp" });
      await page.waitFor(`(() => {
        const input = document.querySelector('input[aria-label="Buscar título, autor ou categoria"]');
        if (!input?.matches(':focus-visible')) return false;
        const field = getComputedStyle(input.parentElement);
        const text = getComputedStyle(input);
        return parseFloat(field.outlineWidth) >= 2 && field.outlineStyle === "solid" &&
          parseFloat(field.borderTopLeftRadius) >= input.parentElement.clientHeight / 2 &&
          text.outlineStyle === "none" && text.boxShadow === "none";
      })()`, { message: "o foco pelo teclado contorna a busca arredondada do cabeçalho" });

      await page.clickBySelector('[aria-label="Meu perfil"]');
      await page.waitForText("Leitor E2E");

      await page.clickBySelector('[aria-label="Editar perfil"]');
      await page.waitForText("Nome público");
      await page.waitFor(
        'Boolean(document.querySelector(\'input[aria-label="Nome público"]\')?.value === "Leitor E2E")',
        { message: "carregamento do nome atual no campo" },
      );
      await page.fillInput('input[aria-label="Nome público"]', "Leitor Atualizado E2E");
      await page.clickByText("Salvar alterações", { exact: true });
      await page.waitForText("Leitor Atualizado E2E", { timeoutMs: 10000 });

      await page.clickBySelector('[aria-label="Voltar"]');
      await page.clickBySelector('[aria-label="Abrir configurações"]');
      await page.waitForText("Armazenamento e histórico");
      await page.clickBySelector('[aria-label="Ir para Armazenamento e histórico"]');
      await page.clickBySelector('[aria-label="Apagar histórico de buscas deste aparelho"]');
      await page.waitForText("Apagar histórico de buscas?");
      await page.clickByText("Apagar histórico", { exact: true });
      await page.waitForText("Histórico de buscas apagado.", { timeoutMs: 10000 });

      const logotipo = '[aria-label="IpêBook, ir para o início"]';
      await page.waitFor(
        `document.querySelector(${JSON.stringify(logotipo)})?.matches('a[href="/"]')`,
        { message: "logotipo é um link HTML para o início" },
      );
      await page.eval(`document.querySelector(${JSON.stringify(logotipo)}).focus()`);
      await page.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
      await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
      await page.waitFor("location.pathname === '/'");

      await page.setViewport(320, 844, true);
      await page.waitFor(
        `(() => {
          const main = document.querySelector('main, [role="main"]');
          if (!main || document.querySelectorAll('main, [role="main"]').length !== 1) return false;
          const title = [...main.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')].find(el => el.textContent === 'Perto de você');
          const place = [...main.querySelectorAll('div, span')].find(el => el.childElementCount === 0 && el.textContent === 'Praça da Bandeira');
          return [title, place].every(el => el && el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1);
        })()`,
        { message: "marco principal, título e local legíveis na página inicial a 320 px" },
      );
      await assertSemOverflowHorizontal(page, "Home Mobile 320x844");
      await page.setViewport(1440, 900, false);

      await sairDaContaPeloPerfil(page);
      const destino = "/perfil/configuracoes?origem=auditoria";
      // A rota é aberta na mesma aba para conservar a conta do backend em memória.
      await page.eval(`history.pushState(null, '', ${JSON.stringify(destino)}); dispatchEvent(new PopStateEvent('popstate'));`);
      await page.waitFor(
        `location.pathname === '/entrar' && new URLSearchParams(location.search).get('returnTo') === ${JSON.stringify(destino)}`,
        { message: "login preserva caminho e consulta do link protegido" },
      );
      await page.fillInput('input[aria-label="E-mail"]', "leitor.e2e@ipebook.app");
      await page.fillInput('input[aria-label="Senha"]', "SenhaForte123!");
      await page.clickBySelector('[role="button"][aria-label="Entrar"]');
      await page.waitFor(
        `location.pathname + location.search === ${JSON.stringify(destino)}`,
        { message: "login retorna às configurações solicitadas" },
      );
      await page.waitForText("Armazenamento e histórico");
    },
  },
  {
    nome: "3. Publicação em 3 etapas, pausa/retomada, edição e exclusão na Estante",
    async executar(page) {
      await page.setViewport(1440, 900, false);
      await criarContaPelaBoasVindas(page, {
        nome: "Anunciante E2E",
        email: "anunciante.e2e@ipebook.app",
        senha: "SenhaForte123!",
      });

      await publicarLivroDoacao(page, {
        titulo: "Memórias Póstumas de Brás Cubas",
        autor: "Machado de Assis",
      });

      await page.clickByText("Ver estante", { exact: true });
      await page.waitForText("Memórias Póstumas de Brás Cubas");

      await page.clickBySelector('[aria-label="Gerenciar anúncio de Memórias Póstumas de Brás Cubas"]');
      await page.waitForText("Gerenciar anúncio");
      await page.waitFor(`(() => {
        const actions = ["Editar anúncio", "Ver anúncio como leitor", "Pausar anúncio", "Excluir anúncio", "Segurança em Piripiri"];
        return actions.every(label => {
          const button = document.querySelector('[aria-label="' + label + '"]');
          return button && button.getBoundingClientRect().bottom <= innerHeight;
        });
      })()`, { message: "ações de gerenciamento visíveis no desktop" });
      await page.clickBySelector('[aria-label="Segurança em Piripiri"]');
      await page.waitFor(`(() => {
        const contacts = ["tel:190", "tel:197", "https://portal.pi.gov.br/pc/delegacias-do-interior/"];
        return contacts.every(href => {
          const link = document.querySelector('a[href="' + href + '"]');
          return link && link.getBoundingClientRect().bottom <= innerHeight;
        });
      })()`, { message: "contatos de segurança visíveis no modal" });
      await page.clickBySelector('[aria-label="Fechar"]');
      await assertSemOverflowHorizontal(page, "Gerenciar anúncio no desktop");

      await page.setViewport(320, 844, true);
      await page.waitFor(`(() => {
        const share = document.querySelector('[aria-label="Compartilhar anúncio"]');
        const removal = document.querySelector('[aria-label="Excluir anúncio"]');
        return Boolean(innerWidth === 320 && share && removal
          && removal.getBoundingClientRect().bottom <= share.getBoundingClientRect().top);
      })()`, { message: "seções de gerenciamento empilhadas sem sobreposição a 320 px" });
      await assertSemOverflowHorizontal(page, "Gerenciar anúncio a 320 px");

      await page.setViewport(1440, 900, false);
      await page.waitFor(`(() => {
        const share = document.querySelector('[aria-label="Compartilhar anúncio"]');
        const pause = document.querySelector('[aria-label="Pausar anúncio"]');
        return Boolean(innerWidth === 1440 && share && pause);
      })()`, { message: "controles de gerenciamento visíveis após voltar ao desktop" });

      await page.clickBySelector('[aria-label="Pausar anúncio"]');
      await page.waitForText("Retomar anúncio");
      // Aguarda a janela de proteção contra duplo toque (useGuardedPress) do mesmo FilledButton.
      await new Promise((resolve) => setTimeout(resolve, 750));
      await page.clickBySelector('[aria-label="Retomar anúncio"]');
      await page.waitForText("Pausar anúncio");

      await page.clickBySelector('[aria-label="Editar anúncio"]');
      await page.waitForText("Título do livro");
      await page.fillInput('input[aria-label="Título do livro"]', "Memórias Póstumas (Edição E2E)");
      await page.clickByText("Salvar alterações", { exact: true });
      await page.waitForText("Memórias Póstumas (Edição E2E)", { timeoutMs: 10000 });

      await page.clickBySelector('[aria-label="Excluir anúncio"]');
      await page.waitForText("Excluir", { timeoutMs: 10000 });
      await page.clickByText("Excluir", { exact: true });

      await page.waitFor(
        "!document.body.innerText.includes('Memórias Póstumas (Edição E2E)')",
        { timeoutMs: 10000, message: "anúncio removido da Estante" },
      );
    },
  },
  {
    nome: "4. Favoritar livro no detalhe, conferir em Favoritos e remover",
    async executar(page) {
      await page.setViewport(1440, 900, false);
      await criarContaPelaBoasVindas(page, {
        nome: "Colecionador E2E",
        email: "colecionador.e2e@ipebook.app",
        senha: "SenhaForte123!",
      });

      await page.clickByText("O Pequeno Príncipe");
      await page.waitForText("Antoine de Saint-Exupéry");
      await page.clickBySelector('[aria-label="Adicionar aos favoritos"]');
      await page.waitFor(
        'Boolean(document.querySelector(\'[aria-label="Remover dos favoritos"]\'))',
        { message: "botão atualizado para Remover dos favoritos" },
      );

      await page.clickBySelector('[aria-label="Meu perfil"]');
      await page.waitForText("Favoritos e alertas");
      await page.clickByText("Favoritos e alertas");
      await page.waitForText("O Pequeno Príncipe");

      await page.clickBySelector('[aria-label="Remover O Pequeno Príncipe dos favoritos"]');
      await page.waitForText("Nenhum livro salvo", { timeoutMs: 10000 });
    },
  },
  {
    nome: "5. Enviar pedido de livro e cancelar em Conversas",
    async executar(page) {
      await page.setViewport(1440, 900, false);
      await criarContaPelaBoasVindas(page, {
        nome: "Solicitante E2E",
        email: "solicitante.e2e@ipebook.app",
        senha: "SenhaForte123!",
      });

      await page.clickByText("O Pequeno Príncipe");
      await page.waitForText("Antoine de Saint-Exupéry");
      await page.clickByText("Tenho interesse", { exact: true });
      await page.waitForText("Confirmar interesse");
      await page.clickByText("Confirmar interesse", { exact: true });

      await page.waitFor(
        'Boolean(document.querySelector(\'[aria-label^="Negociação solicitada"]\')) || document.body.innerText.includes("Pedido enviado")',
        { timeoutMs: 15000, message: "confirmação do pedido enviado" },
      );

      await page.clickBySelector('[aria-label^="Conversas"]');
      await page.waitForText("O Pequeno Príncipe");

      await page.clickBySelector('[aria-label="Cancelar pedido de O Pequeno Príncipe"]');
      await page.waitForText("Cancelar pedido?");
      await page.clickByText("Sim, cancelar", { exact: true });
      await page.waitFor(
        "!document.body.innerText.includes('Solicitação aguardando o anunciante')",
        { timeoutMs: 10000, message: "remoção da solicitação cancelada" },
      );
    },
  },
  {
    nome: "6. Ciclo completo entre 2 contas: anúncio, pedido, aceite, chat, encontro, entrega e avaliação",
    async executar(page) {
      await page.setViewport(1440, 900, false);
      const contaA = {
        nome: "Vendedora E2E",
        email: "vendedora.ciclo@ipebook.app",
        senha: "SenhaForte123!",
      };
      const contaB = {
        nome: "Comprador E2E",
        email: "comprador.ciclo@ipebook.app",
        senha: "SenhaForte123!",
      };
      const tituloLivro = "Grande Sertão: Veredas";

      // 1) Conta A publica e sai
      await criarContaPelaBoasVindas(page, contaA);
      await publicarLivroDoacao(page, {
        titulo: tituloLivro,
        autor: "Guimarães Rosa",
      });
      await page.clickByText("Ver estante", { exact: true });
      await page.waitForText(tituloLivro);
      await sairDaContaPeloPerfil(page);

      // 2) Conta B cria conta, solicita o livro (Doação -> "Quero receber") e sai
      await criarContaPelaTelaEntrar(page, contaB);
      await page.clickByText(tituloLivro);
      await page.waitForText("Guimarães Rosa");
      await page.clickByText("Quero receber", { exact: true });
      await page.waitForText("Confirmar interesse");
      await page.clickByText("Confirmar interesse", { exact: true });
      await page.waitFor(
        'Boolean(document.querySelector(\'[aria-label^="Negociação solicitada"]\')) || document.body.innerText.includes("Pedido enviado")',
        { timeoutMs: 15000, message: "solicitação registrada pela Conta B" },
      );
      await sairDaContaPeloPerfil(page);

      // 3) Conta A entra, aceita pedido, envia mensagem no chat e convida encontro
      await entrarPelaTelaEntrar(page, contaA);
      await page.clickBySelector('[aria-label="Estante"]');
      await page.waitForText("Ver proposta");
      await page.clickByText("Ver proposta", { exact: true });
      await page.waitForText("Aceitar");
      await page.clickByText("Aceitar", { exact: true });
      await page.waitForText("Aceitar este pedido?");
      await page.clickByText("Aceitar pedido", { exact: true });
      await page.waitForText("Ver detalhes do encontro", { timeoutMs: 10000 });

      await page.clickBySelector('[aria-label^="Conversar com"]');
      await page.fillInput('[aria-label="Campo de mensagem"]', "Oi, combinamos a entrega hoje?");
      await page.clickBySelector('[aria-label="Enviar mensagem"]');
      await page.waitForText("Oi, combinamos a entrega hoje?");
      for (const message of ["Posso levar o livro pela manhã.", "Vou mandar o ponto de encontro."]) {
        await page.fillInput('[aria-label="Campo de mensagem"]', message);
        await page.clickBySelector('[aria-label="Enviar mensagem"]');
        await page.waitForText(message);
      }

      await page.clickBySelector('[aria-label="Combinar encontro na negociação"]');
      await page.clickBySelector('[role="radio"][aria-label*="Praça da Bandeira"]');
      await page.clickBySelector('[role="radio"][aria-label^="Dia "]');
      await page.clickBySelector('[role="radio"][aria-label="Horário 10h"]');
      await page.clickByText("Enviar convite", { exact: true });
      await page.waitForText("Encontro sugerido em", { timeoutMs: 15000 });
      await sairDaContaPeloPerfil(page);

      // 4) Conta B revisa o aviso no celular e confirma no chat embutido em tela larga
      await entrarPelaTelaEntrar(page, contaB);
      await page.clickBySelector('[aria-label^="Abrir notificações"]');
      await page.waitForText("Revisar proposta");
      await page.setViewport(390, 844, true);
      // O filtro já existe na versão larga. Espere o cabeçalho móvel substituir o anterior.
      await page.waitFor(`document.documentElement.clientWidth === 390 &&
        !document.querySelector('[data-testid="web-header"]') &&
        Boolean(document.querySelector('main [aria-label="Notificações"][role="heading"]'))`,
      { message: "layout móvel de Notificações a 390 px" });
      await page.waitForText("Não lidas");
      await assertSemOverflowHorizontal(page, "Notificações no celular");
      await page.clickByText("Revisar proposta", { exact: true });
      await page.waitFor("location.pathname.startsWith('/conversa/')");
      await page.waitForText("Encontro sugerido por");
      await page.waitFor(`(() => {
        const header = document.querySelector('[data-testid="conversation-chat-compact-header"]');
        const button = header?.querySelector(${JSON.stringify(`[aria-label="Detalhes da negociação de ${tituloLivro}"]`)});
        const box = button?.getBoundingClientRect();
        const name = header?.querySelector('[role="heading"]')?.getBoundingClientRect();
        const modality = Array.from(header?.querySelectorAll('*') ?? []).find((node) =>
          node.childElementCount === 0 && node.textContent.trim() === '· Doação');
        return Boolean(box && name && box.left >= name.right && box.right <= innerWidth && box.height >= 44 &&
          button.textContent.includes('Detalhes') && header.textContent.includes(${JSON.stringify(tituloLivro)}) &&
          modality && modality.getBoundingClientRect().height <= parseFloat(getComputedStyle(modality).lineHeight) + 1);
      })()`, { message: "botão Detalhes visível à direita do nome no cabeçalho móvel" });
      await page.waitFor(`Boolean(document.querySelector('[aria-label="Campo de mensagem"]')?.getBoundingClientRect().width)`);
      await assertSemOverflowHorizontal(page, "Chat no celular");
      await page.setViewport(1440, 900, false);
      await page.clickBySelector('[aria-label^="Conversas"]');
      const conversationSelector = JSON.stringify(`[aria-label*="sobre ${tituloLivro}"]`);
      await page.waitFor(`Boolean(document.querySelector(${conversationSelector}))`);
      const tab = { key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 };
      await page.send("Input.dispatchKeyEvent", { ...tab, type: "keyDown" });
      await page.send("Input.dispatchKeyEvent", { ...tab, type: "keyUp" });
      await page.eval(`document.querySelector(${conversationSelector}).focus()`);
      await page.waitFor(`(() => {
        const row = document.querySelector(${conversationSelector});
        return row.matches(":focus-visible") && parseFloat(getComputedStyle(row).outlineWidth) > 0;
      })()`, { message: "a lista mostra foco de teclado na conversa" });
      const enter = { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 };
      await page.send("Input.dispatchKeyEvent", { ...enter, type: "keyDown", text: "\r", unmodifiedText: "\r" });
      await page.send("Input.dispatchKeyEvent", { ...enter, type: "keyUp" });
      await page.waitForText("Oi, combinamos a entrega hoje?");
      await page.waitForText("Confirmar encontro");
      await page.waitFor(`(() => {
        const bottoms = ["list", "chat"].map((pane) =>
          document.querySelector('[data-testid="conversation-' + pane + '-header"]')?.getBoundingClientRect().bottom
        );
        return bottoms.every(Number.isFinite) && Math.max(...bottoms) - Math.min(...bottoms) <= 1;
      })()`, { message: "divisórias dos cabeçalhos da lista e do chat alinhadas" });
      await page.waitFor(`(() => {
        const list = document.querySelector('[data-testid="conversation-list-footer"]')?.getBoundingClientRect();
        const chat = document.querySelector('[data-testid="conversation-chat-footer"]')?.getBoundingClientRect();
        return Boolean(list && chat && Math.abs(list.top - chat.top) <= 1);
      })()`, { message: "divisórias dos rodapés da lista e do chat alinhadas" });
      const bookTrigger = JSON.stringify(`[aria-label="Detalhes de ${tituloLivro}"]`);
      const aboutPanel = '[data-testid="conversation-about-container"]';
      await page.waitFor(`!document.querySelector(${JSON.stringify(aboutPanel)})`);
      await page.eval(`document.querySelector(${bookTrigger}).focus()`);
      await page.send("Input.dispatchKeyEvent", { ...enter, type: "keyDown", text: "\r", unmodifiedText: "\r" });
      await page.send("Input.dispatchKeyEvent", { ...enter, type: "keyUp" });
      await page.waitFor(`(() => {
        const panel = document.querySelector(${JSON.stringify(aboutPanel)});
        const bounds = panel?.getBoundingClientRect();
        return Boolean(bounds && Math.abs(bounds.right - innerWidth) <= 1 && bounds.width <= 400 &&
          panel.contains(document.activeElement));
      })()`, {
        message: "detalhes do livro em painel lateral com foco dentro",
      });
      const escapeKey = { key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 };
      await page.send("Input.dispatchKeyEvent", { ...escapeKey, type: "keyDown" });
      await page.send("Input.dispatchKeyEvent", { ...escapeKey, type: "keyUp" });
      await page.waitFor(`!document.querySelector(${JSON.stringify(aboutPanel)}) && document.activeElement === document.querySelector(${bookTrigger})`, {
        message: "Escape fecha o painel e devolve o foco ao título do livro",
      });
      const historyTop = await page.eval(`document.querySelector('[data-testid="conversation-chat-history"]').getBoundingClientRect().top`);
      await page.clickBySelector('[aria-label="Opções da conversa"]');
      await page.waitFor(`(() => {
        const button = document.querySelector('[aria-label="Apagar conversa"]');
        const rect = button?.getBoundingClientRect();
        const history = document.querySelector('[data-testid="conversation-chat-history"]');
        const input = document.querySelector('[aria-label="Campo de mensagem"]')?.getBoundingClientRect();
        const send = document.querySelector('[aria-label="Enviar mensagem"]')?.getBoundingClientRect();
        return Boolean(rect && button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)) &&
          Math.abs(history.getBoundingClientRect().top - ${historyTop}) <= 1 && input && send && send.right - input.left <= 817);
      })()`, { message: "menu da conversa sobrepõe o chat sem deslocá-lo e a composição limita a largura" });
      await page.send("Input.dispatchKeyEvent", { ...escapeKey, type: "keyDown" });
      await page.send("Input.dispatchKeyEvent", { ...escapeKey, type: "keyUp" });
      await page.waitFor(`!document.querySelector('[aria-label="Apagar conversa"]') && document.activeElement?.getAttribute('aria-label') === 'Opções da conversa'`, {
        message: "Escape fecha o menu da conversa e devolve o foco",
      });
      await page.clickByText("Confirmar encontro", { exact: true });
      await page.waitForText("Confirmar entrega", { timeoutMs: 15000 });
      const confirmedHistoryTop = await page.eval(`document.querySelector('[data-testid="conversation-chat-history"]').getBoundingClientRect().top`);
      await page.waitFor('!document.querySelector(\'[aria-label="Como chegar"]\')');
      await page.clickBySelector('[aria-label="Mais opções do encontro"]');
      await page.waitFor('Boolean(document.querySelector(\'[aria-label="Como chegar"]\') && document.querySelector(\'[aria-label="Adicionar à agenda"]\') && document.querySelector(\'[aria-label="Reagendar encontro"]\'))');
      await page.waitFor(`Math.abs(document.querySelector('[data-testid="conversation-chat-history"]').getBoundingClientRect().top - ${confirmedHistoryTop}) <= 1`, {
        message: "menu do encontro mantém a altura disponível para o histórico",
      });
      await page.clickBySelector('[aria-label="Campo de mensagem"]');
      await page.waitFor('!document.querySelector(\'[aria-label="Como chegar"]\')');
      await page.setViewport(1440, 600, false);
      await page.waitFor(`(() => {
        const history = document.querySelector('[data-testid="conversation-chat-history"]');
        const bounds = history?.getBoundingClientRect();
        const event = Array.from(history?.querySelectorAll('*') ?? []).find((node) =>
          node.childElementCount === 0 && node.textContent.startsWith('Encontro confirmado em'))?.getBoundingClientRect();
        const composer = document.querySelector('[data-testid="conversation-chat-footer"]')?.getBoundingClientRect();
        return Boolean(bounds && bounds.height >= 180 && history.scrollTop > 0 && event && event.top >= bounds.top - 1 &&
          event.bottom <= bounds.bottom + 1 && composer && composer.bottom <= innerHeight);
      })()`, { message: "aviso mais recente inteiro e campo de mensagem visível em janela baixa" });
      await page.setViewport(1024, 768, false);
      await page.waitFor(`(() => {
        const action = document.querySelector('[aria-label="Entrega do livro"]')?.getBoundingClientRect();
        const pane = document.querySelector('[data-testid="conversation-pane"]')?.getBoundingClientRect();
        return Boolean(action && pane && action.width > 0 && action.left >= pane.left && action.right <= pane.right);
      })()`, { message: "ação do encontro cabe no painel em janela estreita" });
      await assertSemOverflowHorizontal(page, "Conversas em janela estreita");
      await page.setViewport(1440, 900, false);
      await page.clickBySelector('[aria-label^="Abrir notificações"]');
      await page.waitForText("Ver encontro");
      await assertSemOverflowHorizontal(page, "Notificações em tela larga");
      await sairDaContaPeloPerfil(page);

      // 5) Conta A gera o código de entrega de 8 caracteres
      await entrarPelaTelaEntrar(page, contaA);
      await page.clickBySelector('[aria-label="Estante"]');
      await page.clickBySelector('[aria-label^="Propostas"]');
      await page.clickBySelector(`[aria-label="Abrir proposta para ${tituloLivro}"]`);
      await page.waitForText("Confirmar entrega");
      await page.clickBySelector('[aria-label="Entrega do livro"]');
      await page.waitForText("Mostre este QR para quem recebe o livro");
      const codigoAria = await page.waitFor(
        'document.querySelector(\'[aria-label^="Código "]\')?.getAttribute("aria-label") || ""',
        { timeoutMs: 10000, message: "código de entrega gerado" },
      );
      const codigoEntrega = String(codigoAria).replace(/^Código\s+/, "").replace(/\s+/g, "");
      if (codigoEntrega.length !== 8) {
        throw new Error(`Código de entrega inesperado: ${JSON.stringify(codigoAria)}`);
      }
      await sairDaContaPeloPerfil(page);

      // 6) Conta B confirma entrega pelo código e envia avaliação 5 estrelas
      await entrarPelaTelaEntrar(page, contaB);
      await page.clickBySelector('[aria-label^="Conversas"]');
      await page.clickBySelector(`[aria-label*="sobre ${tituloLivro}"]`);
      await page.waitForText("Confirmar entrega");
      await page.clickBySelector('[aria-label="Entrega do livro"]');
      await page.waitForText("Confirmar recebimento");
      await page.fillInput('input[aria-label="Código da entrega"]', codigoEntrega);
      await page.clickByText("Confirmar entrega", { exact: true });
      await page.waitForText("Entrega concluída!", { timeoutMs: 15000 });

      await page.clickByText("Avaliar negociação", { exact: true });
      await page.clickBySelector('[aria-label="5 estrelas"]');
      await page.clickBySelector('[aria-label="Confirmar e enviar avaliação"]');
      await page.waitForText("Avaliação já enviada", { timeoutMs: 15000 });
    },
  },
  {
    nome: "7. Resiliência offline/online e banner de conexão",
    async executar(page) {
      await page.setViewport(1440, 900, false);
      await criarContaPelaBoasVindas(page, {
        nome: "Offline E2E",
        email: "offline.e2e@ipebook.app",
        senha: "SenhaForte123!",
      });

      await page.setOnline(false);
      await page.waitForText("Sem conexão com a internet", {
        timeoutMs: 10000,
        message: "exibição do banner offline",
      });

      await page.setOnline(true);
      await page.waitFor(
        "!document.body.innerText.includes('Sem conexão com a internet')",
        { timeoutMs: 10000, message: "ocultação do banner ao reconectar" },
      );
    },
  },
  {
    nome: "8. Leitura de Termos e Privacidade só com teclado",
    async executar(page, baseUrl) {
      await page.setViewport(320, 844, true);
      await page.goto(`${baseUrl}/termos`);
      await page.waitForText("Finalidade da Comunidade");
      const pressKey = async (key, windowsVirtualKeyCode, shift = false) => {
        const input = { key, code: key === " " ? "Space" : key, windowsVirtualKeyCode, modifiers: shift ? 8 : 0 };
        await page.send("Input.dispatchKeyEvent", { ...input, type: "keyDown" });
        await page.send("Input.dispatchKeyEvent", { ...input, type: "keyUp" });
      };
      const checkTab = (position) => page.waitFor(`(() => {
        const tabs = [...document.querySelectorAll('[data-testid="terms-privacy-tablist"] [role="tab"]')];
        const selected = tabs[${position}];
        const other = tabs[${1 - position}];
        const panel = document.getElementById(selected?.getAttribute('aria-controls'));
        const hiddenPanel = document.getElementById(other?.getAttribute('aria-controls'));
        return document.activeElement === selected && selected.matches(':focus-visible') &&
          selected.tabIndex === 0 && selected.getAttribute('aria-selected') === 'true' &&
          other.tabIndex === -1 && other.getAttribute('aria-selected') === 'false' &&
          panel?.getAttribute('role') === 'tabpanel' && panel.getAttribute('aria-labelledby') === selected.id &&
          getComputedStyle(panel).display !== 'none' && hiddenPanel &&
          getComputedStyle(hiddenPanel).display === 'none';
      })()`, { message: `foco, seleção e painel da aba ${position + 1}` });

      await pressKey("Tab", 9);
      await pressKey("Tab", 9);
      await checkTab(0);
      await pressKey("ArrowRight", 39);
      await checkTab(1);
      await page.waitForText("Portabilidade e Exclusão");
      await pressKey("Tab", 9);
      await page.waitFor("document.activeElement?.getAttribute('role') === 'tabpanel'", {
        message: "Tab sai da lista de abas e entra no painel ativo",
      });
      await pressKey("Tab", 9, true);
      await checkTab(1);
      await pressKey("Home", 36);
      await checkTab(0);
      await pressKey("End", 35);
      await checkTab(1);
      await pressKey("Home", 36);
      await checkTab(0);
      await pressKey("ArrowLeft", 37);
      await checkTab(1);
      await pressKey(" ", 32);
      await checkTab(1);
      await pressKey("Enter", 13);
      await checkTab(1);
      await assertSemOverflowHorizontal(page, "Termos e privacidade a 320 px");

      await page.goto(`${baseUrl}/termos?aba=privacidade`);
      await page.waitForText("Portabilidade e Exclusão");
      await pressKey("Tab", 9);
      await pressKey("Tab", 9);
      await checkTab(1);
    },
  },
];

async function main() {
  const args = new Set(process.argv.slice(2));
  garantirBuildWebMemoria(args.has("--build"));

  const server = await startStaticServer(DIST_E2E);
  const page = await launchChromeCdp();
  let falhas = 0;

  try {
    console.log(`Servidor E2E ativo em ${server.baseUrl}\n`);

    for (let i = 0; i < CENARIOS.length; i += 1) {
      const cenario = CENARIOS[i];
      const inicio = Date.now();
      page.clearErrors();

      try {
        await page.resetAppState(server.baseUrl);
        await page.setOnline(true);
        await cenario.executar(page, server.baseUrl);
        assertSemExcecoes(page, cenario.nome);
        const duracao = Date.now() - inicio;
        console.log(`PASSOU (${duracao}ms) — ${cenario.nome}`);
      } catch (erro) {
        falhas += 1;
        mkdirSync(FALHAS_DIR, { recursive: true });
        const captura = join(FALHAS_DIR, `cenario-${i + 1}.png`);
        try {
          await page.screenshot(captura);
        } catch {
          // ignora erro secundário ao capturar screenshot
        }
        console.error(`FALHOU — ${cenario.nome}`);
        console.error(`  Motivo: ${erro instanceof Error ? erro.message : String(erro)}`);
        if (page.consoleErrors.length > 0) {
          console.error(`  Console errors: ${page.consoleErrors.join(" | ")}`);
        }
        console.error(`  Screenshot: ${captura}`);
      }
    }

    console.log(`\nResumo E2E: ${CENARIOS.length - falhas}/${CENARIOS.length} cenários aprovados.`);
    if (falhas > 0) {
      process.exitCode = 1;
    }
  } finally {
    await page.close();
    await server.close();
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
