import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ActivityItem {
  id: string;
  type: 'matter_created' | 'matter_updated' | 'file_uploaded' | 'draft_generated' | 'draft_updated' | 'participant_added' | 'participant_removed';
  description: string;
  timestamp: Timestamp;
  userId?: string;
  userName?: string;
  metadata?: any;
}

interface ActivityTimelineProps {
  matterId: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ matterId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [matterId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // For now, we'll synthesize activities from existing data
      // In a real implementation, you'd have an activities collection
      const synthesizedActivities: ActivityItem[] = [];

      // Get matter creation info
      const matterDoc = await getDocs(
        query(collection(db, 'matters'), where('__name__', '==', matterId))
      );
      
      if (!matterDoc.empty) {
        const matterData = matterDoc.docs[0].data();
        synthesizedActivities.push({
          id: 'matter-created',
          type: 'matter_created',
          description: `Matter "${matterData.title}" was created`,
          timestamp: matterData.createdAt || Timestamp.now(),
          userId: matterData.createdBy,
        });

        if (matterData.updatedAt && matterData.updatedAt !== matterData.createdAt) {
          synthesizedActivities.push({
            id: 'matter-updated',
            type: 'matter_updated',
            description: `Matter details were updated`,
            timestamp: matterData.updatedAt,
          });
        }
      }

      // Get files
      const filesSnapshot = await getDocs(
        query(
          collection(db, `matters/${matterId}/files`),
          orderBy('uploadedAt', 'desc')
        )
      );
      
      filesSnapshot.docs.forEach((doc) => {
        const fileData = doc.data();
        synthesizedActivities.push({
          id: `file-${doc.id}`,
          type: 'file_uploaded',
          description: `File "${fileData.name}" was uploaded`,
          timestamp: fileData.uploadedAt || Timestamp.now(),
          userId: fileData.uploadedBy,
          metadata: { fileName: fileData.name, fileType: fileData.type },
        });
      });

      // Get drafts
      const draftsSnapshot = await getDocs(
        query(
          collection(db, 'drafts'),
          where('matterId', '==', matterId),
          orderBy('createdAt', 'desc')
        )
      );
      
      draftsSnapshot.docs.forEach((doc) => {
        const draftData = doc.data();
        synthesizedActivities.push({
          id: `draft-${doc.id}`,
          type: 'draft_generated',
          description: `Draft "${draftData.title || 'Untitled'}" was generated`,
          timestamp: draftData.createdAt || Timestamp.now(),
          userId: draftData.createdBy,
          metadata: { draftId: doc.id },
        });

        if (draftData.updatedAt && draftData.updatedAt !== draftData.createdAt) {
          synthesizedActivities.push({
            id: `draft-updated-${doc.id}`,
            type: 'draft_updated',
            description: `Draft "${draftData.title || 'Untitled'}" was updated`,
            timestamp: draftData.updatedAt,
            metadata: { draftId: doc.id },
          });
        }
      });

      // Sort by timestamp descending
      synthesizedActivities.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
      
      setActivities(synthesizedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'matter_created':
        return '📋';
      case 'matter_updated':
        return '✏️';
      case 'file_uploaded':
        return '📎';
      case 'draft_generated':
        return '📄';
      case 'draft_updated':
        return '💾';
      case 'participant_added':
        return '👤';
      case 'participant_removed':
        return '👤';
      default:
        return '•';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'matter_created':
        return 'bg-green-100 text-green-800';
      case 'matter_updated':
        return 'bg-blue-100 text-blue-800';
      case 'file_uploaded':
        return 'bg-purple-100 text-purple-800';
      case 'draft_generated':
        return 'bg-indigo-100 text-indigo-800';
      case 'draft_updated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-2">No activity recorded yet</p>
        <p className="text-sm text-gray-500">
          Activity will appear here as you work on this matter
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 && (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div>
                  <div className={`relative px-1 h-10 w-10 rounded-full flex items-center justify-center text-xl ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {activity.description}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

