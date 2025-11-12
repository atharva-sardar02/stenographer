import React from 'react';

interface RetentionWarningProps {
  type?: 'file' | 'export';
}

export const RetentionWarning: React.FC<RetentionWarningProps> = ({ type = 'file' }) => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-yellow-400 text-xl">⚠️</span>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {type === 'file'
              ? 'Files are automatically deleted after 7 days. Export important documents to save permanently.'
              : 'Exports are automatically deleted after 7 days. Download important files to save permanently.'}
          </p>
        </div>
      </div>
    </div>
  );
};

