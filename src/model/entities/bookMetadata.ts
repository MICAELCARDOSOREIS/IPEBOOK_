export type BookMetadata = Readonly<{
  isbn: string;
  title: string;
  author: string;
  coverUrl?: string;
}>;
