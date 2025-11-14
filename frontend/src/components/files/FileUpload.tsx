import { useState, useRef, DragEvent } from 'react';
import { FileService, UploadProgress } from '../../services/file.service';
import { validateFile, formatFileSize } from '../../utils/validators';
import { RetentionWarning } from '../common/RetentionWarning';

interface FileUploadProps {
  matterId: string;
  userId: string;
  onUploadSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  matterId,
  userId,
  onUploadSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[FileUpload] handleFileSelect called:', e.target.files);
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('[FileUpload] File selected:', files[0].name);
      handleFileUpload(files[0]);
    } else {
      console.warn('[FileUpload] No files selected');
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log('[FileUpload] handleFileUpload called:', { fileName: file.name, fileSize: file.size, matterId, userId });
    setError(null);
    setUploadProgress(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      console.error('[FileUpload] File validation failed:', validation.error);
      setError(validation.error || 'Invalid file');
      return;
    }

    console.log('[FileUpload] File validation passed, starting upload');
    setUploading(true);

    try {
      await FileService.uploadFile(
        matterId,
        file,
        userId,
        (progress) => {
          console.log('[FileUpload] Upload progress:', progress);
          setUploadProgress(progress);
        }
      );

      console.log('[FileUpload] Upload successful');
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadProgress(null);
      onUploadSuccess();
    } catch (err: any) {
      console.error('[FileUpload] Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <RetentionWarning type="file" />
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

        {uploading && uploadProgress ? (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Uploading... {uploadProgress.percentage}% (
              {formatFileSize(uploadProgress.bytesTransferred)} /{' '}
              {formatFileSize(uploadProgress.totalBytes)})
            </p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Select File
              </button>
              <p className="mt-2 text-sm text-gray-600">
                or drag and drop
              </p>
            </div>
                <p className="mt-2 text-xs text-gray-500">
                  PDF, DOCX, TXT, PNG, JPG, JPEG up to 10MB
                </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

