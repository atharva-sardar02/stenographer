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
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// File type definition (matches shared/types/file.ts)
export interface FileDocument {
  fileId: string;
  matterId: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt';
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
      // Generate unique file ID
      const fileId = doc(collection(db, 'matters', matterId, 'files')).id;
      const storagePath = `matters/${matterId}/files/${fileId}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      // Upload file to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, file);

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
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            try {
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
                purgeAt: purgeAt.toISOString(),
                isPurged: false,
              };

              await addDoc(
                collection(db, 'matters', matterId, 'files'),
                fileData
              );

              resolve(fileId);
            } catch (error: any) {
              reject(new Error(`Failed to finalize upload: ${error.message}`));
            }
          }
        );
      });
    } catch (error: any) {
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
          purgeAt: data.purgeAt?.toDate() || new Date(),
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
        purgeAt: data.purgeAt?.toDate() || new Date(),
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
   * Note: This requires AWS Lambda integration
   */
  static async triggerOcr(
    matterId: string,
    fileId: string,
    _storagePath: string
  ): Promise<void> {
    try {
      // Update file status to processing
      const fileRef = doc(db, 'matters', matterId, 'files', fileId);
      await updateDoc(fileRef, {
        ocrStatus: 'processing',
        ocrError: null,
      });

      // TODO: Call Firebase Function proxy to AWS Lambda OCR endpoint
      // For now, this is a placeholder
      // const response = await fetch(
      //   `${import.meta.env.VITE_API_BASE_URL}/v1/ocr:extract`,
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
      //     },
      //     body: JSON.stringify({
      //       matterId,
      //       fileId,
      //       storagePath,
      //     }),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error('Failed to trigger OCR');
      // }
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
   * Determine file type from filename
   */
  private static getFileType(filename: string): 'pdf' | 'docx' | 'txt' {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (extension === '.pdf') return 'pdf';
    if (extension === '.docx') return 'docx';
    return 'txt';
  }
}

