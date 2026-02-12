/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from './role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string) {
    const admin = await (this.prisma as any).user.findUnique({
      where: { email },
    });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!admin.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  async login(email: string, password: string) {
    const admin = await this.validateAdmin(email, password);

    const payload: any = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // compute expiresIn in seconds from env JWT_EXPIRES_IN (supports '1d', '24h', or numeric seconds)
    const raw = process.env.JWT_EXPIRES_IN || '1d';
    let expiresIn = 86400; // default 1 day
    if (/\d+d$/.test(raw)) {
      expiresIn = Number(raw.replace(/d$/, '')) * 86400;
    } else if (/\d+h$/.test(raw)) {
      expiresIn = Number(raw.replace(/h$/, '')) * 3600;
    } else if (!Number.isNaN(Number(raw))) {
      expiresIn = Number(raw);
    }

    await (this.prisma as any).user.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return { accessToken, expiresIn, role: admin.role };
  }

  /**
   * Register a new admin user. Only an existing admin (requesterEmail) can create another admin.
   */
  async register(
    requesterEmail: string | undefined,
    email: string,
    password: string,
    role: Role = Role.CLIENT,
  ) {
    if (!requesterEmail) {
      throw new UnauthorizedException('Unauthorized');
    }

    const requester = await (this.prisma as any).user.findUnique({
      where: { email: requesterEmail },
    });
    if (!requester || requester.role !== Role.ADMIN) {
      throw new UnauthorizedException('Only admins can register new users');
    }

    const existing = await (this.prisma as any).user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await (this.prisma as any).user.create({
      data: { email, passwordHash, role },
    });
    return {
      id: created.id,
      email: created.email,
      role: created.role,
      createdAt: created.createdAt,
    };
  }
}
