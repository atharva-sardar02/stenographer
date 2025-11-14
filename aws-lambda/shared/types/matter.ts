export interface Matter {
  matterId: string;
  title: string;
  clientName: string;
  status: 'active' | 'draft' | 'completed' | 'archived';
  participants: string[]; // Array of userIds
  createdBy: string; // userId
  createdAt: Date | string;
  updatedAt: Date | string;
}

