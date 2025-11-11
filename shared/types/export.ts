export interface Export {
  exportId: string;
  draftId: string;
  matterId: string;
  format: 'docx'; // Only DOCX supported
  storagePath: string; // Path in Firebase Storage
  exportedBy: string; // userId
  exportedAt: Date | string;
  fileSize: number; // Bytes
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
  purgeAt: Date | string;
  isPurged: boolean;
}

