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
      "Menores de idade devem utilizar a plataforma sob a supervisão e consentimento expresso de seus responsáveis legais.",
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
    ],
  },
];

export const PRIVACY_POLICY: readonly LegalSection[] = [
  {
    title: "1. Tratamento de Dados Pessoais (LGPD)",
    paragraphs: [
      "O IpêBook coleta exclusivamente os dados indispensáveis para o funcionamento da plataforma: endereço de e-mail e informações públicas dos livros cadastrados.",
      "O tratamento segue os princípios da boa-fé, finalidade, transparência e segurança previstos na Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
    ],
  },
  {
    title: "2. Sigilo e Visibilidade das Contas",
    paragraphs: [
      "O endereço de e-mail da pessoa usuária é estritamente confidencial e nunca é exibido publicamente na listagem de livros ou perfis abertos.",
      "Nenhum dado cadastral é comercializado ou compartilhado com redes de publicidade de terceiros.",
    ],
  },
  {
    title: "3. Direitos do Titular e Exclusão",
    paragraphs: [
      "A qualquer momento, o titular tem o direito de solicitar a confirmação da existência de tratamento, a correção de dados incompletos ou a exclusão definitiva de sua conta e anúncios dos servidores.",
    ],
  },
];
