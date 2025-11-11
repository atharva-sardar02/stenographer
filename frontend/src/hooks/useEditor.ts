import { useState, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { DraftService } from '../services/draft.service';

interface UseEditorOptions {
  draftId: string;
  onSave?: () => void;
}

export const useEditor = (options: UseEditorOptions) => {
  const { draftId, onSave } = options;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<Editor | null>(null);

  const saveContent = useCallback(
    async (content: string, section: 'facts' | 'liability' | 'damages' | 'demand') => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          setError(null);
          await DraftService.updateDraftSection(draftId, section, content);
          setLastSaved(new Date());
          onSave?.();
        } catch (err: any) {
          setError(err.message || 'Failed to save');
          console.error('Save error:', err);
        } finally {
          setSaving(false);
        }
      }, 2000); // Debounce: save 2 seconds after last change
    },
    [draftId, onSave]
  );

  const setEditor = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  const getSaveStatus = useCallback(() => {
    if (saving) return 'Saving...';
    if (error) return 'Error saving';
    if (lastSaved) return `Saved ${lastSaved.toLocaleTimeString()}`;
    return 'Not saved';
  }, [saving, error, lastSaved]);

  return {
    saving,
    error,
    lastSaved,
    saveContent,
    setEditor,
    getSaveStatus,
  };
};

