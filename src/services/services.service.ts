import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { paginate } from '../common/utils/pagination.util';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOneOrFail(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  async list(page = 1, limit = 20) {
    const { skip, take, meta } = paginate(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        orderBy: { order: 'asc' },
        include: { images: { orderBy: { order: 'asc' } } },
        skip,
        take,
      }),
      this.prisma.service.count(),
    ]);
    return { data, total, meta: meta(total) };
  }

  async findOne(id: string) {
    return this.findOneOrFail(id);
  }

  async update(id: string, dto: Partial<CreateServiceDto>) {
    await this.findOneOrFail(id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneOrFail(id);
    await this.prisma.service.delete({ where: { id } });
  }
}
