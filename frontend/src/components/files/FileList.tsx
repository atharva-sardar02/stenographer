import { FileCard } from './FileCard';
import { FileDocument } from '../../services/file.service';

interface FileListProps {
  files: FileDocument[];
  matterId: string;
  onFileDeleted: (fileId: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  matterId,
  onFileDeleted,
}) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-2">No files uploaded yet.</p>
        <p className="text-sm text-gray-500">
          Upload files using the upload area above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <FileCard
          key={file.fileId}
          file={file}
          matterId={matterId}
          onDelete={onFileDeleted}
        />
      ))}
    </div>
  );
};

