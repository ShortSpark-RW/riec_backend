import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@ApiTags('User Management')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user\'s profile details including related entities (projects, assignments, favorites count)',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: '65f34e7e0a2b3c4d5e6f7000',
        email: 'client@example.com',
        role: 'CLIENT',
        profileImg: 'https://example.com/profile.jpg',
        coverImg: 'https://example.com/cover.jpg',
        createdAt: '2024-01-15T10:30:00Z',
        lastLoginAt: '2024-01-20T14:15:00Z',
        stats: {
          projectsOwned: 2,
          assignments: 3,
          favoritesCount: 5,
          purchasesCount: 1,
        },
        projectsOwned: [
          {
            id: 'proj1',
            title: 'Modern Family Villa',
            slug: 'modern-family-villa',
            isPublished: true,
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
        assignments: [
          {
            id: 'assign1',
            project: {
              id: 'proj1',
              title: 'Modern Family Villa',
              slug: 'modern-family-villa',
            },
            role: 'Engineer',
            assignedAt: '2024-01-16T09:00:00Z',
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  async getProfile(@Req() req: any) {
    const userId = req.user.userId;
    return this.usersService.getUserProfile(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update the authenticated user\'s profile image and cover image URLs. Pass only the fields you want to update.',
  })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    schema: {
      example: {
        id: '65f34e7e0a2b3c4d5e6f7000',
        email: 'client@example.com',
        role: 'CLIENT',
        profileImg: 'https://example.com/new-profile.jpg',
        coverImg: 'https://example.com/new-cover.jpg',
        updatedAt: '2024-01-21T10:30:00Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  async updateProfile(@Req() req: any, @Body() updateData: UpdateUserProfileDto) {
    const userId = req.user.userId;
    return this.usersService.updateUserProfile(userId, updateData);
  }
}
