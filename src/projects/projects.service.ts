import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(
    filters: { service?: string; location?: string; featured?: boolean },
    pagination: { skip: number; take: number },
  ) {
    const where = {
      ...(filters.service ? { services: { has: filters.service } } : {}),
      ...(filters.location ? { location: filters.location } : {}),
      ...(filters.featured ? { featured: true } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: { images: true, pricingTiers: true },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data: items, total };
  }

  getBySlug(slug: string) {
    return this.prisma.project.findUnique({
      where: { slug },
      include: { images: true, pricingTiers: true, assets: true },
    });
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto });
  }

  // TODO: add update/delete, pricing tiers, assets for admin
}


