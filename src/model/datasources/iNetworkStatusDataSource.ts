export interface INetworkStatusDataSource {
  isOnline(): Promise<boolean>;
  subscribe(onChange: (isOnline: boolean) => void): () => void;
}
