import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProperty,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Role } from './role.enum';

import type { Request } from 'express';

class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'SecurePass123!' })
  password: string;
}

class RegisterDto {
  @IsEmail()
  @ApiProperty({ example: 'newadmin@example.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'strongpassword' })
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({
    status: 201,
    description: 'Returns a JWT access token for the admin user.',
    schema: {
      example: { accessToken: 'eyJhbGci...', expiresIn: 86400, role: 'ADMIN' },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new admin user (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Created admin user' })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid access token.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  async register(@Req() req: Request, @Body() body: RegisterDto) {
    // requester info should be available on req.user via JwtAuthGuard
    // pass the requester email (if present) to the service for verification
    const requester = (req as any).user as { email?: string } | undefined;
    const requesterEmail = requester?.email;
    const { email, password } = body;
    return this.authService.register(requesterEmail, email, password);
  }
}


