import { useCollaboration } from '../../contexts/CollaborationContext';
import { useAuth } from '../../hooks/useAuth';

export const PresenceIndicator: React.FC = () => {
  const { activeEditors } = useCollaboration();
  const { user } = useAuth();

  // Filter out current user
  const otherEditors = activeEditors.filter((editor) => editor.userId !== user?.uid);

  if (otherEditors.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
      <div className="flex -space-x-2">
        {otherEditors.slice(0, 3).map((editor) => (
          <div
            key={editor.userId}
            className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
            title={editor.userName}
          >
            {editor.userName.charAt(0).toUpperCase()}
          </div>
        ))}
        {otherEditors.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center border-2 border-white">
            +{otherEditors.length - 3}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-600">
        {otherEditors.length === 1
          ? '1 person editing'
          : `${otherEditors.length} people editing`}
      </span>
    </div>
  );
};

