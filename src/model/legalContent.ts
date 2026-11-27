export type LegalSection = Readonly<{
  title: string;
  paragraphs: readonly string[];
}>;

export const TERMS_OF_USE: readonly LegalSection[] = [
  {
    title: "1. Finalidade da Comunidade",
    paragraphs: [
      "O IpêBook é uma plataforma comunitária voltada à circulação e reutilização de livros físicos, permitindo que leitores publiquem anúncios nas modalidades de venda, troca e doação.",
      "A atuação inicial da versão beta é focada exclusivamente na cidade de Piripiri, PI, incentivando a integração local e reduzindo barreiras de acesso à leitura.",
    ],
  },
  {
    title: "2. Requisitos de Acesso e Idade",
    paragraphs: [
      "Para cadastrar anúncios e solicitar negociações, a pessoa usuária deve manter conta pessoal única, fornecer dados verdadeiros e autodeclarar idade igual ou superior a 18 anos no cadastro.",
      "A plataforma não é destinada a crianças ou adolescentes (menores de 18 anos), conforme o art. 14 da LGPD. Contas de menores identificadas serão suspensas e seus dados excluídos.",
    ],
  },
  {
    title: "3. Responsabilidade pelos Livros e Anúncios",
    paragraphs: [
      "A pessoa anunciante declara ser titular ou legítima possuidora do livro físico anunciado e responde integralmente pela veracidade de título, autor, edição, modalidade, preço e estado de conservação.",
      "É vedado anunciar arquivos digitais, cópias não autorizadas/pirataria (Lei nº 9.610/1998 — Direitos Autorais), produtos que não sejam livros físicos ou conteúdos ilícitos e ofensivos.",
    ],
  },
  {
    title: "4. Encontros Presenciais e Segurança",
    paragraphs: [
      "O IpêBook atua apenas como mural digital gratuito para aproximar leitores. A plataforma não realiza entregas, não custodia nem intermedia pagamentos e não organiza, acompanha ou supervisiona encontros presenciais.",
      "Os pontos públicos indicados no aplicativo (como o Campus do IFPI Piripiri ou a Praça da Bandeira) são apenas sugestões comunitárias de referência, sem vigilância, convênio ou garantia de segurança pelo IpêBook. Recomenda-se combinar encontros apenas de dia, em locais movimentados e, se possível, acompanhado.",
      "Ao aceitar conversar ou se encontrar presencialmente com outra pessoa, você assume por sua conta e risco todas as decisões de deslocamento, conferência do livro, entrega e eventual pagamento, isentando o IpêBook e seus desenvolvedores de responsabilidade por qualquer ocorrência física, material, financeira ou pessoal.",
    ],
  },
  {
    title: "5. Responsabilidade das Pessoas Usuárias",
    paragraphs: [
      "Cada pessoa usuária é integral e exclusivamente responsável pelo que publica, escreve no chat, compartilha, combina, entrega, paga ou recebe, bem como por sua própria conduta e integridade nos encontros presenciais.",
      "Na máxima extensão permitida pela legislação brasileira, o IpêBook, seus criadores e colaboradores não respondem por danos físicos, materiais, morais ou financeiros, furtos, roubos, agressões, golpes, fraudes, atrasos, desistências, calote, defeitos nos livros ou quaisquer conflitos e incidentes ocorridos entre pessoas usuárias, dentro ou fora do aplicativo.",
      "Nos termos do art. 19 do Marco Civil da Internet (Lei nº 12.965/2014), o IpêBook não responde por conteúdos publicados por terceiros, salvo descumprimento de ordem judicial específica para remoção.",
      "O IpêBook não verifica identidade civil, antecedentes criminais, capacidade financeira ou intenções das pessoas usuárias. Avaliações, perfis e denúncias refletem apenas manifestações da comunidade e não constituem atestado de idoneidade ou garantia.",
      "É proibido: anunciar o que não seja livro físico próprio; usar dados de outras pessoas; enganar, assediar, ameaçar, intimidar ou discriminar; enviar propaganda ou aplicar golpes; burlar a moderação ou criar contas para isso. Quem descumprir responde pessoalmente nas esferas cível e criminal perante a lei e as pessoas prejudicadas.",
      "Se o IpêBook ou seus responsáveis forem acionados judicial ou extrajudicialmente por ato, omissão, anúncio ou encontro decorrente da sua conduta, você se compromete a assumir integralmente a defesa, a responsabilidade e o ressarcimento de eventuais prejuízos, custas e honorários, na medida permitida pela lei.",
      "O aplicativo é oferecido gratuitamente, no estado em que se encontra, sem garantias de funcionamento contínuo, e pode ser alterado, suspenso ou encerrado a qualquer momento. Se alguma cláusula destes Termos for considerada inválida, as demais permanecem plenamente válidas.",
    ],
  },
  {
    title: "6. Moderação e Suspensão",
    paragraphs: [
      "Qualquer pessoa pode denunciar anúncios ou perfis. A moderação pode, a seu critério, arquivar a denúncia, remover anúncios e suspender ou excluir contas que descumpram estes Termos, sem obrigação de analisar previamente todo conteúdo publicado. Um anúncio com três denúncias fica pausado até ser analisado.",
      "Se a sua conta ou anúncio for afetado e você discordar, escreva para ipebook738@gmail.com pedindo nova análise.",
    ],
  },
  {
    title: "7. Alterações e Legislação",
    paragraphs: [
      "Estes Termos podem ser atualizados a qualquer tempo; mudanças relevantes serão avisadas no aplicativo. Continuar usando o IpêBook depois do aviso significa aceitar a nova versão.",
      "Aplica-se a legislação brasileira, incluindo a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014), o Código Civil e o Código de Defesa do Consumidor quando cabível. Fica eleito o foro da Comarca de Piripiri, PI, ressalvado o foro do domicílio da pessoa usuária quando assegurado por lei.",
    ],
  },
];

