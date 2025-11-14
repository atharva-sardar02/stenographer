export interface Comment {
  commentId: string;
  draftId: string;
  userId: string;
  userName: string;
  timestamp: Date | string;
  position: {
    section: 'facts' | 'liability' | 'damages' | 'demand';
    startOffset: number;
    endOffset: number;
    selectedText?: string;
  };
  content: string;
  resolved: boolean;
  resolvedAt?: Date | string;
  resolvedBy?: string;
  replies: CommentReply[];
}

export interface CommentReply {
  replyId: string;
  userId: string;
  userName: string;
  timestamp: Date | string;
  content: string;
}

