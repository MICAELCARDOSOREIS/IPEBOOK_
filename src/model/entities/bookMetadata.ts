export type BookMetadata = Readonly<{
  isbn: string;
  title: string;
  author: string;
  coverUrl?: string;
  /** `true` quando a capa veio em tamanho grande; a consulta composta prefere a de maior resolução. */
  coverIsLarge?: boolean;
  /** Dados da edição, vindos da base brasileira de ISBN (Spec 097). */
  synopsis?: string;
  publisher?: string;
  pageCount?: number;
  publicationYear?: number;
}>;
