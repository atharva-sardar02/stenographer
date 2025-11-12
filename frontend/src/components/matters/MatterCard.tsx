import { Link } from 'react-router-dom';
import { Matter } from '../../services/matter.service';

interface MatterCardProps {
  matter: Matter;
}

export const MatterCard: React.FC<MatterCardProps> = ({ matter }) => {
  const getStatusColor = (status: Matter['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link
      to={`/matters/${matter.matterId}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`View matter: ${matter.title}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {matter.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{matter.clientName}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Created {formatDate(matter.createdAt)}</span>
            {matter.participants.length > 0 && (
              <span>{matter.participants.length} participant(s)</span>
            )}
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
            matter.status
          )}`}
        >
          {matter.status}
        </span>
      </div>
    </Link>
  );
};

