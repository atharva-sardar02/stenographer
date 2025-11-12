import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Comment } from '../../../shared/types/comment';

// Re-export Comment type for use in components
export type { Comment } from '../../../shared/types/comment';

export interface CreateCommentData {
  draftId: string;
  position: {
    section: 'facts' | 'liability' | 'damages' | 'demand';
    startOffset: number;
    endOffset: number;
    selectedText?: string;
  };
  content: string;
}

export interface CreateReplyData {
  draftId: string;
  commentId: string;
  content: string;
}

export class CommentService {
  /**
   * Adds a new comment to a draft
   */
  static async addComment(
    data: CreateCommentData,
    userId: string,
    userName: string
  ): Promise<string> {
    try {
      const commentsRef = collection(db, 'drafts', data.draftId, 'comments');
      const newComment = {
        draftId: data.draftId,
        userId,
        userName,
        position: data.position,
        content: data.content,
        resolved: false,
        replies: [],
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(commentsRef, newComment);

      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  /**
   * Retrieves all comments for a draft
   */
  static async getComments(draftId: string): Promise<Comment[]> {
    try {
      const commentsRef = collection(db, 'drafts', draftId, 'comments');
      const q = query(commentsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...(data as Omit<Comment, 'timestamp' | 'resolvedAt'>),
          commentId: doc.id,
          timestamp: (data.timestamp as any).toDate(),
          resolvedAt: data.resolvedAt ? (data.resolvedAt as any).toDate() : undefined,
        };
      });
    } catch (error: any) {
      throw new Error(`Failed to get comments: ${error.message}`);
    }
  }

  /**
   * Adds a reply to a comment
   */
  static async addReply(
    data: CreateReplyData,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const commentRef = doc(db, 'drafts', data.draftId, 'comments', data.commentId);
      const commentDoc = await getDoc(commentRef);

      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }

      const comment = commentDoc.data() as any;
      const replyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newReply = {
        replyId,
        userId,
        userName,
        content: data.content,
        timestamp: serverTimestamp(),
      };

      await updateDoc(commentRef, {
        replies: [...(comment.replies || []), newReply],
      });
    } catch (error: any) {
      throw new Error(`Failed to add reply: ${error.message}`);
    }
  }

  /**
   * Resolves a comment
   */
  static async resolveComment(
    draftId: string,
    commentId: string,
    userId: string
  ): Promise<void> {
    try {
      const commentRef = doc(db, 'drafts', draftId, 'comments', commentId);
      await updateDoc(commentRef, {
        resolved: true,
        resolvedAt: serverTimestamp(),
        resolvedBy: userId,
      });
    } catch (error: any) {
      throw new Error(`Failed to resolve comment: ${error.message}`);
    }
  }

  /**
   * Deletes a comment
   */
  static async deleteComment(draftId: string, commentId: string): Promise<void> {
    try {
      const commentRef = doc(db, 'drafts', draftId, 'comments', commentId);
      await deleteDoc(commentRef);
    } catch (error: any) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }

  /**
   * Subscribes to real-time comment updates
   */
  static subscribeToComments(
    draftId: string,
    callback: (comments: Comment[]) => void
  ): () => void {
    const commentsRef = collection(db, 'drafts', draftId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));

    return onSnapshot(
      q,
      (querySnapshot) => {
        const comments = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...(data as Omit<Comment, 'timestamp' | 'resolvedAt'>),
            commentId: doc.id,
            timestamp: (data.timestamp as any).toDate(),
            resolvedAt: data.resolvedAt ? (data.resolvedAt as any).toDate() : undefined,
          };
        });
        callback(comments);
      },
      (error) => {
        console.error('Error subscribing to comments:', error);
      }
    );
  }
}

