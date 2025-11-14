import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MatterService, Matter } from '../services/matter.service';
import { MatterCard } from '../components/matters/MatterCard';
import { CreateMatterModal } from '../components/matters/CreateMatterModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const Dashboard: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'draft' | 'completed' | 'archived'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const userId = user?.uid || '';

  // Filter matters based on search query (status is handled by the query)
  const filteredMatters = matters.filter((matter) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      matter.title.toLowerCase().includes(query) ||
      matter.clientName.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (!userId) return;

    const loadMatters = async () => {
      try {
        setLoading(true);
        setError(null);
        const status =
          statusFilter === 'all' ? undefined : statusFilter;
        const mattersData = await MatterService.getMatters(userId, {
          status,
          searchQuery: searchQuery || undefined,
        });
        setMatters(mattersData);
      } catch (err: any) {
        setError(err.message || 'Failed to load matters');
      } finally {
        setLoading(false);
      }
    };

    loadMatters();
  }, [userId, statusFilter, searchQuery]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleCreateSuccess = async () => {
    // Reload matters after creation
    if (userId) {
      try {
        setLoading(true);
        setError(null);
        const status = statusFilter === 'all' ? undefined : statusFilter;
        const mattersData = await MatterService.getMatters(userId, {
          status,
          searchQuery: searchQuery || undefined,
        });
        setMatters(mattersData);
      } catch (err: any) {
        setError(err.message || 'Failed to reload matters');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="Stenographer Logo" 
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    // Hide image if logo.png not found
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stenographer</h1>
                  <p className="text-sm text-gray-600">Demand Letter Generator</p>
                </div>
              </div>
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
                  {userProfile?.displayName || user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {userProfile?.role || 'paralegal'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Matters</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your legal matters and demand letters
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Create New Matter
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by title or client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | 'all'
                      | 'active'
                      | 'draft'
                      | 'completed'
                      | 'archived'
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Matters List */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading matters..." />
          </div>
        ) : filteredMatters.length === 0 ? (
          <EmptyState
            icon="📁"
            title={
              searchQuery || statusFilter !== 'all'
                ? 'No matters found'
                : "You don't have any matters yet"
            }
            description={
              searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first matter to get started with managing your legal cases.'
            }
            action={{
              label: 'Create Matter',
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatters.map((matter) => (
              <MatterCard key={matter.matterId} matter={matter} />
            ))}
          </div>
        )}
      </main>

      {/* Create Matter Modal */}
      <CreateMatterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        userId={userId}
      />
    </div>
  );
};
