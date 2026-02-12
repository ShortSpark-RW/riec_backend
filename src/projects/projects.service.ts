/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// (Removed old duplicate lightweight ProjectsService implementation.)
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { Role } from '../auth/role.enum';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  private getIncludeObject(includeParams: string[]) {
    const defaultInclude = {
      owner: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      uploadedBy: {
        select: { id: true, email: true, role: true },
      },
    };

    if (!includeParams || includeParams.length === 0) return defaultInclude;

    const include: any = {};
    if (includeParams.includes('owner')) include.owner = defaultInclude.owner;
    if (includeParams.includes('uploadedBy'))
      include.uploadedBy = defaultInclude.uploadedBy;
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

  private toBoolean(value: any): boolean {
    return value === 'true' || value === true;
  }

  async create(dto: CreateProjectDto, ownerId?: string) {
    const data: any = { ...dto };
    if (ownerId) data.ownerId = ownerId;
    return this.prisma.project.create({ data });
  }

  async list(
    filters: { service?: string; location?: string; featured?: boolean },
    page = 1,
    limit = 20,
  ) {
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

  async getBySlug(slug: string) {
    const project = await (this.prisma as any).project.findUnique({
      where: { slug },
      include: {
        images: true,
        pricingTiers: true,
        assets: {
          include: {
            uploadedBy: { select: { id: true, email: true, role: true } },
          },
        },
      } as any,
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async generateUploadUrl(generateFor: {
    fileName: string;
    mimeType: string;
    category?: string;
  }) {
    const s3Key = this.s3Service.generateUniqueKey(
      generateFor.fileName,
      'projects',
      generateFor.category || 'assets',
    );
    const presigned = await this.s3Service.generatePresignedUploadUrl(
      s3Key,
      generateFor.mimeType,
    );
    return { uploadUrl: presigned, s3Key };
  }

  async uploadAsset(file: any, dto: UploadAssetDto, user: any) {
    const start = Date.now();
    this.logger.log('[UPLOAD] Starting asset upload', {
      file: file.originalname,
      user: user?.userId || user?.sub,
    });

    // verify project exists
    const project = await (this.prisma as any).project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    // permission check: ADMIN can always upload
    if (user.role !== Role.ADMIN) {
      // COMPANY_WORKER must be assigned to project - check ProjectAssignment model
      const assignment = await (this.prisma as any).projectAssignment.findFirst(
        {
          where: { projectId: dto.projectId, userId: user.userId || user.sub },
        },
      );
      if (!assignment) {
        this.logger.warn('Upload permission denied', {
          user: user.userId || user.sub,
          projectId: dto.projectId,
        });
        throw new ForbiddenException(
          'You do not have permission to upload assets to this project',
        );
      }
    }

    // upload to s3
    const folder = `projects/${dto.projectId}`;
    const key = `${folder}/${Date.now()}_${file.originalname}`;
    const uploaded = await this.s3Service.uploadFile(
      file.buffer,
      key,
      file.mimetype,
    );
    const s3Key = uploaded.key || key;

    const created = await (this.prisma as any).projectAsset.create({
      data: {
        projectId: dto.projectId,
        tierId: dto.tierId,
        documentType: dto.documentType,
        version: dto.version,
        s3Key,
        filename: file.originalname,
        fileType: file.mimetype,
        size: file.size,
        uploadedById: user.userId || user.sub,
      },
      include: {
        uploadedBy: { select: { id: true, email: true, role: true } },
      },
    } as any);

    const totalTime = ((Date.now() - start) / 1000).toFixed(2);
    this.logger.log('[UPLOAD] Asset uploaded', {
      id: created.id,
      s3Key,
      totalTime,
    });

    return created;
  }

  async listAssets(
    projectId: string,
    page = 1,
    limit = 20,
    includeParams: string[] = [],
  ) {
    const where: any = { projectId };
    const skip = (page - 1) * limit;

    const [assets, total] = await Promise.all([
      (this.prisma as any).projectAsset.findMany({
        where,
        include: this.getIncludeObject(includeParams),
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).projectAsset.count({ where }),
    ]);

    return {
      data: assets,
      total,
      meta: this.getPaginationMetadata(total, page, limit),
    };
  }

  // Additional methods (download URL, move, delete) would follow the documented patterns and checks
}
