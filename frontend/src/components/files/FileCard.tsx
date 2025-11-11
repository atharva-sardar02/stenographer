import { formatFileSize } from '../../utils/validators';
import { FileService, FileDocument } from '../../services/file.service';

interface FileCardProps {
  file: FileDocument;
  matterId: string;
  onDelete: (fileId: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, matterId, onDelete }) => {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (type: FileDocument['type']) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'txt':
        return '📋';
      default:
        return '📎';
    }
  };

  const getOcrStatusBadge = () => {
    if (!file.ocrStatus) return null;

    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          statusColors[file.ocrStatus] || 'bg-gray-100 text-gray-800'
        }`}
      >
        OCR: {file.ocrStatus}
      </span>
    );
  };

  const handleDownload = async () => {
    try {
      const url = await FileService.getDownloadUrl(file.storagePath);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        await FileService.deleteFile(matterId, file.fileId);
        onDelete(file.fileId);
      } catch (error: any) {
        alert(`Failed to delete file: ${error.message}`);
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl">{getFileIcon(file.type)}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span className="uppercase">{file.type}</span>
              <span>•</span>
              <span>Uploaded {formatDate(file.uploadedAt)}</span>
            </div>
            {getOcrStatusBadge() && (
              <div className="mt-2">{getOcrStatusBadge()}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
          >
            Download
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

