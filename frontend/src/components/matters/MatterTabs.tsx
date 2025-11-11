import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Matter } from '../../services/matter.service';
import { FileService, FileDocument } from '../../services/file.service';
import { DraftService, Draft } from '../../services/draft.service';
import { FileUpload } from '../files/FileUpload';
import { FileList } from '../files/FileList';
import { GenerateDraftModal } from '../drafts/GenerateDraftModal';
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
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftsLoading, setDraftsLoading] = useState<boolean>(false);
  const [draftsError, setDraftsError] = useState<string | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);

  // Load files when files tab is active
  useEffect(() => {
    if (activeTab === 'files' && matter.matterId) {
      loadFiles();
    }
  }, [activeTab, matter.matterId]);

  // Load drafts when drafts tab is active
  useEffect(() => {
    if (activeTab === 'drafts' && matter.matterId) {
      loadDrafts();
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

  const loadDrafts = async () => {
    try {
      setDraftsLoading(true);
      setDraftsError(null);
      const draftsData = await DraftService.getDrafts(matter.matterId);
      setDrafts(draftsData);
    } catch (err: any) {
      setDraftsError(err.message || 'Failed to load drafts');
    } finally {
      setDraftsLoading(false);
    }
  };

  const handleDraftGenerated = (draftId: string) => {
    loadDrafts(); // Reload drafts after generation
    // Navigate to draft editor
    window.location.href = `/drafts/${draftId}`;
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Drafts</h3>
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                + Generate New Draft
              </button>
            </div>

            {draftsError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{draftsError}</p>
              </div>
            )}

            {draftsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading drafts...</p>
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No drafts created yet.</p>
                <button
                  onClick={() => setIsGenerateModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Generate Your First Draft
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <div
                    key={draft.draftId}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-semibold text-gray-900">
                            Draft #{draft.draftId.slice(0, 8)}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              draft.state === 'generating'
                                ? 'bg-yellow-100 text-yellow-800'
                                : draft.state === 'editing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {draft.state}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Generated {new Date(draft.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={`/drafts/${draft.draftId}`}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <GenerateDraftModal
              isOpen={isGenerateModalOpen}
              onClose={() => setIsGenerateModalOpen(false)}
              onSuccess={handleDraftGenerated}
              matterId={matter.matterId}
            />
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

