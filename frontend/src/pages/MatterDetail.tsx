import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MatterService, Matter } from '../services/matter.service';
import { MatterTabs } from '../components/matters/MatterTabs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AddParticipantModal } from '../components/matters/AddParticipantModal';
import { useAuth } from '../contexts/AuthContext';
import { UserService, User } from '../services/user.service';

export const MatterDetail: React.FC = () => {
  const { matterId } = useParams<{ matterId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<{
    title: string;
    clientName: string;
    status: Matter['status'];
  }>({
    title: '',
    clientName: '',
    status: 'active',
  });
  const [showAddParticipantModal, setShowAddParticipantModal] = useState<boolean>(false);
  const [participants, setParticipants] = useState<User[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState<boolean>(false);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);

  const loadMatter = async () => {
    if (!matterId) {
      navigate('/dashboard');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const matterData = await MatterService.getMatter(matterId);
      if (!matterData) {
        setError('Matter not found');
        return;
      }
      setMatter(matterData);
      setEditData({
        title: matterData.title,
        clientName: matterData.clientName,
        status: matterData.status,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load matter');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatter();
  }, [matterId, navigate]);

  useEffect(() => {
    if (matter && matter.participants.length > 0) {
      loadParticipants();
    } else {
      setParticipants([]);
    }
  }, [matter]);

  const handleSave = async () => {
    if (!matterId) return;

    try {
      await MatterService.updateMatter(matterId, editData);
      // Reload matter
      const updatedMatter = await MatterService.getMatter(matterId);
      if (updatedMatter) {
        setMatter(updatedMatter);
      }
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update matter');
    }
  };

  const handleCancel = () => {
    if (matter) {
      setEditData({
        title: matter.title,
        clientName: matter.clientName,
        status: matter.status,
      });
    }
    setIsEditing(false);
  };

  const loadParticipants = async () => {
    if (!matter || !matter.participants || matter.participants.length === 0) {
      setParticipants([]);
      return;
    }

    try {
      setLoadingParticipants(true);
      const allUsers = await UserService.getAllUsers();
      const participantUsers = allUsers.filter((user) =>
        matter.participants.includes(user.userId)
      );
      setParticipants(participantUsers);
    } catch (err: any) {
      console.error('Failed to load participants:', err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleAddParticipant = async (userId: string) => {
    if (!matterId || !matter) return;

    try {
      const updatedParticipants = [...matter.participants, userId];
      await MatterService.updateMatter(matterId, {
        participants: updatedParticipants,
      });
      // Reload matter
      const updatedMatter = await MatterService.getMatter(matterId);
      if (updatedMatter) {
        setMatter(updatedMatter);
      }
    } catch (err: any) {
      throw new Error(`Failed to add participant: ${err.message}`);
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (!matterId || !matter) return;

    if (!window.confirm('Are you sure you want to remove this participant?')) {
      return;
    }

    try {
      const updatedParticipants = matter.participants.filter((id) => id !== userId);
      await MatterService.updateMatter(matterId, {
        participants: updatedParticipants,
      });
      // Reload matter
      const updatedMatter = await MatterService.getMatter(matterId);
      if (updatedMatter) {
        setMatter(updatedMatter);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove participant');
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if user is attorney - only show if userProfile is loaded
  const isAttorney = userProfile?.role === 'attorney';
  const isCreator = matter?.createdBy === userProfile?.userId;
  
  // Debug: Log userProfile to console (remove in production)
  useEffect(() => {
    if (userProfile) {
      console.log('[MatterDetail] userProfile loaded:', { role: userProfile.role, isAttorney });
    }
  }, [userProfile, isAttorney]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading matter..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Matter</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  setError(null);
                  loadMatter();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Matter not found'}</p>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="Stenographer Logo" 
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stenographer</h1>
                  <p className="text-sm text-gray-600">Demand Letter Generator</p>
                </div>
              </Link>
              <nav className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/templates')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Templates
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {userProfile?.role || 'paralegal'}
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Matter Overview Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        value={editData.clientName}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            clientName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={editData.status}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            status: e.target.value as Matter['status'],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {matter.title}
                        </h2>
                        <p className="text-lg text-gray-600 mt-1">
                          {matter.clientName}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full font-medium text-sm ${
                        matter.status === 'active' ? 'bg-green-100 text-green-800' :
                        matter.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        matter.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {matter.status.charAt(0).toUpperCase() + matter.status.slice(1)}
                      </span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-200">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</p>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(matter.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(matter.updatedAt)}</p>
                      </div>
                    </div>

                    {/* Participants Section - Collapsible, Only visible to attorneys */}
                    {isAttorney && (
                      <div className="mt-6">
                        <button
                          onClick={() => setShowParticipants(!showParticipants)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-700">
                              Participants
                            </h3>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {participants.length}
                            </span>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              showParticipants ? 'transform rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {showParticipants && (
                          <div className="mt-3">
                            <div className="flex items-center justify-end mb-3">
                              <button
                                onClick={() => setShowAddParticipantModal(true)}
                                className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                              >
                                + Add Participant
                              </button>
                            </div>
                            {loadingParticipants ? (
                              <div className="py-2">
                                <LoadingSpinner size="sm" text="Loading participants..." />
                              </div>
                            ) : participants.length === 0 ? (
                              <p className="text-sm text-gray-500">
                                No participants added yet.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {participants.map((participant) => (
                                  <div
                                    key={participant.userId}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                                        {participant.displayName.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {participant.displayName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {participant.email} • {participant.role}
                                        </p>
                                      </div>
                                    </div>
                                    {isCreator && (
                                      <button
                                        onClick={() =>
                                          handleRemoveParticipant(participant.userId)
                                        }
                                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Add Participant Modal */}
        {isAttorney && (
          <AddParticipantModal
            isOpen={showAddParticipantModal}
            onClose={() => setShowAddParticipantModal(false)}
            onAdd={handleAddParticipant}
            existingParticipantIds={matter?.participants || []}
            currentUserId={userProfile?.userId || ''}
          />
        )}

        {/* Tabs */}
        <MatterTabs matter={matter} />
      </main>
    </div>
  );
};

