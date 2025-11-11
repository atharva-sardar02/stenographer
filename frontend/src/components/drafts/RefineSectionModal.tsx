import { useState } from 'react';

interface RefineSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefine: (
    section: 'facts' | 'liability' | 'damages' | 'demand',
    instruction: string,
    keepExistingContent: boolean
  ) => Promise<void>;
  initialSection?: 'facts' | 'liability' | 'damages' | 'demand';
}

export const RefineSectionModal: React.FC<RefineSectionModalProps> = ({
  isOpen,
  onClose,
  onRefine,
  initialSection,
}) => {
  const [selectedSection, setSelectedSection] = useState<
    'facts' | 'liability' | 'damages' | 'demand'
  >(initialSection || 'facts');
  const [instruction, setInstruction] = useState('');
  const [keepExistingContent, setKeepExistingContent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!instruction.trim()) {
      setError('Please provide refinement instructions');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onRefine(selectedSection, instruction.trim(), keepExistingContent);
      onClose();
      setInstruction('');
    } catch (err: any) {
      setError(err.message || 'Failed to refine section');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Refine Section</h2>
            <button
              onClick={onClose}
              disabled={loading}
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

          <div className="space-y-6">
            {/* Section Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Section *
              </label>
              <select
                value={selectedSection}
                onChange={(e) =>
                  setSelectedSection(
                    e.target.value as 'facts' | 'liability' | 'damages' | 'demand'
                  )
                }
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="facts">Facts Section</option>
                <option value="liability">Liability Section</option>
                <option value="damages">Damages Section</option>
                <option value="demand">Demand Section</option>
              </select>
            </div>

            {/* Instruction Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refinement Instructions *
              </label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                disabled={loading}
                rows={6}
                placeholder="e.g., Add more detail on pain and suffering, or Expand on the medical expenses..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                Describe how you want to improve or modify this section
              </p>
            </div>

            {/* Keep Existing Content Option */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="keepExisting"
                checked={keepExistingContent}
                onChange={(e) => setKeepExistingContent(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 disabled:opacity-50"
              />
              <label htmlFor="keepExisting" className="ml-2 text-sm text-gray-700">
                <span className="font-medium">Keep existing content and expand</span>
                <p className="text-xs text-gray-500 mt-1">
                  If checked, the AI will improve and expand the existing content. If
                  unchecked, it will rewrite the section completely based on your
                  instructions.
                </p>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !instruction.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Refining...' : 'Refine Section'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

