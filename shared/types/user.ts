export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: 'attorney' | 'paralegal';
  createdAt: Date | string;
  lastLoginAt: Date | string;
}

