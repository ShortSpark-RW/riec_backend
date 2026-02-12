import { Injectable } from '@nestjs/common';
import { JobApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    jobId: string;
    fullName: string;
    email: string;
    phone?: string;
    coverLetter?: string;
    cvUrl?: string;
    cvS3Key?: string;
  }) {
    return this.prisma.jobApplication.create({ data });
  }

  async listForJob(
    jobId: string,
    status: JobApplicationStatus | undefined,
    pagination: { skip: number; take: number },
  ) {
    const where: {
      jobId: string;
      status?: JobApplicationStatus;
    } = {
      jobId,
      ...(status ? { status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.jobApplication.count({ where }),
    ]);

    return { data: items, total };
  }
}


