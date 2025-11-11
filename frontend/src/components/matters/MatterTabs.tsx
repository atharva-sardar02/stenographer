import { useState } from 'react';
import { Matter } from '../../services/matter.service';

interface MatterTabsProps {
  matter: Matter;
}

export const MatterTabs: React.FC<MatterTabsProps> = ({ matter }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'files' | 'drafts' | 'activity'
  >('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'files' as const, label: 'Files' },
    { id: 'drafts' as const, label: 'Drafts' },
    { id: 'activity' as const, label: 'Activity' },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Matter Information
              </h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="mt-1 text-sm text-gray-900">{matter.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Client Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {matter.clientName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {matter.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Participants
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {matter.participants.length} participant(s)
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No files uploaded yet.</p>
            <p className="text-sm text-gray-500">
              File upload functionality will be available in PR #5.
            </p>
          </div>
        )}

        {activeTab === 'drafts' && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No drafts created yet.</p>
            <p className="text-sm text-gray-500">
              Draft generation functionality will be available in PR #6.
            </p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No activity recorded yet.</p>
            <p className="text-sm text-gray-500">
              Activity tracking will be implemented in future PRs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

