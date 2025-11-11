import { FileDocument } from '../../services/file.service';

interface OcrStatusBadgeProps {
  file: FileDocument;
}

export const OcrStatusBadge: React.FC<OcrStatusBadgeProps> = ({ file }) => {
  if (!file.ocrStatus) {
    return null;
  }

  const getStatusConfig = () => {
    switch (file.ocrStatus) {
      case 'pending':
        return {
          label: 'OCR Pending',
          className: 'bg-yellow-100 text-yellow-800',
          icon: '⏳',
        };
      case 'processing':
        return {
          label: 'Processing OCR',
          className: 'bg-blue-100 text-blue-800',
          icon: '🔄',
        };
      case 'done':
        const needsReview = file.ocrConfidence !== null && file.ocrConfidence < 50;
        return {
          label: needsReview
            ? `OCR Complete (Needs Review - ${file.ocrConfidence}% confidence)`
            : `OCR Complete (${file.ocrConfidence}% confidence)`,
          className: needsReview
            ? 'bg-orange-100 text-orange-800'
            : 'bg-green-100 text-green-800',
          icon: needsReview ? '⚠️' : '✅',
        };
      case 'failed':
        return {
          label: `OCR Failed${file.ocrError ? `: ${file.ocrError}` : ''}`,
          className: 'bg-red-100 text-red-800',
          icon: '❌',
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();
  if (!statusConfig) return null;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}
        title={
          file.ocrPages
            ? `${file.ocrPages} page(s) processed`
            : 'OCR status information'
        }
      >
        <span className="mr-1">{statusConfig.icon}</span>
        {statusConfig.label}
      </span>
      {file.ocrPages && (
        <span className="text-xs text-gray-500">
          {file.ocrPages} page{file.ocrPages !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

