import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { paginate } from '../common/utils/pagination.util';
import { ProjectCategory, ProjectType } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOneOrFail(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(dto: CreateProjectDto, ownerId?: string) {
    const { serviceSlug, ...rest } = dto as any;
    const data: any = { ...rest };
    if (serviceSlug) data.service = { connect: { slug: serviceSlug } };
    if (ownerId) data.ownerId = ownerId;
    return this.prisma.project.create({ data });
  }

  async list(
    filters: {
      service?: string;
      location?: string;
      featured?: boolean;
      type?: ProjectType;
      category?: ProjectCategory;
    },
    page = 1,
    limit = 20,
  ) {
    const { skip, take, meta } = paginate(page, limit);
    const where: any = {};

    if (filters.location) where.location = filters.location;
    if (filters.featured !== undefined) where.featured = filters.featured;
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;

    if (filters.service) {
      const service = await this.prisma.service.findFirst({
        where: { name: filters.service },
      });
      if (!service) return { data: [], total: 0, meta: meta(0) };
      where.serviceId = service.id;
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: { images: true, pricingTiers: true, service: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data, total, meta: meta(total) };
  }

  async getBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: 'asc' } },
        pricingTiers: { where: { isActive: true } },
        assets: {
          include: { uploadedBy: { select: { id: true, email: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
        service: { select: { id: true, name: true } },
        owner: { select: { id: true, email: true, role: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findOne(id: string) {
    return this.findOneOrFail(id);
  }

  async update(id: string, dto: Partial<CreateProjectDto>) {
    await this.findOneOrFail(id);
    const { serviceSlug, ...rest } = dto as any;
    const data: any = { ...rest };
    if (serviceSlug) data.service = { connect: { slug: serviceSlug } };
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOneOrFail(id);
    await this.prisma.project.delete({ where: { id } });
  }

  async publish(id: string) {
    await this.findOneOrFail(id);
    return this.prisma.project.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    await this.findOneOrFail(id);
    return this.prisma.project.update({
      where: { id },
      data: { isPublished: false, publishedAt: null },
    });
  }
}
