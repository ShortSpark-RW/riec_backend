import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectImagesModule } from './project-images/project-images.module';
import { ProjectAssetsModule } from './project-assets/project-assets.module';
import { ProjectPricingTiersModule } from './project-pricing-tiers/project-pricing-tiers.module';
import { ProjectAssignmentsModule } from './project-assignments/project-assignments.module';
import { ProjectPurchasesModule } from './project-purchases/project-purchases.module';
import { ServicesModule } from './services/services.module';
import { ServiceImagesModule } from './service-images/service-images.module';
import { ContactModule } from './contact/contact.module';
import { S3Module } from './s3/s3.module';
import { CareersModule } from './careers/careers.module';
import { ApplicationsModule } from './applications/applications.module';
import { PaymentsModule } from './payments/payments.module';
import { SearchModule } from './search/search.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    ProjectImagesModule,
    ProjectAssetsModule,
    ProjectPricingTiersModule,
    ProjectAssignmentsModule,
    ProjectPurchasesModule,
    ServicesModule,
    ServiceImagesModule,
    ContactModule,
    S3Module,
    CareersModule,
    ApplicationsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
