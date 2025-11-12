import { auth } from '../config/firebase';

export interface ExportDraftData {
  draftId: string;
  matterId: string;
  content: {
    facts: string;
    liability: string;
    damages: string;
    demand: string;
  };
  options?: {
    matterTitle?: string;
    clientName?: string;
    includeHeader?: boolean;
    includeFooter?: boolean;
  };
}

export class ExportService {
  /**
   * Generates a DOCX export from a draft
   */
  static async exportDraft(data: ExportDraftData): Promise<{ downloadUrl: string; exportId: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call Firebase Function directly by name (Firebase Functions are accessed by function name, not path)
      const functionUrl = 'https://us-central1-stenographer-dev.cloudfunctions.net/exportGenerate';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          ...data,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate export');
      }

      const result = await response.json();
      return {
        downloadUrl: result.downloadUrl,
        exportId: result.exportId,
      };
    } catch (error: any) {
      throw new Error(`Failed to export draft: ${error.message}`);
    }
  }

  /**
   * Downloads a file from a URL
   */
  static downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

