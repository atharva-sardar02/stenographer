import { FileCard } from './FileCard';
import { FileDocument } from '../../services/file.service';
import { EmptyState } from '../common/EmptyState';

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
      <EmptyState
        icon="📎"
        title="No files uploaded yet"
        description="Upload your first file to get started with OCR processing and draft generation."
      />
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

