import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TemplateService, Template } from '../services/template.service';
import { TemplateCard } from '../components/templates/TemplateCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../hooks/useAuth';

export const Templates: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);

  // Check if user is attorney (can create/edit templates)
  const isAttorney = userProfile?.role === 'attorney';

  useEffect(() => {
    loadTemplates();
  }, [activeOnly, searchQuery]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await TemplateService.getTemplates({
        activeOnly,
        searchQuery: searchQuery || undefined,
      });
      setTemplates(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await TemplateService.deleteTemplate(templateId);
      await loadTemplates();
    } catch (err: any) {
      alert(`Failed to delete template: ${err.message}`);
    }
  };

  return (
    <main id="main-content" className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage demand letter templates
          </p>
        </div>
        {isAttorney && (
          <Link
            to="/templates/new"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New Template
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name or description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="activeOnly"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="activeOnly" className="ml-2 text-sm text-gray-700">
            Active only
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Loading templates..." />
        </div>
      )}

      {/* Templates List */}
      {!loading && templates.length === 0 && (
        <EmptyState
          icon="📋"
          title="No templates found"
          description={
            searchQuery || !activeOnly
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first template to get started with draft generation.'
          }
          action={
            !searchQuery && activeOnly && isAttorney
              ? {
                  label: 'Create Template',
                  onClick: () => navigate('/templates/new'),
                }
              : undefined
          }
        />
      )}

      {!loading && templates.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.templateId}
              template={template}
              onDelete={isAttorney ? handleDelete : undefined}
              canEdit={isAttorney}
            />
          ))}
        </div>
      )}
    </main>
  );
};

