import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { FileUpload } from '../../src/components/files/FileUpload';
import * as fileService from '../../src/services/file.service';

// Mock services
vi.mock('../../src/services/file.service');
vi.mock('../../src/config/firebase', () => ({
  storage: {},
  db: {},
}));

describe('File Upload Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render file upload component', () => {
    render(
      <BrowserRouter>
        <FileUpload
          matterId="test-matter"
          userId="test-user"
          onUploadSuccess={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
  });

  it('should validate file type', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <BrowserRouter>
        <FileUpload
          matterId="test-matter"
          userId="test-user"
          onUploadSuccess={onSuccess}
        />
      </BrowserRouter>
    );

    const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });

    expect(fileService.FileService.uploadFile).not.toHaveBeenCalled();
  });

  it('should validate file size', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <BrowserRouter>
        <FileUpload
          matterId="test-matter"
          userId="test-user"
          onUploadSuccess={onSuccess}
        />
      </BrowserRouter>
    );

    // Create a file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await user.upload(input, largeFile);

    await waitFor(() => {
      expect(screen.getByText(/file size exceeds/i)).toBeInTheDocument();
    });

    expect(fileService.FileService.uploadFile).not.toHaveBeenCalled();
  });

  it('should upload valid PDF file', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(fileService.FileService.uploadFile).mockResolvedValue('file-id');

    render(
      <BrowserRouter>
        <FileUpload
          matterId="test-matter"
          userId="test-user"
          onUploadSuccess={onSuccess}
        />
      </BrowserRouter>
    );

    const validFile = new File(['pdf content'], 'document.pdf', {
      type: 'application/pdf',
    });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await user.upload(input, validFile);

    await waitFor(() => {
      expect(fileService.FileService.uploadFile).toHaveBeenCalledWith(
        'test-matter',
        validFile,
        'test-user',
        expect.any(Function)
      );
    });
  });
});

