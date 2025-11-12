interface Change {
  changeId: string;
  userId: string;
  userName: string;
  timestamp: Date | string;
  type: 'insert' | 'delete' | 'format' | 'refinement';
  section: 'facts' | 'liability' | 'damages' | 'demand';
  position?: number;
  content?: string;
  description: string;
}

interface ChangeItemProps {
  change: Change;
  currentUserId?: string;
}

export const ChangeItem: React.FC<ChangeItemProps> = ({ change, currentUserId }) => {
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

  const getChangeIcon = () => {
    switch (change.type) {
      case 'insert':
        return '➕';
      case 'delete':
        return '➖';
      case 'format':
        return '🎨';
      case 'refinement':
        return '✨';
      default:
        return '📝';
    }
  };

  const getSectionLabel = (section: string) => {
    switch (section) {
      case 'facts':
        return 'Facts';
      case 'liability':
        return 'Liability';
      case 'damages':
        return 'Damages';
      case 'demand':
        return 'Demand';
      default:
        return section;
    }
  };

  const isOwnChange = change.userId === currentUserId;

  return (
    <div
      className={`p-3 rounded-md border ${
        isOwnChange
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">{getChangeIcon()}</span>
          <span className="text-sm font-medium text-gray-900">
            {isOwnChange ? 'You' : change.userName}
          </span>
          <span className="text-xs text-gray-500">
            {getSectionLabel(change.section)}
          </span>
        </div>
        <span className="text-xs text-gray-500">{formatTime(change.timestamp)}</span>
      </div>
      <p className="text-sm text-gray-700">{change.description}</p>
      {change.content && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 font-mono max-h-20 overflow-y-auto">
          {change.content.substring(0, 100)}
          {change.content.length > 100 && '...'}
        </div>
      )}
    </div>
  );
};

