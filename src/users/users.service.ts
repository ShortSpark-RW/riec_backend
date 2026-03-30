import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        profileImg: true,
        coverImg: true,
        createdAt: true,
        lastLoginAt: true,
        updatedAt: true,
        projectsOwned: {
          select: {
            id: true,
            title: true,
            slug: true,
            isPublished: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        assignments: {
          select: {
            id: true,
            role: true,
            assignedAt: true,
            project: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            projectsOwned: true,
            assignments: true,
            favorites: true,
            uploadedAssets: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Transform to match frontend expectations
    return {
      ...user,
      stats: {
        projectsCount: user._count.projectsOwned,
        assignmentsCount: user._count.assignments,
        favoritesCount: user._count.favorites,
        uploadsCount: user._count.uploadedAssets,
      },
      // Rename arrays for clarity
      projects: user.projectsOwned,
      assignments: user.assignments,
    };
  }

  async updateUserProfile(userId: string, updateData: any) {
    // Only allow updating profileImg and coverImg
    const allowedFields = ['profileImg', 'coverImg'];
    const updateFields: any = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No valid fields to update');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateFields,
      select: {
        id: true,
        email: true,
        role: true,
        profileImg: true,
        coverImg: true,
        createdAt: true,
        lastLoginAt: true,
        updatedAt: true,
      },
    });
  }
}
