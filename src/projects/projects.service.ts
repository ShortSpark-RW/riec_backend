/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectCategory, ProjectType } from '@prisma/client';
import { paginate } from '../common/utils/pagination.util';
import { generateUniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseIncludeQuery(include?: string) {
    if (!include) return {};

    const relations = include.split(',').map((r) => r.trim());
    const includeObj: any = {};

    relations.forEach((relation) => {
      switch (relation) {
        case 'images':
          includeObj.images = { orderBy: { order: 'asc' } };
          break;
        case 'service':
        case 'services':
          includeObj.services = {
            include: {
              service: true,
            },
          };
          break;
        case 'assets':
          includeObj.assets = {
            include: {
              uploadedBy: { select: { id: true, email: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
          };
          break;
        case 'pricingTiers':
          includeObj.pricingTiers = {
            where: { isActive: true },
            orderBy: { amount: 'asc' },
          };
          break;
        case 'owner':
          includeObj.owner = { select: { id: true, email: true, role: true } };
          break;
        case 'assignments':
          includeObj.assignments = {
            include: {
              user: { select: { id: true, email: true, role: true } },
            },
          };
          break;
        case 'purchases':
          includeObj.purchases = { orderBy: { createdAt: 'desc' } };
          break;
        case 'counts':
          includeObj._count = {
            select: {
              images: true,
              assets: true,
              pricingTiers: true,
              purchases: true,
            },
          };
          break;
      }
    });

    return includeObj;
  }

  async create(dto: CreateProjectDto) {
    const { serviceSlugs, ...rest } = dto;

    const slug = await generateUniqueSlug(dto.title, (s) =>
      this.prisma.project.findUnique({ where: { slug: s } }).then(Boolean),
    );

    const data: any = { ...rest, slug };

    // Handle many-to-many service relationships
    if (serviceSlugs && serviceSlugs.length > 0) {
      const services = await this.prisma.service.findMany({
        where: { slug: { in: serviceSlugs } },
      });
      data.services = {
        connect: services.map((service) => ({ id: service.id })),
      };
    }

    return this.prisma.project.create({
      data,
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });
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
    include?: string,
  ) {
    const { skip, take, meta } = paginate(page, limit);
    const where: any = { isPublished: true };

    if (filters.service) {
      const service = await this.prisma.service.findFirst({
        where: { slug: filters.service },
        select: { id: true },
      });
      if (service) {
        where.services = {
          some: {
            serviceId: service.id,
          },
        };
      }
    }
    if (filters.location)
      where.location = { contains: filters.location, mode: 'insensitive' };
    if (filters.featured !== undefined) where.featured = filters.featured;
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;

    const includeRelations = this.parseIncludeQuery(include);

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: includeRelations,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data, total, meta: meta(total) };
  }

  async findOne(id: string, include?: string) {
    const includeRelations = this.parseIncludeQuery(include);
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async getBySlug(slug: string, include?: string) {
    const includeRelations = this.parseIncludeQuery(include);
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: includeRelations,
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findByIdentifier(identifier: string, include?: string) {
    const includeRelations = this.parseIncludeQuery(include);

    // Try to find by ID first (MongoDB ObjectId format)
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      const project = await this.prisma.project.findUnique({
        where: { id: identifier },
        include: includeRelations,
      });
      if (project) return project;
    }

    // If not found by ID or doesn't look like an ID, try by slug
    const project = await this.prisma.project.findUnique({
      where: { slug: identifier },
      include: includeRelations,
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(identifier: string, dto: Partial<CreateProjectDto>) {
    const project = await this.findByIdentifier(identifier);
    const { serviceSlugs, ...rest } = dto as CreateProjectDto;

    const data: any = { ...rest };

    // Handle many-to-many service relationships
    if (serviceSlugs !== undefined) {
      if (serviceSlugs.length > 0) {
        const services = await this.prisma.service.findMany({
          where: { slug: { in: serviceSlugs } },
        });
        data.services = {
          set: services.map((service) => ({ id: service.id })),
        };
      } else {
        // If empty array, disconnect all services
        data.services = {
          set: [],
        };
      }
    }

    return this.prisma.project.update({
      where: { id: project.id },
      data,
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async remove(identifier: string) {
    const project = await this.findByIdentifier(identifier);
    await this.prisma.project.delete({ where: { id: project.id } });
  }

  async publish(identifier: string) {
    const project = await this.findByIdentifier(identifier);
    return this.prisma.project.update({
      where: { id: project.id },
      data: { isPublished: true, publishedAt: new Date() },
    });
  }

  async unpublish(identifier: string) {
    const project = await this.findByIdentifier(identifier);
    return this.prisma.project.update({
      where: { id: project.id },
      data: { isPublished: false },
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getCategories() {
    return Object.values(ProjectCategory);
  }

  async getProjectsByCategory(category: ProjectCategory, page = 1, limit = 20) {
    const { skip, take, meta } = paginate(page, limit);
    const where = { category, isPublished: true };
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: { images: { orderBy: { order: 'asc' }, take: 1 } },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.project.count({ where }),
    ]);
    return { data, total, meta: meta(total) };
  }

  async getProjectCountByCategory(category: ProjectCategory) {
    const count = await this.prisma.project.count({
      where: { category, isPublished: true },
    });
    return { category, count };
  }

  async getCategoriesSummary() {
    const categories = Object.values(ProjectCategory);
    const counts = await Promise.all(
      categories.map((category) =>
        this.prisma.project
          .count({ where: { category, isPublished: true } })
          .then((count) => ({ category, count })),
      ),
    );
    const total = counts.reduce((sum, c) => sum + c.count, 0);
    const summary = counts.map((c) => ({
      ...c,
      percentage: total > 0 ? Math.round((c.count / total) * 100) : 0,
    }));
    return { categories: counts, total, summary };
  }
}
