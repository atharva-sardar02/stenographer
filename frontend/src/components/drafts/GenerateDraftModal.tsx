import { useState, useEffect } from 'react';
import { TemplateService, Template } from '../../services/template.service';
import { FileService, FileDocument } from '../../services/file.service';
import { DraftService, GenerateDraftData } from '../../services/draft.service';
import { VariableInputForm } from './VariableInputForm';
import { GenerationProgress } from './GenerationProgress';

interface GenerateDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (draftId: string) => void;
  matterId: string;
}

export const GenerateDraftModal: React.FC<GenerateDraftModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  matterId,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [generating, setGenerating] = useState(false);
  const [currentSection, setCurrentSection] = useState<
    'facts' | 'liability' | 'damages' | 'demand' | null
  >(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = templates.find((t) => t.templateId === selectedTemplateId);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadFiles();
    }
  }, [isOpen, matterId]);

  const loadTemplates = async () => {
    try {
      const data = await TemplateService.getTemplates({ activeOnly: true });
      setTemplates(data);
    } catch (err: any) {
      setError(`Failed to load templates: ${err.message}`);
    }
  };

  const loadFiles = async () => {
    try {
      const data = await FileService.getFiles(matterId);
      setFiles(data);
    } catch (err: any) {
      setError(`Failed to load files: ${err.message}`);
    }
  };

  const handleFileToggle = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleGenerate = async () => {
    if (!selectedTemplateId) {
      setError('Please select a template');
      return;
    }

    if (selectedFileIds.length === 0) {
      setError('Please select at least one source file');
      return;
    }

    // Validate required variables
    if (selectedTemplate) {
      const requiredVars = selectedTemplate.variables.filter((v) => v.required);
      for (const variable of requiredVars) {
        if (!variableValues[variable.name] || variableValues[variable.name].toString().trim() === '') {
          setError(`Please fill in required variable: ${variable.label}`);
          return;
        }
      }
    }

    setError(null);
    setGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const sections: Array<'facts' | 'liability' | 'damages' | 'demand'> = [
        'facts',
        'liability',
        'damages',
        'demand',
      ];

      for (let i = 0; i < sections.length; i++) {
        setCurrentSection(sections[i]);
        setProgress(((i + 1) / sections.length) * 100);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate generation time
      }

      const draftData: GenerateDraftData = {
        matterId,
        templateId: selectedTemplateId,
        fileIds: selectedFileIds,
        variables: variableValues,
      };

      const draftId = await DraftService.generateDraft(draftData);
      onSuccess(draftId);
      onClose();
    } catch (err: any) {
      setError(`Failed to generate draft: ${err.message}`);
    } finally {
      setGenerating(false);
      setCurrentSection(null);
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Generate Draft</h2>
            <button
              onClick={onClose}
              disabled={generating}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {generating ? (
            <div className="space-y-6">
              <GenerationProgress
                currentSection={currentSection}
                progress={progress}
                estimatedTimeRemaining={Math.max(0, 45 - Math.floor(progress / 100 * 45))}
              />
              <p className="text-sm text-gray-600 text-center">
                This may take up to 45 seconds. Please do not close this window.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template *
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    setVariableValues({});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a template...</option>
                  {templates.map((template) => (
                    <option key={template.templateId} value={template.templateId}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Files Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Source Files *
                </label>
                <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
                  {files.length === 0 ? (
                    <p className="text-sm text-gray-500">No files available</p>
                  ) : (
                    <div className="space-y-2">
                      {files.map((file) => (
                        <label
                          key={file.fileId}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFileIds.includes(file.fileId)}
                            onChange={() => handleFileToggle(file.fileId)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({file.type.toUpperCase()})
                          </span>
                          {file.ocrStatus === 'done' && (
                            <span className="text-xs text-green-600">✓ OCR Complete</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Variable Inputs */}
              {selectedTemplate && (
                <div className="border-t pt-6">
                  <VariableInputForm
                    variables={selectedTemplate.variables}
                    values={variableValues}
                    onChange={setVariableValues}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!selectedTemplateId || selectedFileIds.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Draft
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

