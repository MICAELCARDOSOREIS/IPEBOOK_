import type { Book } from './book';
import type { BookRequest } from './bookRequest';
import type { SearchAlert } from './searchAlert';

export interface UserExportData {
  userId: string;
  exportedAt: string;
  listings: Book[];
  sentRequests: BookRequest[];
  receivedRequests: BookRequest[];
  favorites: string[];
  searchAlerts: SearchAlert[];
}
