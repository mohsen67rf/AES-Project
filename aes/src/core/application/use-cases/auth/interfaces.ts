// src/core/application/use-cases/auth/interfaces.ts

import { User } from '../../../domain/entities/User';

// ============================================
// رابط‌های مشترک برای احراز هویت
// ============================================

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
}

export interface IPasswordVerifier {
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export interface ITokenGenerator {
  generate(userId: string, role: string): Promise<string>;
}