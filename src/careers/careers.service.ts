import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CareersService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished(
    filters: { location?: string; department?: string; type?: string },
    pagination: { skip: number; take: number },
  ) {
    const where = {
      isPublished: true,
      ...(filters.location ? { location: filters.location } : {}),
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.type ? { employmentType: filters.type } : {}),
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

  getBySlug(slug: string) {
    return this.prisma.job.findFirst({
      where: { slug, isPublished: true },
    });
  }
}


