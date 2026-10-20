export type UploadPhotoPayload = {
  userId: string;
  bookId?: string;
  fileName: string;
  fileBytes: Uint8Array | ArrayBuffer;
  contentType: string;
};

export interface IPhotoStorageDataSource {
  uploadPhoto(payload: UploadPhotoPayload): Promise<string>;
  deletePhoto(photoUrl: string): Promise<void>;
}
