import { useState, useEffect } from 'react';
import { CommentService, Comment } from '../../services/comment.service';
import { CommentItem } from './CommentItem';
import { useAuth } from '../../hooks/useAuth';

interface CommentsSidebarProps {
  draftId: string;
}

type FilterType = 'all' | 'unresolved' | 'resolved';

export const CommentsSidebar: React.FC<CommentsSidebarProps> = ({ draftId }) => {
  const { user, userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!draftId) return;

    const unsubscribe = CommentService.subscribeToComments(draftId, (updatedComments) => {
      setComments(updatedComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [draftId]);

  const handleReply = async (commentId: string, content: string) => {
    if (!user || !userProfile) return;

    try {
      await CommentService.addReply(
        { draftId, commentId, content },
        user.uid,
        userProfile.displayName || user.email || 'Unknown'
      );
    } catch (error: any) {
      alert(`Failed to add reply: ${error.message}`);
    }
  };

  const handleResolve = async (commentId: string) => {
    if (!user) return;

    try {
      await CommentService.resolveComment(draftId, commentId, user.uid);
    } catch (error: any) {
      alert(`Failed to resolve comment: ${error.message}`);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await CommentService.deleteComment(draftId, commentId);
    } catch (error: any) {
      alert(`Failed to delete comment: ${error.message}`);
    }
  };

  const filteredComments = comments.filter((comment) => {
    if (filter === 'unresolved') return !comment.resolved;
    if (filter === 'resolved') return comment.resolved;
    return true;
  });

  const unresolvedCount = comments.filter((c) => !c.resolved).length;
  const resolvedCount = comments.filter((c) => c.resolved).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Comments</h3>
        <span className="text-xs text-gray-500">
          {comments.length} total
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({comments.length})
        </button>
        <button
          onClick={() => setFilter('unresolved')}
          className={`px-3 py-1 text-xs font-medium border-b-2 transition-colors ${
            filter === 'unresolved'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Unresolved ({unresolvedCount})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-3 py-1 text-xs font-medium border-b-2 transition-colors ${
            filter === 'resolved'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Loading comments...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            {filter === 'all'
              ? 'No comments yet'
              : filter === 'unresolved'
              ? 'No unresolved comments'
              : 'No resolved comments'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredComments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              onReply={handleReply}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

