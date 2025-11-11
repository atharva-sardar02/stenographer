import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MatterService, Matter } from '../services/matter.service';
import { MatterTabs } from '../components/matters/MatterTabs';

export const MatterDetail: React.FC = () => {
  const { matterId } = useParams<{ matterId: string }>();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!matterId) {
      navigate('/dashboard');
      return;
    }

    const loadMatter = async () => {
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

    loadMatter();
  }, [matterId, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading matter...</p>
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Matter Details</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {matter.title}
                    </h2>
                    <p className="text-lg text-gray-600 mb-4">
                      {matter.clientName}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>
                        Created: {formatDate(matter.createdAt)}
                      </span>
                      <span>
                        Updated: {formatDate(matter.updatedAt)}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full capitalize">
                        {matter.status}
                      </span>
                    </div>
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

        {/* Tabs */}
        <MatterTabs matter={matter} />
      </main>
    </div>
  );
};

