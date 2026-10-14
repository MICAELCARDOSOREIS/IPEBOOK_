export type Book = Readonly<{
  id: string;
  title: string;
  author: string;
  status: "available" | "reserved";
}>;
