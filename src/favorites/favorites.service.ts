import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async addFavorite(userId: string, projectId: string) {
    // Check if project exists and is published
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, isPublished: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isPublished) {
      throw new NotFoundException('Project not found');
    }

    // Check if already favorited
    const existing = await this.prisma.favorite.findFirst({
      where: { userId, projectId },
    });
    if (existing) {
      throw new ForbiddenException('Project is already in favorites');
    }

    // Create favorite with project details included
    return this.prisma.favorite.create({
      data: {
        userId,
        projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            type: true,
            category: true,
            featured: true,
          },
        },
      },
    });
  }

  async removeFavorite(userId: string, projectId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: { userId, projectId },
    });
    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    return this.prisma.favorite.delete({
      where: { id: favorite.id },
    });
  }

  async getUserFavorites(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const take = Number(limit);

    const [data, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
              location: true,
              type: true,
              category: true,
              featured: true,
              isPublished: true,
              images: {
                orderBy: { order: 'asc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    return {
      data,
      total,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
        hasNextPage: page * take < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async checkIfFavorited(userId: string, projectId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findFirst({
      where: { userId, projectId },
    });
    return !!favorite;
  }
}
