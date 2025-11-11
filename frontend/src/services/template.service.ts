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

// Template type definitions (matches shared/types/template.ts)
export interface TemplateSection {
  title: string;
  prompt: string;
  content: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date';
  required: boolean;
  defaultValue: string | null;
}

export interface Template {
  templateId: string;
  name: string;
  description: string;
  sections: {
    facts: TemplateSection;
    liability: TemplateSection;
    damages: TemplateSection;
    demand: TemplateSection;
  };
  variables: TemplateVariable[];
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive: boolean;
}

export interface CreateTemplateData {
  name: string;
  description: string;
  sections: {
    facts: TemplateSection;
    liability: TemplateSection;
    damages: TemplateSection;
    demand: TemplateSection;
  };
  variables: TemplateVariable[];
  isActive?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  sections?: {
    facts?: TemplateSection;
    liability?: TemplateSection;
    damages?: TemplateSection;
    demand?: TemplateSection;
  };
  variables?: TemplateVariable[];
  isActive?: boolean;
}

/**
 * Template Service - Handles all Firestore operations for templates
 */
export class TemplateService {
  /**
   * Create a new template
   */
  static async createTemplate(
    data: CreateTemplateData,
    userId: string
  ): Promise<string> {
    try {
      const templateData = {
        name: data.name.trim(),
        description: data.description.trim(),
        sections: data.sections,
        variables: data.variables || [],
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: data.isActive !== undefined ? data.isActive : true,
      };

      const docRef = await addDoc(collection(db, 'templates'), templateData);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }

  /**
   * Get a single template by ID
   */
  static async getTemplate(templateId: string): Promise<Template | null> {
    try {
      const templateRef = doc(db, 'templates', templateId);
      const templateSnap = await getDoc(templateRef);

      if (!templateSnap.exists()) {
        return null;
      }

      const data = templateSnap.data();
      return {
        templateId: templateSnap.id,
        name: data.name,
        description: data.description,
        sections: data.sections,
        variables: data.variables || [],
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isActive: data.isActive !== undefined ? data.isActive : true,
      };
    } catch (error: any) {
      throw new Error(`Failed to get template: ${error.message}`);
    }
  }

  /**
   * Get all templates
   * Supports filtering by active status and searching by name
   */
  static async getTemplates(options?: {
    activeOnly?: boolean;
    searchQuery?: string;
  }): Promise<Template[]> {
    try {
      let q = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));

      // Add active filter if specified
      if (options?.activeOnly) {
        q = query(
          collection(db, 'templates'),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      let templates: Template[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        templates.push({
          templateId: doc.id,
          name: data.name,
          description: data.description,
          sections: data.sections,
          variables: data.variables || [],
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          isActive: data.isActive !== undefined ? data.isActive : true,
        });
      });

      // Client-side search filtering if search query provided
      if (options?.searchQuery) {
        const searchLower = options.searchQuery.toLowerCase();
        templates = templates.filter((template) =>
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower)
        );
      }

      return templates;
    } catch (error: any) {
      throw new Error(`Failed to get templates: ${error.message}`);
    }
  }

  /**
   * Update a template
   */
  static async updateTemplate(
    templateId: string,
    data: UpdateTemplateData
  ): Promise<void> {
    try {
      const templateRef = doc(db, 'templates', templateId);
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (data.name !== undefined) {
        updateData.name = data.name.trim();
      }
      if (data.description !== undefined) {
        updateData.description = data.description.trim();
      }
      if (data.sections !== undefined) {
        updateData.sections = data.sections;
      }
      if (data.variables !== undefined) {
        updateData.variables = data.variables;
      }
      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }

      await updateDoc(templateRef, updateData);
    } catch (error: any) {
      throw new Error(`Failed to update template: ${error.message}`);
    }
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      const templateRef = doc(db, 'templates', templateId);
      await deleteDoc(templateRef);
    } catch (error: any) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }
}

