import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ProjectAssignmentsService } from './project-assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Project Assignment (Project and Staff relation) Endpoints')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('projects/:projectId/assignments')
export class ProjectAssignmentsController {
  constructor(private readonly service: ProjectAssignmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Assign a user to a project' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiCreatedResponse({ description: 'User assigned.' })
  @ApiNotFoundResponse({ description: 'Project or user not found.' })
  @ApiConflictResponse({ description: 'User already assigned.' })
  assign(
    @Param('projectId') projectId: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.service.assign(projectId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all assignments for a project' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiOkResponse({ description: 'List of project assignments.' })
  list(@Param('projectId') projectId: string) {
    return this.service.list(projectId);
  }

  @Put(':assignmentId')
  @ApiOperation({ summary: 'Update assignment role' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'assignmentId', example: '65f34e7e0a2b3c4d5e6f7894' })
  @ApiOkResponse({ description: 'Assignment role updated.' })
  @ApiNotFoundResponse({ description: 'Assignment not found.' })
  updateRole(
    @Param('projectId') projectId: string,
    @Param('assignmentId') assignmentId: string,
    @Body('role') role: string,
  ) {
    return this.service.updateRole(projectId, assignmentId, role);
  }

  @Delete(':assignmentId')
  @ApiOperation({ summary: 'Remove a user from a project' })
  @ApiParam({ name: 'projectId', example: '65f34e7e0a2b3c4d5e6f7890' })
  @ApiParam({ name: 'assignmentId', example: '65f34e7e0a2b3c4d5e6f7894' })
  @ApiOkResponse({ description: 'Assignment removed.' })
  @ApiNotFoundResponse({ description: 'Assignment not found.' })
  unassign(
    @Param('projectId') projectId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.service.unassign(projectId, assignmentId);
  }
}
