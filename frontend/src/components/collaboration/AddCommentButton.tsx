import { useState } from 'react';
import { CommentService } from '../../services/comment.service';
import { useAuth } from '../../hooks/useAuth';

interface AddCommentButtonProps {
  draftId: string;
  section: 'facts' | 'liability' | 'damages' | 'demand';
  selectedText?: string;
  onCommentAdded?: () => void;
}

export const AddCommentButton: React.FC<AddCommentButtonProps> = ({
  draftId,
  section,
  selectedText,
  onCommentAdded,
}) => {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!user || !userProfile || !commentContent.trim()) return;

    setSubmitting(true);
    try {
      // Calculate position (simplified - in real implementation, would use TipTap selection)
      const position = {
        section,
        startOffset: 0,
        endOffset: selectedText?.length || 0,
        selectedText,
      };

      await CommentService.addComment(
        {
          draftId,
          position,
          content: commentContent,
        },
        user.uid,
        userProfile.displayName || user.email || 'Unknown'
      );

      setCommentContent('');
      setIsOpen(false);
      onCommentAdded?.();
    } catch (error: any) {
      alert(`Failed to add comment: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
        title="Add comment"
      >
        💬 Comment
      </button>
    );
  }

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
      {selectedText && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-600 italic">
          "{selectedText}"
        </div>
      )}
      <textarea
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        placeholder="Write a comment..."
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        rows={3}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleAddComment}
          disabled={submitting || !commentContent.trim()}
          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
        <button
          onClick={() => {
            setIsOpen(false);
            setCommentContent('');
          }}
          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

