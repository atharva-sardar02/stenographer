import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// User type definition (matches shared/types/user.ts)
export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: 'attorney' | 'paralegal';
  createdAt: Date | string;
  lastLoginAt: Date | string;
}

/**
 * User Service - Handles all Firestore operations for users
 */
export class UserService {
  /**
   * Get all users (attorneys and paralegals)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('displayName', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const users: User[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          userId: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          role: data.role || 'paralegal',
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        });
      });

      return users;
    } catch (error: any) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  /**
   * Get all attorneys
   */
  static async getAttorneys(): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter((user) => user.role === 'attorney');
    } catch (error: any) {
      throw new Error(`Failed to get attorneys: ${error.message}`);
    }
  }

  /**
   * Get all paralegals
   */
  static async getParalegals(): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter((user) => user.role === 'paralegal');
    } catch (error: any) {
      throw new Error(`Failed to get paralegals: ${error.message}`);
    }
  }

  /**
   * Get attorneys and paralegals (combined)
   */
  static async getAttorneysAndParalegals(): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter(
        (user) => user.role === 'attorney' || user.role === 'paralegal'
      );
    } catch (error: any) {
      throw new Error(`Failed to get attorneys and paralegals: ${error.message}`);
    }
  }
}


