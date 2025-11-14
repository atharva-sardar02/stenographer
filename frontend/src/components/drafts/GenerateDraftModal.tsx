import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      setError(null);
      const data = await TemplateService.getTemplates({ activeOnly: true });
      setTemplates(data);
      if (data.length === 0) {
        setError('No active templates found. Please create a template first.');
      }
    } catch (err: any) {
      setError(`Failed to load templates: ${err.message}`);
    } finally {
      setLoading(false);
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
    setCurrentSection('facts');

    try {
      const draftData: GenerateDraftData = {
        matterId,
        templateId: selectedTemplateId,
        fileIds: selectedFileIds,
        variables: variableValues,
      };

      // Show progress updates while generating
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // Don't go to 100% until complete
          return prev + 5;
        });
      }, 2000);

      // Update current section indicator
      const sectionInterval = setInterval(() => {
        setCurrentSection((prev) => {
          if (prev === 'facts') return 'liability';
          if (prev === 'liability') return 'damages';
          if (prev === 'damages') return 'demand';
          return 'facts';
        });
      }, 8000);

      try {
        const draftId = await DraftService.generateDraft(draftData);
        clearInterval(progressInterval);
        clearInterval(sectionInterval);
        setProgress(100);
        setCurrentSection('demand');
        
        // Small delay to show completion
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        onSuccess(draftId);
        onClose();
      } catch (err: any) {
        clearInterval(progressInterval);
        clearInterval(sectionInterval);
        throw err;
      }
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
                {loading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <span className="text-sm text-gray-500">Loading templates...</span>
                  </div>
                ) : (
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => {
                      setSelectedTemplateId(e.target.value);
                      setVariableValues({});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={templates.length === 0}
                  >
                    <option value="">
                      {templates.length === 0
                        ? 'No templates available - Create one first'
                        : 'Choose a template...'}
                    </option>
                    {templates.map((template) => (
                      <option key={template.templateId} value={template.templateId}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                )}
                {templates.length === 0 && !loading && (
                  <p className="mt-2 text-sm text-gray-500">
                    Go to{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 underline"
                      onClick={() => {
                        onClose();
                        navigate('/templates');
                      }}
                    >
                      Templates
                    </button>{' '}
                    to create your first template.
                  </p>
                )}
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
                      {files.map((file) => {
                        const needsOcr = ['pdf', 'png', 'jpg', 'jpeg'].includes(file.type);
                        const hasOcr = file.ocrStatus === 'done';
                        const isTextFile = file.type === 'txt';

                        return (
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
                            {isTextFile && (
                              <span className="text-xs text-green-600">✓ Text File</span>
                            )}
                            {needsOcr && hasOcr && (
                              <span className="text-xs text-green-600">✓ OCR Complete</span>
                            )}
                            {needsOcr && !hasOcr && (
                              <span className="text-xs text-gray-500" title="Will be skipped unless OCR is run">
                                No OCR
                              </span>
                            )}
                          </label>
                        );
                      })}
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

