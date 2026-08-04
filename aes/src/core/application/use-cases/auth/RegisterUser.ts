// src/core/application/use-cases/auth/RegisterUser.ts

import { User, UserRole } from '../../../domain/entities/User';
import { IUserRepository } from './interfaces';

// ============================================
// ورودی و خروجی مورد انتظار
// ============================================

export interface RegisterUserInput {
  email: string;
  fullName: string;
  password: string;
  role?: UserRole;
}

export interface RegisterUserOutput {
  user: User;
  message: string;
}

// ============================================
// خود UseCase
// ============================================

export class RegisterUser {
  constructor(
    private userRepository: IUserRepository,
    
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // ۱. اعتبارسنجی
    if (!input.email || !input.email.includes('@')) {
      throw new Error('ایمیل معتبر نیست');
    }
    if (!input.fullName || input.fullName.length < 2) {
      throw new Error('نام کامل باید حداقل ۲ کاراکتر باشد');
    }
    if (!input.password || input.password.length < 6) {
      throw new Error('رمز عبور باید حداقل ۶ کاراکتر باشد');
    }

    // ۲. بررسی تکراری نبودن ایمیل
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('ایمیل قبلاً ثبت شده است');
    }

    // ۳. هش کردن رمز عبور
    //const hashedPassword = await this.passwordHasher.hash(input.password);

    // ۴. ساخت کاربر جدید
    const user = User.create({
      email: input.email,
      fullName: input.fullName,
      role: input.role || UserRole.VIEWER,
      isActive: true,
    });

    // ۵. ذخیره‌سازی
    await this.userRepository.save(user);

    return {
      user,
      message: 'ثبت‌نام با موفقیت انجام شد',
    };
  }
}