export type RequestStatus = "pending" | "accepted" | "rejected";

export type BookRequest = Readonly<{
  id: string;
  listingId: string;
  requesterId: string;
  status: RequestStatus;
}>;
