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
      "Para cadastrar anúncios e solicitar negociações, a pessoa usuária deve possuir conta cadastrada e autodeclarar idade igual ou superior a 18 anos.",
      "A plataforma não é destinada a menores de 18 anos. Contas de menores identificadas podem ser suspensas e seus dados excluídos.",
    ],
  },
  {
    title: "3. Responsabilidade pelos Livros e Anúncios",
    paragraphs: [
      "A pessoa anunciante é a única responsável pela veracidade das informações fornecidas sobre o livro (título, autor, modalidade, preço e estado de conservação).",
      "É estritamente vedada a publicação de anúncios com conteúdo ilícito, ofensivo ou que viole direitos autorais.",
    ],
  },
  {
    title: "4. Encontros Presenciais e Segurança",
    paragraphs: [
      "O IpêBook não realiza a entrega física de mercadorias nem intermedia pagamentos financeiros de forma custodiada. A entrega e eventuais pagamentos são combinados diretamente entre as partes.",
      "Recomenda-se enfaticamente que os encontros presenciais sejam agendados durante o dia em locais públicos e movimentados de Piripiri (como o Campus do IFPI Piripiri ou a Praça da Bandeira).",
      "O IpêBook não é parte das negociações e não garante a qualidade, a existência ou a entrega dos livros anunciados, nem o pagamento combinado entre as pessoas.",
    ],
  },
  {
    title: "5. Moderação e Suspensão",
    paragraphs: [
      "Qualquer pessoa pode denunciar anúncios ou perfis. A moderação pode arquivar a denúncia, remover anúncios e suspender contas que descumpram estes Termos. Um anúncio com três denúncias fica pausado até ser analisado.",
      "Se a sua conta ou anúncio for afetado e você discordar, escreva para ipebook738@gmail.com pedindo nova análise.",
    ],
  },
  {
    title: "6. Alterações e Legislação",
    paragraphs: [
      "Estes Termos podem ser atualizados; mudanças relevantes serão avisadas no aplicativo. Continuar usando o IpêBook depois do aviso significa aceitar a nova versão.",
      "Aplica-se a legislação brasileira, inclusive o Código de Defesa do Consumidor quando cabível. Fica eleito o foro do domicílio da pessoa usuária.",
    ],
  },
];

export const LEGAL_LAST_UPDATED = "29 de outubro de 2026";

export const PRIVACY_POLICY: readonly LegalSection[] = [
  {
    title: "1. Quem trata os seus dados",
    paragraphs: [
      "O IpêBook é um projeto comunitário de Piripiri, PI. Dúvidas, pedidos sobre os seus dados e contato com a pessoa encarregada: ipebook738@gmail.com.",
      "O tratamento segue a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), com base na execução do serviço que você pede ao criar a conta (art. 7º, V), no legítimo interesse de manter a comunidade segura e corrigir falhas (art. 7º, IX) e no seu consentimento para receber notificações, que pode ser retirado a qualquer momento nas configurações do aparelho ou do app (art. 7º, I).",
    ],
  },
  {
    title: "2. Dados que coletamos e para quê",
    paragraphs: [
      "Conta: nome, e-mail e, se você entrar com Google, a identificação da sua conta Google. Servem para criar e proteger o seu acesso.",
      "Perfil e anúncios: foto de perfil (opcional), bairro escolhido em Piripiri, livros anunciados e as fotos deles. Aparecem para a comunidade.",
      "Negociações: pedidos, mensagens do chat, encontros combinados, confirmação de entrega e avaliações. Ficam visíveis só para as duas pessoas da negociação (as avaliações aparecem no perfil público).",
      "Segurança: denúncias e bloqueios que você faz ou recebe, analisados pela moderação.",
      "Avisos: o identificador do aparelho para notificações e as suas preferências de aviso.",
      "Diagnóstico: relatórios de erro do aplicativo, sem nome, e-mail ou conteúdo de mensagens, para corrigir falhas.",
      "Não coletamos localização por GPS, contatos, documentos ou dados de pagamento.",
    ],
  },
  {
    title: "3. Com quem os dados são compartilhados",
    paragraphs: [
      "Nenhum dado é vendido nem usado para publicidade.",
      "Usamos fornecedores que processam dados só para fazer o app funcionar: Supabase (banco de dados, login e fotos), Expo e Google Firebase (envio de notificações), Google (login com Google) e Sentry (relatórios de erro). Alguns guardam dados fora do Brasil (por exemplo, nos Estados Unidos); essa transferência internacional é feita nos termos do art. 33 da LGPD, para executar o serviço que você pediu.",
      "Podemos fornecer dados a autoridades quando houver ordem judicial ou obrigação legal.",
      "O seu e-mail nunca é exibido para outras pessoas.",
    ],
  },
  {
    title: "4. Por quanto tempo guardamos",
    paragraphs: [
      "Os dados ficam guardados enquanto a conta existir. Ao excluir a conta, apagamos de forma definitiva perfil, anúncios, pedidos, mensagens, favoritos, alertas, avaliações e notificações.",
      "Relatórios de erro são apagados automaticamente pelo fornecedor em até 90 dias. Cópias de segurança do banco de dados podem manter dados excluídos por alguns dias, até serem substituídas automaticamente.",
    ],
  },
  {
    title: "5. Seus direitos",
    paragraphs: [
      "Você pode, a qualquer momento: confirmar quais dados temos, baixar uma cópia (Configurações > Privacidade e dados > Exportar), corrigir o seu perfil e excluir a conta de forma definitiva pelo próprio app.",
      "Também pode pedir, pelo e-mail ipebook738@gmail.com: informações sobre com quem compartilhamos os seus dados, anonimização ou bloqueio de dados desnecessários, revogação do consentimento e revisão de decisões da moderação. Respondemos em até 15 dias.",
      "Se não ficar satisfeito, você pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD), em gov.br/anpd.",
    ],
  },
  {
    title: "6. Segurança e idade",
    paragraphs: [
      "Os dados trafegam criptografados (HTTPS) e o acesso é restrito por regras no banco de dados: cada pessoa só lê o que é seu ou o que é público.",
      "O IpêBook é destinado a maiores de 18 anos, conforme os Termos de Uso.",
      "Em caso de incidente de segurança que possa causar risco ou dano relevante, avisaremos as pessoas afetadas e a ANPD.",
      "Esta política pode mudar; a data da última atualização fica no topo, e mudanças relevantes serão avisadas no aplicativo.",
    ],
  },
];
