import { TemplateVariable } from '../../services/template.service';

interface VariableInputFormProps {
  variables: TemplateVariable[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

export const VariableInputForm: React.FC<VariableInputFormProps> = ({
  variables,
  values,
  onChange,
}) => {
  const handleChange = (name: string, value: any) => {
    onChange({
      ...values,
      [name]: value,
    });
  };

  if (variables.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md">
        This template has no variables.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-900">
        Template Variables
      </h4>
      {variables.map((variable) => {
        const value = values[variable.name] || variable.defaultValue || '';

        return (
          <div key={variable.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {variable.label}
              {variable.required && <span className="text-red-600 ml-1">*</span>}
            </label>
            {variable.type === 'date' ? (
              <input
                type="date"
                value={value}
                onChange={(e) => handleChange(variable.name, e.target.value)}
                required={variable.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : variable.type === 'number' ? (
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  handleChange(variable.name, parseFloat(e.target.value) || 0)
                }
                required={variable.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(variable.name, e.target.value)}
                required={variable.required}
                placeholder={variable.defaultValue || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {variable.defaultValue && (
              <p className="mt-1 text-xs text-gray-500">
                Default: {variable.defaultValue}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

