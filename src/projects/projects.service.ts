/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { Role } from '../auth/role.enum';
import { Project } from '@prisma/client';
import { PaginatedResponse } from './dto/paginated-response.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                HELPERS                                     */
  /* -------------------------------------------------------------------------- */

  private getIncludeObject(includeParams: string[]) {
    const defaultInclude = {
      owner: {
        select: { id: true, email: true, role: true },
      },
      uploadedBy: {
        select: { id: true, email: true, role: true },
      },
    };

    if (!includeParams?.length) return defaultInclude;

    const include: any = {};
    if (includeParams.includes('owner')) include.owner = defaultInclude.owner;
    if (includeParams.includes('uploadedBy')) {
      include.uploadedBy = defaultInclude.uploadedBy;
    }

    return include;
  }

  private getPaginationMetadata(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                  PROJECTS                                  */
  /* -------------------------------------------------------------------------- */

  async create(dto: CreateProjectDto, ownerId?: string): Promise<Project> {
    const data: any = { ...dto };
    if (ownerId) data.ownerId = ownerId;

    return this.prisma.project.create({ data });
  }

  async list(
    filters: { service?: string; location?: string; featured?: boolean },
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Project>> {
    const where: any = {};

    if (filters.service) where.services = { has: filters.service };
    if (filters.location) where.location = filters.location;
    if (filters.featured !== undefined) where.featured = filters.featured;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: { images: true, pricingTiers: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: items,
      total,
      meta: this.getPaginationMetadata(total, page, limit),
    };
  }

  async getBySlug(slug: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        images: true,
        pricingTiers: true,
        assets: {
          include: {
            uploadedBy: { select: { id: true, email: true, role: true } },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, dto: Partial<CreateProjectDto>): Promise<Project> {
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.project.delete({
      where: { id },
    });
  }

  async publish(id: string): Promise<Project> {
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                  ASSETS                                    */
  /* -------------------------------------------------------------------------- */

  async generateUploadUrl(generateFor: {
    fileName: string;
    mimeType: string;
    category?: string;
  }) {
    const s3Key = this.s3Service.generateUniqueKey(
      generateFor.fileName,
      'projects',
      generateFor.category ?? 'assets',
    );

    const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
      s3Key,
      generateFor.mimeType,
    );

    return { uploadUrl, s3Key };
  }

  async uploadAsset(file: any, dto: UploadAssetDto, user: any) {
    this.logger.log('[UPLOAD] Starting asset upload', {
      file: file.originalname,
      user: user?.userId || user?.sub,
    });

    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (user.role !== Role.ADMIN) {
      const assignment = await this.prisma.projectAssignment.findFirst({
        where: {
          projectId: dto.projectId,
          userId: user.userId || user.sub,
        },
      });

      if (!assignment) {
        throw new ForbiddenException(
          'You do not have permission to upload assets to this project',
        );
      }
    }

    const key = `projects/${dto.projectId}/${Date.now()}_${file.originalname}`;

    const uploaded = await this.s3Service.uploadFile(
      file.buffer,
      key,
      file.mimetype,
    );

    return this.prisma.projectAsset.create({
      data: {
        projectId: dto.projectId,
        tierId: dto.tierId,
        documentType: dto.documentType,
        version: dto.version,
        s3Key: uploaded.key ?? key,
        filename: file.originalname,
        fileType: file.mimetype,
        size: file.size,
        uploadedById: user.userId || user.sub,
      },
      include: {
        uploadedBy: { select: { id: true, email: true, role: true } },
      },
    });
  }

  async listAssets(
    projectId: string,
    page = 1,
    limit = 20,
    includeParams: string[] = [],
  ): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    const [assets, total] = await Promise.all([
      this.prisma.projectAsset.findMany({
        where: { projectId },
        include: this.getIncludeObject(includeParams),
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.projectAsset.count({ where: { projectId } }),
    ]);

    return {
      data: assets,
      total,
      meta: this.getPaginationMetadata(total, page, limit),
    };
  }
}
