import { useState } from 'react';
import { TemplateVariable } from '../../services/template.service';

interface VariableManagerProps {
  variables: TemplateVariable[];
  onChange: (variables: TemplateVariable[]) => void;
}

export const VariableManager: React.FC<VariableManagerProps> = ({
  variables,
  onChange,
}) => {
  const [newVariable, setNewVariable] = useState<Partial<TemplateVariable>>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    defaultValue: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateVariableName = (name: string): boolean => {
    // Variable names must be alphanumeric with underscores only
    const nameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    return nameRegex.test(name);
  };

  const handleAddVariable = () => {
    const newErrors: Record<string, string> = {};

    if (!newVariable.name || !newVariable.name.trim()) {
      newErrors.name = 'Variable name is required';
    } else if (!validateVariableName(newVariable.name)) {
      newErrors.name =
        'Variable name must start with a letter and contain only letters, numbers, and underscores';
    } else if (
      variables.some((v) => v.name.toLowerCase() === newVariable.name!.toLowerCase())
    ) {
      newErrors.name = 'Variable name already exists';
    }

    if (!newVariable.label || !newVariable.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const variable: TemplateVariable = {
      name: newVariable.name!.trim(),
      label: newVariable.label!.trim(),
      type: newVariable.type || 'text',
      required: newVariable.required || false,
      defaultValue: newVariable.defaultValue || null,
    };

    onChange([...variables, variable]);
    setNewVariable({
      name: '',
      label: '',
      type: 'text',
      required: false,
      defaultValue: null,
    });
    setErrors({});
  };

  const handleDeleteVariable = (index: number) => {
    const updated = variables.filter((_, i) => i !== index);
    onChange(updated);
  };


  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Template Variables
        </h4>
        <p className="text-xs text-gray-500 mb-4">
          Variables can be used in template content as{' '}
          <code className="bg-gray-100 px-1 rounded">{`{{variable_name}}`}</code>
        </p>
      </div>

      {/* Existing Variables */}
      {variables.length > 0 && (
        <div className="space-y-2">
          {variables.map((variable, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-md"
            >
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs font-medium text-gray-700">
                    Name:
                  </span>
                  <code className="ml-1 text-xs bg-white px-2 py-1 rounded">
                    {variable.name}
                  </code>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-700">
                    Label:
                  </span>
                  <span className="ml-1 text-xs">{variable.label}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-700">
                    Type:
                  </span>
                  <span className="ml-1 text-xs capitalize">{variable.type}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-700">
                    Required:
                  </span>
                  <span className="ml-1 text-xs">
                    {variable.required ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteVariable(index)}
                className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Variable */}
      <div className="border-t pt-4">
        <h5 className="text-sm font-medium text-gray-900 mb-3">
          Add New Variable
        </h5>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Variable Name *
            </label>
            <input
              type="text"
              value={newVariable.name || ''}
              onChange={(e) => {
                setNewVariable({ ...newVariable, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., client_name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Use in template as: <code className="bg-gray-100 px-1 rounded">{`{{${newVariable.name || 'variable_name'}}}`}</code>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Label *
            </label>
            <input
              type="text"
              value={newVariable.label || ''}
              onChange={(e) => {
                setNewVariable({ ...newVariable, label: e.target.value });
                if (errors.label) setErrors({ ...errors, label: '' });
              }}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.label ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Client Name"
            />
            {errors.label && (
              <p className="mt-1 text-xs text-red-600">{errors.label}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={newVariable.type || 'text'}
                onChange={(e) =>
                  setNewVariable({
                    ...newVariable,
                    type: e.target.value as 'text' | 'number' | 'date',
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Default Value
              </label>
              <input
                type="text"
                value={newVariable.defaultValue || ''}
                onChange={(e) =>
                  setNewVariable({
                    ...newVariable,
                    defaultValue: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={newVariable.required || false}
              onChange={(e) =>
                setNewVariable({ ...newVariable, required: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 text-xs text-gray-700">
              Required field
            </label>
          </div>

          <button
            onClick={handleAddVariable}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Variable
          </button>
        </div>
      </div>
    </div>
  );
};

