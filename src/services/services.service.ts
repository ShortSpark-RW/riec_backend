import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(pagination: { skip: number; take: number }) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        orderBy: { order: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.service.count(),
    ]);

    return { data: items, total };
  }
}


