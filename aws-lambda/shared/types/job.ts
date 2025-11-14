export type JobType = 'ocr' | 'draft_generation' | 'draft_refinement' | 'export';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  jobId: string;
  type: JobType;
  status: JobStatus;
  matterId: string | null;
  draftId: string | null;
  fileId: string | null;
  exportId: string | null;
  createdBy: string; // userId
  createdAt: Date | string;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  error: string | null;
  metadata: Record<string, any>; // Additional job-specific data
}

