import { Link } from 'react-router-dom';
import { Template } from '../../services/template.service';

interface TemplateCardProps {
  template: Template;
  onDelete?: (templateId: string) => void;
  canEdit?: boolean;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onDelete,
  canEdit = false,
}) => {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${template.name}"? This action cannot be undone.`
      )
    ) {
      onDelete?.(template.templateId);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {template.name}
            </h3>
            {template.isActive ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">{template.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span>{template.variables.length} variable(s)</span>
            <span>•</span>
            <span>Created {formatDate(template.createdAt)}</span>
            {template.updatedAt !== template.createdAt && (
              <>
                <span>•</span>
                <span>Updated {formatDate(template.updatedAt)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <Link
                to={`/templates/${template.templateId}/edit`}
                className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