export const LEGAL_LAST_UPDATED = "27 de novembro de 2026";

export const PRIVACY_POLICY: readonly LegalSection[] = [
  {
    title: "1. Quem trata os seus dados",
    paragraphs: [
      "O IpêBook é uma plataforma comunitária de Piripiri, PI, e atua como controlador dos dados pessoais tratados no aplicativo e na versão web (ipebook.app). Para dúvidas, solicitações ou contato direto com a pessoa Encarregada pelo Tratamento de Dados Pessoais (DPO), escreva para ipebook738@gmail.com.",
      "O tratamento segue os princípios da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), especialmente finalidade, adequação, necessidade (coleta mínima) e transparência, com base legal em: execução do serviço que você solicita ao usar o app (art. 7º, V); legítimo interesse para moderação, segurança comunitária e prevenção a fraudes ou abusos (art. 7º, IX); consentimento para notificações push e permissões opcionais do aparelho (art. 7º, I); e cumprimento de obrigação legal ou ordem judicial (art. 7º, II).",
    ],
  },
  {
    title: "2. Dados que coletamos e para quê",
    paragraphs: [
      "Conta e acesso: nome, e-mail e, caso opte por login social, o identificador da sua conta Google ou Apple (incluindo e-mail privado encaminhado pela Apple, se escolhido). Servem exclusivamente para autenticar e proteger a sua conta.",
      "Perfil e anúncios: foto de perfil (opcional), bairro escolhido manualmente em Piripiri, livros anunciados e fotos dos exemplares. Essas informações ficam visíveis à comunidade para viabilizar as trocas, vendas e doações.",
      "Negociações: propostas, mensagens do chat, encontros combinados em pontos sugeridos, confirmação de entrega e avaliações. As mensagens e encontros ficam restritos às duas pessoas da negociação (as avaliações aparecem no perfil público).",
      "Segurança e moderação: denúncias e bloqueios que você registra ou recebe, analisados pela moderação para proteger a comunidade.",
      "Avisos e armazenamento local: identificador de notificação do aparelho ou navegador (somente se você ativar avisos) e preferências de notificação. No próprio dispositivo, guardamos rascunhos, histórico local de buscas e cópia temporária para leitura sem conexão — tudo apagado ao limpar o cache em Configurações ou sair da conta.",
      "Permissões mínimas do aparelho: câmera (sem áudio/microfone, pedida apenas quando você escolhe ler ISBN/QR Code ou fotografar um livro), galeria de fotos (via seletor do sistema, apenas quando você escolhe uma imagem) e notificações (opcionais). Negar ou revogar permissões nos ajustes do celular não impede o uso da busca, do chat nem da confirmação por código manual.",
      "O que não coletamos: não coletamos localização precisa por GPS, microfone, agenda de contatos, documentos oficiais, dados bancários/de pagamento, histórico fora do app nem identificadores persistentes de hardware (IMEI, número de série ou ID de publicidade).",
    ],
  },
  {
    title: "3. Com quem os dados são compartilhados",
    paragraphs: [
      "Nenhum dado pessoal é vendido, alugado ou usado para publicidade comportamental ou rastreamento entre aplicativos.",
      "Compartilhamos dados apenas com operadores essenciais ao funcionamento do serviço: Supabase (autenticação, banco de dados e armazenamento de fotos), Expo e Google Firebase / Apple APNs (entrega de notificações push quando autorizadas) e Google/Apple (somente quando você escolhe entrar com essas contas). Alguns servidores ficam fora do Brasil (por exemplo, nos Estados Unidos); essa transferência internacional ocorre nos termos do art. 33 da LGPD, exclusivamente para executar o serviço solicitado.",
      "Podemos fornecer dados a autoridades competentes mediante ordem judicial ou obrigação legal (art. 7º, II da LGPD e Marco Civil da Internet).",
      "O seu e-mail nunca é exibido publicamente para outras pessoas da comunidade.",
    ],
  },
  {
    title: "4. Por quanto tempo guardamos",
    paragraphs: [
      "Mantemos seus dados apenas enquanto a conta estiver ativa ou enquanto necessários à finalidade informada. Ao solicitar a exclusão da conta no próprio aplicativo, apagamos de forma definitiva perfil, anúncios, fotos armazenadas, pedidos, mensagens, favoritos, alertas, avaliações, notificações e inscrições de push.",
      "Cópias de segurança automáticas do banco de dados podem reter registros excluídos por alguns dias até a rotação normal dos backups, e dados estritamente necessários poderão ser preservados somente para cumprimento de obrigação legal ou ordem judicial (art. 16, I da LGPD).",
    ],
  },
  {
    title: "5. Seus direitos",
    paragraphs: [
      "Nos termos do art. 18 da LGPD, você pode exercer a qualquer momento diretamente no aplicativo: confirmação da existência de tratamento, acesso aos seus dados, correção de informações de perfil, portabilidade em arquivo estruturado JSON (Configurações > Privacidade e dados > Exportar) e eliminação definitiva da conta.",
      "Pelo e-mail ipebook738@gmail.com (atendimento do Encarregado/DPO), você também pode solicitar: informação sobre entidades com as quais compartilhamos dados, anonimização, bloqueio ou eliminação de dados desnecessários, revogação do consentimento, oposição a tratamento irregular e revisão de decisões da moderação. Respondemos em até 15 dias (art. 19, II da LGPD).",
      "Caso entenda que seus direitos não foram atendidos, você pode peticionar à Autoridade Nacional de Proteção de Dados (ANPD), em gov.br/anpd.",
    ],
  },
  {
    title: "6. Segurança e idade",
    paragraphs: [
      "Os dados trafegam criptografados (HTTPS/TLS), o acesso no banco de dados é isolado por regras por linha (RLS) para que cada pessoa acesse apenas o que é seu ou público, não gravamos dados sensíveis em registros de diagnóstico em produção e o app utiliza identificadores reconfiguráveis por instalação.",
      "O IpêBook é destinado exclusivamente a maiores de 18 anos, conforme os Termos de Uso e o art. 14 da LGPD.",
      "Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, comunicaremos as pessoas afetadas e a ANPD em prazo razoável (art. 48 da LGPD).",
      "Esta Política pode ser atualizada para refletir melhorias no app ou exigências legais; a data da última atualização aparece no topo e alterações relevantes serão avisadas no aplicativo.",
    ],
  },
];
