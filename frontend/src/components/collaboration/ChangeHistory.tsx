import { useCollaboration } from '../../contexts/CollaborationContext';
import { useAuth } from '../../hooks/useAuth';
import { ChangeItem } from './ChangeItem';

export const ChangeHistory: React.FC = () => {
  const { changes, loading } = useCollaboration();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">Loading change history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Change History</h3>
        <span className="text-xs text-gray-500">{changes.length} changes</span>
      </div>

      {changes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No changes recorded yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {changes.map((change) => (
            <ChangeItem key={change.changeId} change={change} currentUserId={user?.uid} />
          ))}
        </div>
      )}
    </div>
  );
};

