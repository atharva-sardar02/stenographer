import { TemplateSection } from '../../services/template.service';

interface SectionEditorProps {
  section: TemplateSection;
  sectionName: 'facts' | 'liability' | 'damages' | 'demand';
  onChange: (section: TemplateSection) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  sectionName,
  onChange,
}) => {
  const handleChange = (
    field: keyof TemplateSection,
    value: string
  ) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  const getSectionLabel = () => {
    switch (sectionName) {
      case 'facts':
        return 'Facts Section';
      case 'liability':
        return 'Liability Section';
      case 'damages':
        return 'Damages Section';
      case 'demand':
        return 'Demand Section';
      default:
        return 'Section';
    }
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
      <h4 className="text-sm font-semibold text-gray-900">
        {getSectionLabel()}
      </h4>

      {/* Section Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section Title
        </label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Statement of Facts"
        />
      </div>

      {/* Prompt Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          AI Prompt Instructions
        </label>
        <textarea
          value={section.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Instructions for the AI on how to generate this section..."
        />
        <p className="mt-1 text-xs text-gray-500">
          These instructions guide the AI in generating content for this section.
          Be specific about what information to include.
        </p>
      </div>

      {/* Default Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Content Template
        </label>
        <textarea
          value={section.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="Default content structure. Use {{variable_name}} for placeholders."
        />
        <p className="mt-1 text-xs text-gray-500">
          Default content structure. Use <code className="bg-gray-100 px-1 rounded">{`{{variable_name}}`}</code> for
          template variables.
        </p>
      </div>
    </div>
  );
};

