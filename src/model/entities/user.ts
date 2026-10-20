export type User = Readonly<{
  id: string;
  email: string;
  /** Nome informado no cadastro (01.03 do Figma); alimenta o perfil público. */
  name?: string;
}>;
