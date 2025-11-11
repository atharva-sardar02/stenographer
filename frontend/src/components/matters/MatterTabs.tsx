import { useState, useEffect } from 'react';
import { Matter } from '../../services/matter.service';
import { FileService, FileDocument } from '../../services/file.service';
import { FileUpload } from '../files/FileUpload';
import { FileList } from '../files/FileList';
import { useAuth } from '../../hooks/useAuth';

interface MatterTabsProps {
  matter: Matter;
}

export const MatterTabs: React.FC<MatterTabsProps> = ({ matter }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'files' | 'drafts' | 'activity'
  >('overview');
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [filesLoading, setFilesLoading] = useState<boolean>(false);
  const [filesError, setFilesError] = useState<string | null>(null);

  // Load files when files tab is active
  useEffect(() => {
    if (activeTab === 'files' && matter.matterId) {
      loadFiles();
    }
  }, [activeTab, matter.matterId]);

  const loadFiles = async () => {
    try {
      setFilesLoading(true);
      setFilesError(null);
      const filesData = await FileService.getFiles(matter.matterId);
      setFiles(filesData);
    } catch (err: any) {
      setFilesError(err.message || 'Failed to load files');
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFileUploadSuccess = () => {
    loadFiles(); // Reload files after upload
  };

  const handleFileDeleted = (fileId: string) => {
    setFiles(files.filter((f) => f.fileId !== fileId));
  };

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
          <div className="space-y-6">
            {user && (
              <FileUpload
                matterId={matter.matterId}
                userId={user.uid}
                onUploadSuccess={handleFileUploadSuccess}
              />
            )}

            {filesError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{filesError}</p>
              </div>
            )}

            {filesLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading files...</p>
              </div>
            ) : (
              <FileList
                files={files}
                matterId={matter.matterId}
                onFileDeleted={handleFileDeleted}
              />
            )}
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

