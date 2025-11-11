import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Matter type definition (matches shared/types/matter.ts)
export interface Matter {
  matterId: string;
  title: string;
  clientName: string;
  status: 'active' | 'draft' | 'completed' | 'archived';
  participants: string[];
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateMatterData {
  title: string;
  clientName: string;
  status?: 'active' | 'draft' | 'completed' | 'archived';
  participants?: string[];
}

export interface UpdateMatterData {
  title?: string;
  clientName?: string;
  status?: 'active' | 'draft' | 'completed' | 'archived';
  participants?: string[];
}

/**
 * Matter Service - Handles all Firestore operations for matters
 */
export class MatterService {
  /**
   * Create a new matter
   */
  static async createMatter(
    data: CreateMatterData,
    userId: string
  ): Promise<string> {
    try {
      const matterData = {
        title: data.title.trim(),
        clientName: data.clientName.trim(),
        status: data.status || 'active',
        participants: data.participants || [userId],
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'matters'), matterData);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to create matter: ${error.message}`);
    }
  }

  /**
   * Get a single matter by ID
   */
  static async getMatter(matterId: string): Promise<Matter | null> {
    try {
      const matterRef = doc(db, 'matters', matterId);
      const matterSnap = await getDoc(matterRef);

      if (!matterSnap.exists()) {
        return null;
      }

      const data = matterSnap.data();
      return {
        matterId: matterSnap.id,
        title: data.title,
        clientName: data.clientName,
        status: data.status,
        participants: data.participants || [],
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error: any) {
      throw new Error(`Failed to get matter: ${error.message}`);
    }
  }

  /**
   * Get all matters for a user
   * Supports filtering by status and searching by title/client name
   */
  static async getMatters(
    userId: string,
    options?: {
      status?: 'active' | 'draft' | 'completed' | 'archived';
      searchQuery?: string;
    }
  ): Promise<Matter[]> {
    try {
      let q = query(
        collection(db, 'matters'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );

      // Add status filter if provided
      if (options?.status) {
        q = query(
          collection(db, 'matters'),
          where('createdBy', '==', userId),
          where('status', '==', options.status),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      let matters: Matter[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        matters.push({
          matterId: doc.id,
          title: data.title,
          clientName: data.clientName,
          status: data.status,
          participants: data.participants || [],
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      // Client-side search filtering if search query provided
      if (options?.searchQuery) {
        const searchLower = options.searchQuery.toLowerCase();
        matters = matters.filter(
          (matter) =>
            matter.title.toLowerCase().includes(searchLower) ||
            matter.clientName.toLowerCase().includes(searchLower)
        );
      }

      return matters;
    } catch (error: any) {
      throw new Error(`Failed to get matters: ${error.message}`);
    }
  }

  /**
   * Update a matter
   */
  static async updateMatter(
    matterId: string,
    data: UpdateMatterData
  ): Promise<void> {
    try {
      const matterRef = doc(db, 'matters', matterId);
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (data.title !== undefined) {
        updateData.title = data.title.trim();
      }
      if (data.clientName !== undefined) {
        updateData.clientName = data.clientName.trim();
      }
      if (data.status !== undefined) {
        updateData.status = data.status;
      }
      if (data.participants !== undefined) {
        updateData.participants = data.participants;
      }

      await updateDoc(matterRef, updateData);
    } catch (error: any) {
      throw new Error(`Failed to update matter: ${error.message}`);
    }
  }

  /**
   * Delete a matter (soft delete by setting status to 'archived')
   */
  static async deleteMatter(matterId: string): Promise<void> {
    try {
      await this.updateMatter(matterId, { status: 'archived' });
    } catch (error: any) {
      throw new Error(`Failed to delete matter: ${error.message}`);
    }
  }

  /**
   * Permanently delete a matter (hard delete)
   * Use with caution - this permanently removes the matter
   */
  static async permanentlyDeleteMatter(matterId: string): Promise<void> {
    try {
      const matterRef = doc(db, 'matters', matterId);
      await deleteDoc(matterRef);
    } catch (error: any) {
      throw new Error(`Failed to permanently delete matter: ${error.message}`);
    }
  }
}

