export interface DraftSection {
  content: string;
  generatedAt: Date | string;
}

export interface Draft {
  draftId: string;
  matterId: string;
  templateId: string | null;
  state: 'generating' | 'editing' | 'final';
  sections: {
    facts: DraftSection;
    liability: DraftSection;
    damages: DraftSection;
    demand: DraftSection;
  };
  variables: Record<string, any>;
  generatedBy: string; // userId
  lastGeneratedAt: Date | string;
  lastEditedAt: Date | string;
  lastEditedBy: string; // userId
  createdAt: Date | string;
  updatedAt: Date | string;
}

