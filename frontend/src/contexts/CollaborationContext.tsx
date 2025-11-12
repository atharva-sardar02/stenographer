import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

interface ActiveEditor {
  userId: string;
  userName: string;
  lastActiveAt: Date | string;
}

interface Change {
  changeId: string;
  userId: string;
  userName: string;
  timestamp: Date | string;
  type: 'insert' | 'delete' | 'format' | 'refinement';
  section: 'facts' | 'liability' | 'damages' | 'demand';
  position?: number;
  content?: string;
  description: string;
}

interface CollaborationContextType {
  activeEditors: ActiveEditor[];
  changes: Change[];
  loading: boolean;
  error: string | null;
  updatePresence: () => Promise<void>;
  recordChange: (change: Omit<Change, 'changeId' | 'timestamp'>) => Promise<void>;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

interface CollaborationProviderProps {
  children: React.ReactNode;
  draftId: string;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  draftId,
}) => {
  const { user, userProfile } = useAuth();
  const [activeEditors, setActiveEditors] = useState<ActiveEditor[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update presence every 10 seconds
  const updatePresence = async () => {
    if (!user || !userProfile || !draftId) return;

    try {
      const collaborationRef = doc(db, 'drafts', draftId, 'collaboration', 'data');
      const editor: ActiveEditor = {
        userId: user.uid,
        userName: userProfile.displayName || user.email || 'Unknown',
        lastActiveAt: new Date(),
      };

      // Get current document to check if we need to add or update
      const currentDoc = await getDoc(collaborationRef);
      
      if (!currentDoc.exists()) {
        // Create collaboration document
        await setDoc(collaborationRef, {
          activeEditors: [editor],
          changes: [],
          updatedAt: serverTimestamp(),
        });
      } else {
        // Update or add editor
        const data = currentDoc.data();
        const existingEditors = (data?.activeEditors || []) as ActiveEditor[];
        const editorIndex = existingEditors.findIndex((e) => e.userId === user.uid);

        if (editorIndex >= 0) {
          // Update existing editor
          const updatedEditors = [...existingEditors];
          updatedEditors[editorIndex] = editor;
          await updateDoc(collaborationRef, {
            activeEditors: updatedEditors,
            updatedAt: serverTimestamp(),
          });
        } else {
          // Add new editor
          await updateDoc(collaborationRef, {
            activeEditors: arrayUnion(editor),
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (err: any) {
      console.error('Error updating presence:', err);
      setError(err.message);
    }
  };

  // Record a change
  const recordChange = async (change: Omit<Change, 'changeId' | 'timestamp'>) => {
    if (!user || !userProfile || !draftId) return;

    try {
      const collaborationRefForChange = doc(db, 'drafts', draftId, 'collaboration', 'data');
      const changeId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newChange: Change = {
        changeId,
        ...change,
        timestamp: new Date(),
      };

      // Get current changes and limit to last 100
      const currentDoc = await getDoc(collaborationRefForChange);
      const currentChanges = (currentDoc.data()?.changes || []) as Change[];
      const updatedChanges = [newChange, ...currentChanges].slice(0, 100);

      await updateDoc(collaborationRefForChange, {
        changes: updatedChanges,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error recording change:', err);
      setError(err.message);
    }
  };

  // Set up Firestore listener
  useEffect(() => {
    if (!draftId) return;

    setLoading(true);
    const collaborationRef = doc(db, 'drafts', draftId, 'collaboration', 'data');

    const unsubscribe = onSnapshot(
      collaborationRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const editors = (data?.activeEditors || []) as ActiveEditor[];
          const changeList = (data?.changes || []) as Change[];

          // Filter out inactive editors (30 seconds)
          const now = new Date();
          const activeEditorsFiltered = editors.filter((editor) => {
            const lastActive = editor.lastActiveAt instanceof Timestamp
              ? editor.lastActiveAt.toDate()
              : new Date(editor.lastActiveAt);
            const secondsSinceActive = (now.getTime() - lastActive.getTime()) / 1000;
            return secondsSinceActive < 30;
          });

          setActiveEditors(activeEditorsFiltered);
          setChanges(changeList);
        } else {
          setActiveEditors([]);
          setChanges([]);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Collaboration listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Initial presence update
    if (user && userProfile) {
      updatePresence();
    }

    // Set up periodic presence updates (every 10 seconds)
    presenceIntervalRef.current = setInterval(() => {
      updatePresence();
    }, 10000);

    // Cleanup on unmount
    return () => {
      unsubscribe();
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }

      // Remove user from active editors on disconnect
      if (user && draftId) {
        const collaborationRef = doc(db, 'drafts', draftId, 'collaboration', 'data');
        updateDoc(collaborationRef, {
          activeEditors: arrayRemove({
            userId: user.uid,
            userName: userProfile?.displayName || user.email || 'Unknown',
            lastActiveAt: new Date(),
          }),
          updatedAt: serverTimestamp(),
        }).catch(console.error);
      }
    };
  }, [draftId, user, userProfile]);

  const value: CollaborationContextType = {
    activeEditors,
    changes,
    loading,
    error,
    updatePresence,
    recordChange,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

