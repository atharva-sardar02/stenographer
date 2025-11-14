import { useState, useEffect } from 'react';
import { UserService, User } from '../../services/user.service';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userId: string) => Promise<void>;
  existingParticipantIds: string[];
  currentUserId: string;
}

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingParticipantIds,
  currentUserId,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get all attorneys and paralegals
      const allUsers = await UserService.getAttorneysAndParalegals();
      // Filter out current user and existing participants
      const availableUsers = allUsers.filter(
        (user) =>
          user.userId !== currentUserId &&
          !existingParticipantIds.includes(user.userId)
      );
      setUsers(availableUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      setAdding(true);
      setError(null);
      await onAdd(selectedUserId);
      setSelectedUserId('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add participant');
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add Participant</h2>
            <button
              onClick={onClose}
              disabled={adding}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="py-8">
              <LoadingSpinner size="md" text="Loading users..." />
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">
                No available users to add. All users are already participants.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={adding}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.displayName} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={adding}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={adding || !selectedUserId}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? 'Adding...' : 'Add Participant'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


