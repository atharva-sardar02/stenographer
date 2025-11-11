import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DraftService, Draft } from '../services/draft.service';
import { RefineSectionModal } from '../components/drafts/RefineSectionModal';

export const DraftEditor: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refiningSection, setRefiningSection] = useState<
    'facts' | 'liability' | 'damages' | 'demand' | null
  >(null);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [selectedSectionForRefine, setSelectedSectionForRefine] = useState<
    'facts' | 'liability' | 'damages' | 'demand'
  >('facts');

  useEffect(() => {
    if (!draftId) {
      navigate('/dashboard');
      return;
    }

    loadDraft();
  }, [draftId, navigate]);

  const loadDraft = async () => {
    try {
      setLoading(true);
      setError(null);
      const draftData = await DraftService.getDraft(draftId!);
      if (!draftData) {
        setError('Draft not found');
        return;
      }
      setDraft(draftData);
    } catch (err: any) {
      setError(err.message || 'Failed to load draft');
    } finally {
      setLoading(false);
    }
  };

  const handleRefineClick = (section: 'facts' | 'liability' | 'damages' | 'demand') => {
    setSelectedSectionForRefine(section);
    setIsRefineModalOpen(true);
  };

  const handleRefine = async (
    section: 'facts' | 'liability' | 'damages' | 'demand',
    instruction: string,
    keepExistingContent: boolean
  ) => {
    if (!draftId) return;

    setRefiningSection(section);
    try {
      await DraftService.refineSection(draftId, section, instruction, keepExistingContent);
      await loadDraft(); // Reload draft to get updated content
    } finally {
      setRefiningSection(null);
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'facts':
        return 'Statement of Facts';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading draft...</p>
        </div>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Draft not found'}</p>
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
                to={`/matters/${draft.matterId}`}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Matter
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Draft Editor</h1>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Draft Sections */}
        <div className="space-y-8">
          {(['facts', 'liability', 'damages', 'demand'] as const).map((section) => {
            const sectionData = draft.sections[section];
            const isRefining = refiningSection === section;

            return (
              <div key={section} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {getSectionTitle(section)}
                  </h2>
                  <button
                    onClick={() => handleRefineClick(section)}
                    disabled={isRefining}
                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded disabled:opacity-50"
                  >
                    {isRefining ? 'Refining...' : '✨ Refine'}
                  </button>
                </div>

                {isRefining ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Refining section...</p>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {sectionData?.content || '[No content generated yet]'}
                    </div>
                  </div>
                )}

                {sectionData?.generatedAt && (
                  <p className="mt-4 text-xs text-gray-500">
                    Generated: {new Date(sectionData.generatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Refine Section Modal */}
      <RefineSectionModal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        onRefine={handleRefine}
        initialSection={selectedSectionForRefine}
      />
    </div>
  );
};

