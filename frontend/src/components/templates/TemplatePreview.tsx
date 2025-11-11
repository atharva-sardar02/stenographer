import { Template } from '../../services/template.service';

interface TemplatePreviewProps {
  template: Template;
  variableValues?: Record<string, string>;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  variableValues = {},
}) => {
  const replaceVariables = (content: string): string => {
    let result = content;
    template.variables.forEach((variable) => {
      const value =
        variableValues[variable.name] ||
        variable.defaultValue ||
        `[${variable.label}]`;
      const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
      </div>

      <div className="space-y-6">
        {/* Facts Section */}
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            {template.sections.facts.title || 'Facts Section'}
          </h4>
          <div className="prose max-w-none">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {replaceVariables(template.sections.facts.content) ||
                '[Facts section content will be generated here]'}
            </p>
          </div>
        </div>

        {/* Liability Section */}
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            {template.sections.liability.title || 'Liability Section'}
          </h4>
          <div className="prose max-w-none">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {replaceVariables(template.sections.liability.content) ||
                '[Liability section content will be generated here]'}
            </p>
          </div>
        </div>

        {/* Damages Section */}
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            {template.sections.damages.title || 'Damages Section'}
          </h4>
          <div className="prose max-w-none">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {replaceVariables(template.sections.damages.content) ||
                '[Damages section content will be generated here]'}
            </p>
          </div>
        </div>

        {/* Demand Section */}
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            {template.sections.demand.title || 'Demand Section'}
          </h4>
          <div className="prose max-w-none">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {replaceVariables(template.sections.demand.content) ||
                '[Demand section content will be generated here]'}
            </p>
          </div>
        </div>
      </div>

      {/* Variables Info */}
      {template.variables.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h5 className="text-sm font-semibold text-gray-900 mb-2">
            Template Variables
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {template.variables.map((variable) => (
              <div key={variable.name} className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {variable.name}
                </code>
                <span className="text-gray-600">{variable.label}</span>
                {variable.required && (
                  <span className="text-red-600">*</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

