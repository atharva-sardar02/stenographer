import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, auth, functions } from '../config/firebase';

// File type definition (matches shared/types/file.ts)
export interface FileDocument {
  fileId: string;
  matterId: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'png' | 'jpg' | 'jpeg';
  size: number;
  storagePath: string;
  uploadedBy: string;
  uploadedAt: Date | string;
  ocrStatus: 'pending' | 'processing' | 'done' | 'failed' | null;
  ocrText: string | null;
  ocrConfidence: number | null;
  ocrPages: number | null;
  ocrError: string | null;
  purgeAt: Date | string;
  isPurged: boolean;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

/**
 * File Service - Handles file uploads to Firebase Storage and Firestore operations
 */
export class FileService {
  /**
   * Upload a file to Firebase Storage and create Firestore document
   */
  static async uploadFile(
    matterId: string,
    file: globalThis.File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      console.log('[FileService] Starting upload:', { matterId, fileName: file.name, fileSize: file.size, userId });
      
      // Generate unique file ID
      const fileId = doc(collection(db, 'matters', matterId, 'files')).id;
      const storagePath = `matters/${matterId}/files/${fileId}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      console.log('[FileService] Storage ref created:', { fileId, storagePath });

      // Upload file to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, file);
      console.log('[FileService] Upload task created');

      // Track upload progress
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              ),
            };
            onProgress?.(progress);
          },
          (error) => {
            console.error('[FileService] Upload error:', error);
            console.error('[FileService] Error details:', {
              code: error.code,
              message: error.message,
              serverResponse: error.serverResponse,
            });
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            try {
              console.log('[FileService] Upload completed, creating Firestore document');
              
              // Calculate purge date (7 days from now)
              const purgeAt = new Date();
              purgeAt.setDate(purgeAt.getDate() + 7);

              // Create Firestore document
              const fileData = {
                fileId,
                matterId,
                name: file.name,
                type: this.getFileType(file.name),
                size: file.size,
                storagePath,
                uploadedBy: userId,
                uploadedAt: serverTimestamp(),
                ocrStatus: null,
                ocrText: null,
                ocrConfidence: null,
                ocrPages: null,
                ocrError: null,
                purgeAt: Timestamp.fromDate(purgeAt),
                isPurged: false,
              };

              console.log('[FileService] Adding Firestore document:', fileData);
              await addDoc(
                collection(db, 'matters', matterId, 'files'),
                fileData
              );

              console.log('[FileService] Upload successful, fileId:', fileId);
              resolve(fileId);
            } catch (error: any) {
              console.error('[FileService] Error finalizing upload:', error);
              reject(new Error(`Failed to finalize upload: ${error.message}`));
            }
          }
        );
      });
    } catch (error: any) {
      console.error('[FileService] Upload failed with exception:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Get all files for a matter
   */
  static async getFiles(matterId: string): Promise<FileDocument[]> {
    try {
      const filesRef = collection(db, 'matters', matterId, 'files');
      const q = query(filesRef, orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const files: FileDocument[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Handle purgeAt - could be Timestamp or string (for backward compatibility)
        let purgeAtDate: Date;
        if (data.purgeAt?.toDate) {
          // It's a Firestore Timestamp
          purgeAtDate = data.purgeAt.toDate();
        } else if (typeof data.purgeAt === 'string') {
          // It's an ISO string (old format)
          purgeAtDate = new Date(data.purgeAt);
        } else {
          // Fallback
          purgeAtDate = new Date();
        }

        files.push({
          fileId: doc.id,
          matterId: data.matterId,
          name: data.name,
          type: data.type,
          size: data.size,
          storagePath: data.storagePath,
          uploadedBy: data.uploadedBy,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          ocrStatus: data.ocrStatus || null,
          ocrText: data.ocrText || null,
          ocrConfidence: data.ocrConfidence || null,
          ocrPages: data.ocrPages || null,
          ocrError: data.ocrError || null,
          purgeAt: purgeAtDate,
          isPurged: data.isPurged || false,
        });
      });

      return files;
    } catch (error: any) {
      throw new Error(`Failed to get files: ${error.message}`);
    }
  }

  /**
   * Get a single file by ID
   */
  static async getFile(matterId: string, fileId: string): Promise<FileDocument | null> {
    try {
      const fileRef = doc(db, 'matters', matterId, 'files', fileId);
      const fileSnap = await getDoc(fileRef);

      if (!fileSnap.exists()) {
        return null;
      }

      const data = fileSnap.data();
      // Handle purgeAt - could be Timestamp or string (for backward compatibility)
      let purgeAtDate: Date;
      if (data.purgeAt?.toDate) {
        // It's a Firestore Timestamp
        purgeAtDate = data.purgeAt.toDate();
      } else if (typeof data.purgeAt === 'string') {
        // It's an ISO string (old format)
        purgeAtDate = new Date(data.purgeAt);
      } else {
        // Fallback
        purgeAtDate = new Date();
      }

      return {
        fileId: fileSnap.id,
        matterId: data.matterId,
        name: data.name,
        type: data.type,
        size: data.size,
        storagePath: data.storagePath,
        uploadedBy: data.uploadedBy,
        uploadedAt: data.uploadedAt?.toDate() || new Date(),
        ocrStatus: data.ocrStatus || null,
        ocrText: data.ocrText || null,
        ocrConfidence: data.ocrConfidence || null,
        ocrPages: data.ocrPages || null,
        ocrError: data.ocrError || null,
        purgeAt: purgeAtDate,
        isPurged: data.isPurged || false,
      };
    } catch (error: any) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  /**
   * Delete a file (removes from Storage and Firestore)
   */
  static async deleteFile(matterId: string, fileId: string): Promise<void> {
    try {
      // Get file document to get storage path
      const file = await this.getFile(matterId, fileId);
      if (!file) {
        throw new Error('File not found');
      }

      // Delete from Storage
      const storageRef = ref(storage, file.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      const fileRef = doc(db, 'matters', matterId, 'files', fileId);
      await deleteDoc(fileRef);
    } catch (error: any) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get download URL for a file
   */
  static async getDownloadUrl(storagePath: string): Promise<string> {
    try {
      const storageRef = ref(storage, storagePath);
      return await getDownloadURL(storageRef);
    } catch (error: any) {
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
  }

  /**
   * Trigger OCR processing for a file
   */
  static async triggerOcr(
    matterId: string,
    fileId: string,
    storagePath: string
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get file to determine file type
      const file = await this.getFile(matterId, fileId);
      if (!file) {
        throw new Error('File not found');
      }

      // Update file status to processing
      const fileRef = doc(db, 'matters', matterId, 'files', fileId);
      await updateDoc(fileRef, {
        ocrStatus: 'processing',
        ocrError: null,
      });

      // Call Firebase Function OCR endpoint
      const functionUrl = 'https://us-central1-stenographer-dev.cloudfunctions.net/ocrExtract';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          matterId,
          fileId,
          storagePath,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to trigger OCR' }));
        throw new Error(errorData.message || 'Failed to trigger OCR');
      }

      // OCR processing is now in progress, the function will update the file status
    } catch (error: any) {
      // Update file status to failed
      const fileRef = doc(db, 'matters', matterId, 'files', fileId);
      await updateDoc(fileRef, {
        ocrStatus: 'failed',
        ocrError: error.message || 'Failed to trigger OCR',
      });
      throw new Error(`Failed to trigger OCR: ${error.message}`);
    }
  }

  /**
   * Extract text from a TXT file manually (workaround for trigger issues)
   */
  static async extractTextFromFile(matterId: string, fileId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const extractText = httpsCallable(functions, 'extractTextFromFile');
      const result = await extractText({ matterId, fileId });
      
      if (!(result.data as any).success) {
        throw new Error('Text extraction failed');
      }
    } catch (error: any) {
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  /**
   * Determine file type from filename
   */
  private static getFileType(filename: string): 'pdf' | 'docx' | 'txt' | 'png' | 'jpg' | 'jpeg' {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (extension === '.pdf') return 'pdf';
    if (extension === '.docx') return 'docx';
    if (extension === '.png') return 'png';
    if (extension === '.jpg') return 'jpg';
    if (extension === '.jpeg') return 'jpeg';
    return 'txt';
  }
}

