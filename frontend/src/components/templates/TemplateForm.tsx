import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  TemplateService,
  CreateTemplateData,
  TemplateSection,
} from '../../services/template.service';
import { SectionEditor } from './SectionEditor';
import { VariableManager } from './VariableManager';
import { useAuth } from '../../hooks/useAuth';

const defaultSection: TemplateSection = {
  title: '',
  prompt: '',
  content: '',
};

export const TemplateForm: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const { user } = useAuth();
  const isEditing = !!templateId;

  const [formData, setFormData] = useState<CreateTemplateData>({
    name: '',
    description: '',
    sections: {
      facts: { ...defaultSection },
      liability: { ...defaultSection },
      damages: { ...defaultSection },
      demand: { ...defaultSection },
    },
    variables: [],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load template if editing
  useEffect(() => {
    if (isEditing && templateId) {
      const loadTemplate = async () => {
        try {
          const template = await TemplateService.getTemplate(templateId);
          if (template) {
            setFormData({
              name: template.name,
              description: template.description,
              sections: template.sections,
              variables: template.variables,
              isActive: template.isActive,
            });
          } else {
            setError('Template not found');
          }
        } catch (err: any) {
          setError(err.message);
        }
      };
      loadTemplate();
    }
  }, [isEditing, templateId]);

  const handleSectionChange = (
    sectionName: 'facts' | 'liability' | 'damages' | 'demand',
    section: TemplateSection
  ) => {
    setFormData({
      ...formData,
      sections: {
        ...formData.sections,
        [sectionName]: section,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Template description is required');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && templateId) {
        await TemplateService.updateTemplate(templateId, formData);
      } else {
        if (!user?.uid) {
          throw new Error('User not authenticated');
        }
        await TemplateService.createTemplate(formData, user.uid);
      }
      navigate('/templates');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
                <Link
                  to="/templates"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Back to Templates
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
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
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEditing
              ? 'Update template details and sections'
              : 'Create a new demand letter template with customizable sections'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Standard Personal Injury Demand Letter"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the purpose and use case for this template..."
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active (available for use)
            </label>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Template Sections
          </h2>

          <SectionEditor
            section={formData.sections.facts}
            sectionName="facts"
            onChange={(section) => handleSectionChange('facts', section)}
          />

          <SectionEditor
            section={formData.sections.liability}
            sectionName="liability"
            onChange={(section) => handleSectionChange('liability', section)}
          />

          <SectionEditor
            section={formData.sections.damages}
            sectionName="damages"
            onChange={(section) => handleSectionChange('damages', section)}
          />

          <SectionEditor
            section={formData.sections.demand}
            sectionName="demand"
            onChange={(section) => handleSectionChange('demand', section)}
          />
        </div>

        {/* Variables */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <VariableManager
            variables={formData.variables}
            onChange={(variables) =>
              setFormData({ ...formData, variables })
            }
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </form>
      </main>
    </div>
  );
};

