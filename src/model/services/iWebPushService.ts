export interface IWebPushService {
  status(): Promise<WebPushStatus>;
  enable(userId: string): Promise<void>;
  disable(): Promise<void>;
}

export type WebPushStatus = "unavailable" | "requires-install" | "inactive" | "active";
