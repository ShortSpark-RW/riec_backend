import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { paginate } from '../common/utils/pagination.util';
import {
  generateUniqueSlug,
  sanitizeSlug,
  isValidSlug,
} from '../common/utils/slug.util';

@Injectable()
export class CareersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a job slug exists (excluding a specific ID)
   */
  private async jobSlugExists(
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    const existing = await this.prisma.job.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return !!existing;
  }

  async create(data: CreateJobDto) {
    // Generate slug from title
    const slug = await generateUniqueSlug(data.title, (slugToCheck) =>
      this.jobSlugExists(slugToCheck),
    );

    return this.prisma.job.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  async list(
    filters: {
      location?: string;
      department?: string;
      type?: string;
      published?: boolean;
    },
    page: number,
    limit: number,
  ) {
    const { skip, take, meta } = paginate(page, limit);

    const where = {
      ...(filters.published !== undefined
        ? { isPublished: filters.published }
        : {}),
      ...(filters.location
        ? {
            location: {
              contains: filters.location,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      ...(filters.department
        ? {
            department: {
              contains: filters.department,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      ...(filters.type
        ? {
            employmentType: {
              contains: filters.type,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          _count: {
            select: { applications: true },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return { data: items, ...meta(total) };
  }

  async listPublished(
    filters: { location?: string; department?: string; type?: string },
    pagination: { skip: number; take: number },
  ) {
    const where = {
      isPublished: true,
      ...(filters.location
        ? {
            location: {
              contains: filters.location,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      ...(filters.department
        ? {
            department: {
              contains: filters.department,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      ...(filters.type
        ? {
            employmentType: {
              contains: filters.type,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.job.count({ where }),
    ]);

    return { data: items, total };
  }

  findOne(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  getBySlug(slug: string) {
    return this.prisma.job.findFirst({
      where: { slug, isPublished: true },
    });
  }

  update(id: string, data: CreateJobDto) {
    return this.updateJob(id, data);
  }

  async updateJob(id: string, data: CreateJobDto) {
    // Generate new slug from title
    const slug = await generateUniqueSlug(data.title, (slugToCheck) =>
      this.jobSlugExists(slugToCheck, id),
    );

    return this.prisma.job.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });
  }

  remove(id: string) {
    return this.prisma.job.delete({ where: { id } });
  }

  publish(id: string) {
    return this.prisma.job.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  unpublish(id: string) {
    return this.prisma.job.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  async getStats() {
    const [total, published, byDepartment, byLocation, byType] =
      await this.prisma.$transaction([
        this.prisma.job.count(),
        this.prisma.job.count({ where: { isPublished: true } }),
        this.prisma.job.groupBy({
          by: ['department'],
          _count: { _all: true },
          orderBy: { department: 'asc' },
        }),
        this.prisma.job.groupBy({
          by: ['location'],
          _count: { _all: true },
          orderBy: { location: 'asc' },
        }),
        this.prisma.job.groupBy({
          by: ['employmentType'],
          _count: { _all: true },
          orderBy: { employmentType: 'asc' },
        }),
      ]);

    return {
      total,
      published,
      byDepartment,
      byLocation,
      byType,
    };
  }
}
