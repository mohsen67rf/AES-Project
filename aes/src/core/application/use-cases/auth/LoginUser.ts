// src/core/application/use-cases/auth/LoginUser.ts

import { User } from '../../../domain/entities/User';
import { IUserRepository, IPasswordVerifier, ITokenGenerator } from './interfaces';

// ============================================
// ورودی و خروجی
// ============================================

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: User;
  token: string;
}

// ============================================
// خود UseCase
// ============================================

export class LoginUser {
  constructor(
    private userRepository: IUserRepository,
    private passwordVerifier: IPasswordVerifier,
    private tokenGenerator: ITokenGenerator
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // ۱. اعتبارسنجی
    if (!input.email || !input.email.includes('@')) {
      throw new Error('ایمیل معتبر نیست');
    }
    if (!input.password || input.password.length < 1) {
      throw new Error('رمز عبور را وارد کنید');
    }

    // ۲. پیدا کردن کاربر
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('ایمیل یا رمز عبور اشتباه است');
    }

    // ۳. بررسی فعال بودن کاربر
    if (!user.isActive) {
      throw new Error('حساب کاربری شما غیرفعال شده است');
    }

    // ۴. تأیید رمز عبور
    // فعلاً یک placeholder
    // const isPasswordValid = await this.passwordVerifier.verify(input.password, user.password);
    // if (!isPasswordValid) {
    //   throw new Error('ایمیل یا رمز عبور اشتباه است');
    // }

    // ۵. تولید توکن
    const token = this.tokenGenerator.generate(user.id, user.role);

    return {
      user,
      token,
    };
  }
}