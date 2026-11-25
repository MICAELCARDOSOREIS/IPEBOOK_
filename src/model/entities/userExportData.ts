import type { Book } from "./book";
import type { BookRequest } from "./bookRequest";
import type { Delivery } from "./delivery";
import type { Meeting } from "./meeting";
import type { NegotiationMessage } from "./negotiationMessage";
import type { AppNotification } from "./notification";
import type { Rating } from "./rating";
import type { ReportListing, ReportUser } from "./report";
import type { SearchAlert } from "./searchAlert";
import type { User } from "./user";

export interface ExportedBook extends Book {
  updatedAt?: string;
  isbn?: string;
  edition?: string;
  moderationHold?: boolean;
}

export interface ExportedBookRequest extends BookRequest {
  createdAt?: string;
}

export interface ExportedUserPreferences {
  phone?: string;
  neighborhood?: string;
  pushToken?: string;
  mutedTypes: readonly string[];
  updatedAt?: string;
}

export interface ExportedBlockedUser {
  blockedId: string;
  createdAt: string;
}

export interface ExportedHiddenConversation {
  requestId: string;
  hiddenAt: string;
}

export interface UserExportData {
  userId: string;
  exportedAt: string;
  account: User | null;
  profile: { name: string; joinedAt: string; photoUrl?: string; socialHandle?: string } | null;
  preferences: ExportedUserPreferences | null;
  listings: ExportedBook[];
  sentRequests: ExportedBookRequest[];
  receivedRequests: ExportedBookRequest[];
  negotiationMessages: NegotiationMessage[];
  meetings: Meeting[];
  deliveries: Delivery[];
  favorites: string[];
  searchAlerts: SearchAlert[];
  searchHistory: string[];
  notifications: AppNotification[];
  reports: ReportListing[];
  userReports: ReportUser[];
  blockedUsers: ExportedBlockedUser[];
  hiddenConversations: ExportedHiddenConversation[];
  ratingsGiven: Rating[];
  ratingsReceived: Rating[];
}
