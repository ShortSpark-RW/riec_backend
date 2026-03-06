import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
