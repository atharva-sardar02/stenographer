import { useState } from 'react';
import type { Comment, CommentReply } from '../../../../shared/types/comment';
import { useAuth } from '../../hooks/useAuth';

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => void;
  onResolve: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onResolve,
  onDelete,
}) => {
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const formatTime = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsAgo < 60) {
      return `${secondsAgo}s ago`;
    } else if (secondsAgo < 3600) {
      return `${Math.floor(secondsAgo / 60)}m ago`;
    } else if (secondsAgo < 86400) {
      return `${Math.floor(secondsAgo / 3600)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.commentId, replyContent);
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  const isOwnComment = comment.userId === user?.uid;

  return (
    <div
      className={`p-3 rounded-md border ${
        comment.resolved
          ? 'bg-gray-50 border-gray-200 opacity-75'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {isOwnComment ? 'You' : comment.userName}
          </span>
          <span className="text-xs text-gray-500">{formatTime(comment.timestamp)}</span>
          {comment.resolved && (
            <span className="text-xs text-green-600 font-medium">Resolved</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!comment.resolved && isOwnComment && (
            <button
              onClick={() => onResolve(comment.commentId)}
              className="text-xs text-green-600 hover:text-green-700"
            >
              Resolve
            </button>
          )}
          {isOwnComment && (
            <button
              onClick={() => onDelete(comment.commentId)}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>

      {comment.position.selectedText && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-600 italic">
          "{comment.position.selectedText}"
        </div>
      )}

      {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-4 space-y-2 border-l-2 border-gray-200 pl-3">
              {comment.replies.map((reply: CommentReply) => (
            <div key={reply.replyId} className="text-sm">
              <span className="font-medium text-gray-900">
                {reply.userId === user?.uid ? 'You' : reply.userName}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {formatTime(reply.timestamp)}
              </span>
              <p className="text-gray-700 mt-1">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Input */}
      {!comment.resolved && (
        <div className="mt-3">
          {!showReplyInput ? (
            <button
              onClick={() => setShowReplyInput(true)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Reply
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReply}
                  className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Post Reply
                </button>
                <button
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyContent('');
                  }}
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

