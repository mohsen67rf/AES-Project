// src/core/domain/entities/User.ts

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ENGINEER = 'ENGINEER',
  VIEWER = 'VIEWER',
}

export interface UserProps {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
    this.validate();
  }

  // ساخت کاربر جدید
  public static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): User {
    return new User({
      id: crypto.randomUUID(),
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // بازسازی کاربر از دیتابیس
  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // اعتبارسنجی
  private validate(): void {
    if (!this.props.email || !this.props.email.includes('@')) {
      throw new Error('Email is invalid');
    }
    if (!this.props.fullName || this.props.fullName.length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }
  }

  // متدهای عمومی
  public changeEmail(newEmail: string): void {
    if (!newEmail.includes('@')) {
      throw new Error('New email is invalid');
    }
    this.props.email = newEmail;
    this.props.updatedAt = new Date();
  }

  public changeRole(newRole: UserRole): void {
    this.props.role = newRole;
    this.props.updatedAt = new Date();
  }

  // Getterها
  get id(): string { return this.props.id; }
  get email(): string { return this.props.email; }
  get fullName(): string { return this.props.fullName; }
  get role(): UserRole { return this.props.role; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // تبدیل به شیء ساده
  public toJSON(): UserProps {
    return { ...this.props };
  }
}