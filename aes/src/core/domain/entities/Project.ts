// src/core/domain/entities/Project.ts

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ProjectProps {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Project {
  private props: ProjectProps;

  private constructor(props: ProjectProps) {
    this.props = props;
    this.validate();
  }

  public static create(
    props: Omit<ProjectProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Project {
    return new Project({
      id: crypto.randomUUID(),
      ...props,
      status: ProjectStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static reconstitute(props: ProjectProps): Project {
    return new Project(props);
  }

  private validate(): void {
    if (!this.props.title || this.props.title.length < 3) {
      throw new Error('Project title must be at least 3 characters');
    }
    if (!this.props.ownerId) {
      throw new Error('Project must have an owner');
    }
    if (this.props.startDate && this.props.endDate) {
      if (this.props.startDate > this.props.endDate) {
        throw new Error('Start date cannot be after end date');
      }
    }
  }

  public updateTitle(newTitle: string): void {
    if (newTitle.length < 3) {
      throw new Error('Title must be at least 3 characters');
    }
    this.props.title = newTitle;
    this.props.updatedAt = new Date();
  }

  public changeStatus(newStatus: ProjectStatus): void {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  // Getterها
  get id(): string { return this.props.id; }
  get title(): string { return this.props.title; }
  get description(): string { return this.props.description; }
  get status(): ProjectStatus { return this.props.status; }
  get ownerId(): string { return this.props.ownerId; }
  get startDate(): Date | undefined { return this.props.startDate; }
  get endDate(): Date | undefined { return this.props.endDate; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  public toJSON(): ProjectProps {
    return { ...this.props };
  }
}