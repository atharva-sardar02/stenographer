export interface File {
  fileId: string;
  matterId: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt';
  size: number; // Bytes
  storagePath: string;
  uploadedBy: string; // userId
  uploadedAt: Date | string;
  ocrStatus: 'pending' | 'processing' | 'done' | 'failed' | null;
  ocrText: string | null;
  ocrConfidence: number | null; // 0-100
  ocrPages: number | null;
  ocrError: string | null;
  purgeAt: Date | string;
  isPurged: boolean;
}

