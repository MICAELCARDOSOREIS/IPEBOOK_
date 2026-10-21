import type { Book } from './book';
import type { BookRequest } from './bookRequest';
import type { SearchAlert } from './searchAlert';
import type { User } from './user';
import type { AppNotification } from './notification';
import type { ReportListing } from './report';
import type { Rating } from './rating';

export interface UserExportData {
  userId: string;
  exportedAt: string;
  account: User | null;
  profile: { name: string; joinedAt: string; photoUrl?: string; socialHandle?: string } | null;
  listings: Book[];
  sentRequests: BookRequest[];
  receivedRequests: BookRequest[];
  favorites: string[];
  searchAlerts: SearchAlert[];
  searchHistory: string[];
  notifications: AppNotification[];
  reports: ReportListing[];
  ratingsGiven: Rating[];
  ratingsReceived: Rating[];
}
