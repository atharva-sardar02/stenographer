import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';

// Draft type definitions (matches shared/types/draft.ts)
export interface DraftSection {
  content: string;
  generatedAt: Date | string | null;
}

export interface Draft {
  draftId: string;
  matterId: string;
  templateId: string | null;
  state: 'generating' | 'editing' | 'final';
  sections: {
    facts: DraftSection;
    liability: DraftSection;
    damages: DraftSection;
    demand: DraftSection;
  };
  variables: Record<string, any>;
  generatedBy: string;
  lastGeneratedAt: Date | string;
  lastEditedAt: Date | string;
  lastEditedBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  error?: string;
}

export interface GenerateDraftData {
  matterId: string;
  templateId: string;
  fileIds: string[];
  variables: Record<string, any>;
}

/**
 * Draft Service - Handles all Firestore operations for drafts
 */
export class DraftService {
  /**
   * Generate a new draft
   */
  static async generateDraft(data: GenerateDraftData): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call Firebase Function to generate draft
      const functionUrl = 'https://us-central1-stenographer-dev.cloudfunctions.net/draftGenerate';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          matterId: data.matterId,
          templateId: data.templateId,
          fileIds: data.fileIds,
          variables: data.variables || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate draft' }));
        throw new Error(errorData.message || 'Failed to generate draft');
      }

      const result = await response.json();
      return result.draftId;
    } catch (error: any) {
      throw new Error(`Failed to generate draft: ${error.message}`);
    }
  }

  /**
   * Get a single draft by ID
   */
  static async getDraft(draftId: string): Promise<Draft | null> {
    try {
      const draftRef = doc(db, 'drafts', draftId);
      const draftSnap = await getDoc(draftRef);

      if (!draftSnap.exists()) {
        return null;
      }

      const data = draftSnap.data();
      return {
        draftId: draftSnap.id,
        matterId: data.matterId,
        templateId: data.templateId,
        state: data.state,
        sections: data.sections,
        variables: data.variables || {},
        generatedBy: data.generatedBy,
        lastGeneratedAt: data.lastGeneratedAt?.toDate() || new Date(),
        lastEditedAt: data.lastEditedAt?.toDate() || new Date(),
        lastEditedBy: data.lastEditedBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        error: data.error,
      };
    } catch (error: any) {
      throw new Error(`Failed to get draft: ${error.message}`);
    }
  }

  /**
   * Get all drafts for a matter
   */
  static async getDrafts(matterId: string): Promise<Draft[]> {
    try {
      const q = query(
        collection(db, 'drafts'),
        where('matterId', '==', matterId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const drafts: Draft[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        drafts.push({
          draftId: doc.id,
          matterId: data.matterId,
          templateId: data.templateId,
          state: data.state,
          sections: data.sections,
          variables: data.variables || {},
          generatedBy: data.generatedBy,
          lastGeneratedAt: data.lastGeneratedAt?.toDate() || new Date(),
          lastEditedAt: data.lastEditedAt?.toDate() || new Date(),
          lastEditedBy: data.lastEditedBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          error: data.error,
        });
      });

      return drafts;
    } catch (error: any) {
      throw new Error(`Failed to get drafts: ${error.message}`);
    }
  }

  /**
   * Update a draft section
   */
  static async updateDraftSection(
    draftId: string,
    sectionName: 'facts' | 'liability' | 'damages' | 'demand',
    content: string
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const draftRef = doc(db, 'drafts', draftId);
      await updateDoc(draftRef, {
        [`sections.${sectionName}.content`]: content,
        [`sections.${sectionName}.generatedAt`]: serverTimestamp(),
        lastEditedAt: serverTimestamp(),
        lastEditedBy: user.uid,
        updatedAt: serverTimestamp(),
        state: 'editing',
      });
    } catch (error: any) {
      throw new Error(`Failed to update draft section: ${error.message}`);
    }
  }

  /**
   * Refine a specific section of a draft
   */
  static async refineSection(
    draftId: string,
    section: 'facts' | 'liability' | 'damages' | 'demand',
    instruction: string,
    _keepExistingContent: boolean = true
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // TODO: Call Firebase Function proxy to AWS Lambda
      // For now, update the section with a placeholder
      const draftRef = doc(db, 'drafts', draftId);
      await updateDoc(draftRef, {
        [`sections.${section}.content`]: `[Refinement in progress: ${instruction}]`,
        [`sections.${section}.generatedAt`]: serverTimestamp(),
        lastEditedAt: serverTimestamp(),
        lastEditedBy: user.uid,
        updatedAt: serverTimestamp(),
        state: 'editing',
      });

      // TODO: Trigger AWS Lambda refinement
      // const response = await fetch(
      //   `${import.meta.env.VITE_API_BASE_URL}/v1/drafts:refineSection`,
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${await user.getIdToken()}`,
      //     },
      //     body: JSON.stringify({
      //       draftId,
      //       section,
      //       instruction,
      //       keepExistingContent,
      //       userId: user.uid,
      //     }),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error('Failed to refine section');
      // }
    } catch (error: any) {
      throw new Error(`Failed to refine section: ${error.message}`);
    }
  }

  /**
   * Delete a draft
   */
  static async deleteDraft(draftId: string): Promise<void> {
    try {
      const draftRef = doc(db, 'drafts', draftId);
      await deleteDoc(draftRef);
    } catch (error: any) {
      throw new Error(`Failed to delete draft: ${error.message}`);
    }
  }
}

