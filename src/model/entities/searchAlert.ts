export type SearchAlert = Readonly<{
  id: string;
  userId: string;
  query: string;
  active: boolean;
  createdAt: string;
}>;
