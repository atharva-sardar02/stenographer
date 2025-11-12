import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DraftService, Draft } from '../services/draft.service';
import { MatterService, Matter } from '../services/matter.service';
import { RefineSectionModal } from '../components/drafts/RefineSectionModal';
import { TipTapEditor } from '../components/editor/TipTapEditor';
import { useEditor } from '../hooks/useEditor';
import { CollaborationProvider, useCollaboration } from '../contexts/CollaborationContext';
import { PresenceIndicator } from '../components/collaboration/PresenceIndicator';
import { ChangeHistory } from '../components/collaboration/ChangeHistory';
import { CommentsSidebar } from '../components/collaboration/CommentsSidebar';
import { AddCommentButton } from '../components/collaboration/AddCommentButton';
import { useAuth } from '../hooks/useAuth';

const DraftEditorContent: React.FC<{ draftId: string }> = ({ draftId }) => {
  const { user, userProfile } = useAuth();
  const { recordChange } = useCollaboration();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refiningSection, setRefiningSection] = useState<
    'facts' | 'liability' | 'damages' | 'demand' | null
  >(null);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [selectedSectionForRefine, setSelectedSectionForRefine] = useState<
    'facts' | 'liability' | 'damages' | 'demand'
  >('facts');
  const [activeSection, setActiveSection] = useState<
    'facts' | 'liability' | 'damages' | 'demand'
  >('facts');

  // Editor hooks for each section
  const factsEditor = useEditor({
    draftId: draftId || '',
  });
  const liabilityEditor = useEditor({
    draftId: draftId || '',
  });
  const damagesEditor = useEditor({
    draftId: draftId || '',
  });
  const demandEditor = useEditor({
    draftId: draftId || '',
  });

  useEffect(() => {
    loadDraft();
  }, [draftId]);

  const loadDraft = async () => {
    try {
      setLoading(true);
      setError(null);
      const draftData = await DraftService.getDraft(draftId);
      if (!draftData) {
        setError('Draft not found');
        return;
      }
      setDraft(draftData);

      // Load matter information
      if (draftData.matterId) {
        try {
          const matterData = await MatterService.getMatter(draftData.matterId);
          setMatter(matterData);
        } catch (matterErr) {
          console.warn('Failed to load matter:', matterErr);
        }
      }
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
      
      // Record refinement change
      await recordChange({
        userId: user?.uid || '',
        userName: userProfile?.displayName || user?.email || 'Unknown',
        type: 'refinement',
        section,
        description: `Refined ${section} section: ${instruction}`,
      });

      await loadDraft(); // Reload draft to get updated content
    } finally {
      setRefiningSection(null);
    }
  };

  const handleSectionContentChange = (
    section: 'facts' | 'liability' | 'damages' | 'demand',
    content: string
  ) => {
    const editorHook =
      section === 'facts'
        ? factsEditor
        : section === 'liability'
        ? liabilityEditor
        : section === 'damages'
        ? damagesEditor
        : demandEditor;

    editorHook.saveContent(content, section);

    // Record change in collaboration history (debounced)
    const changeTimeout = setTimeout(async () => {
      await recordChange({
        userId: user?.uid || '',
        userName: userProfile?.displayName || user?.email || 'Unknown',
        type: 'insert',
        section,
        description: `Edited ${section} section`,
        content: content.substring(0, 200), // Store first 200 chars
      });
    }, 3000); // Record change 3 seconds after last edit

    return () => clearTimeout(changeTimeout);
  };

  const getCurrentEditor = () => {
    switch (activeSection) {
      case 'facts':
        return factsEditor;
      case 'liability':
        return liabilityEditor;
      case 'damages':
        return damagesEditor;
      case 'demand':
        return demandEditor;
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Draft Editor</h1>
                {matter && (
                  <p className="text-sm text-gray-600">
                    {matter.title} • {matter.clientName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PresenceIndicator />
              <span className="text-sm text-gray-500">
                {getCurrentEditor().getSaveStatus()}
              </span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Section Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Sections</h3>
              <nav className="space-y-1">
                {(['facts', 'liability', 'damages', 'demand'] as const).map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      activeSection === section
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {getSectionTitle(section)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Center - Editor */}
          <div className="lg:col-span-2">
            {(['facts', 'liability', 'damages', 'demand'] as const).map((section) => {
              const sectionData = draft.sections[section];
              const isRefining = refiningSection === section;
              const isActive = activeSection === section;

              if (!isActive) return null;

              return (
                <div key={section} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {getSectionTitle(section)}
                    </h2>
                    <div className="flex items-center gap-2">
                      <AddCommentButton
                        draftId={draftId}
                        section={section}
                        onCommentAdded={() => {}}
                      />
                      <button
                        onClick={() => handleRefineClick(section)}
                        disabled={isRefining}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded disabled:opacity-50"
                      >
                        {isRefining ? 'Refining...' : '✨ Refine'}
                      </button>
                    </div>
                  </div>

                  {isRefining ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">Refining section...</p>
                    </div>
                  ) : (
                    <TipTapEditor
                      content={sectionData?.content || ''}
                      onChange={(content) => handleSectionContentChange(section, content)}
                      placeholder={`Start editing ${getSectionTitle(section).toLowerCase()}...`}
                    />
                  )}

                  {sectionData?.generatedAt && (
                    <p className="text-xs text-gray-500">
                      Generated: {new Date(sectionData.generatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Sidebar - Change History & Comments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4 space-y-6">
              <ChangeHistory />
              <div className="border-t border-gray-200 pt-6">
                <CommentsSidebar draftId={draftId} />
              </div>
            </div>
          </div>
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

export const DraftEditor: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!draftId) {
      navigate('/dashboard');
      return;
    }
  }, [draftId, navigate]);

  if (!draftId) {
    return null;
  }

  return (
    <CollaborationProvider draftId={draftId}>
      <DraftEditorContent draftId={draftId} />
    </CollaborationProvider>
  );
};
