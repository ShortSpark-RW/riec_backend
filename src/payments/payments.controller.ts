import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiExcludeEndpoint,
  ApiProperty,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { IsEmail, IsString } from 'class-validator';

class InitProjectCheckoutDto {
  @IsString()
  @ApiProperty({ example: '65f34e7e0a2b3c4d5e6f7890' })
  projectId: string;

  @IsString()
  @ApiProperty({ example: '65f34e7e0a2b3c4d5e6f7000' })
  tierId: string;

  @IsEmail()
  @ApiProperty({ example: 'customer@example.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'John Doe' })
  fullName: string;
}

@ApiTags('Payment Endpoints')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('project-checkout')
  @ApiOperation({ summary: 'Initialize Flutterwave project checkout' })
  @ApiOkResponse({
    description: 'Returns a payment link to redirect the user to Flutterwave.',
  })
  @ApiBadRequestResponse({
    description: 'Validation error (missing/invalid fields).',
  })
  initProjectCheckout(@Body() dto: InitProjectCheckoutDto) {
    return this.paymentsService.initProjectCheckout(dto);
  }

  @Post('webhook/flutterwave')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Flutterwave webhook handler' })
  handleWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }

  @Get('downloads/:token')
  @ApiOperation({
    summary: 'Get downloadable assets for a successful purchase',
  })
  @ApiOkResponse({
    description:
      'List of assets the customer can download, filtered by pricing tier.',
  })
  @ApiParam({ name: 'token', example: 'dl_6b9d6d2a2a5b4a3b8b9a' })
  @ApiBadRequestResponse({ description: 'Invalid token.' })
  getDownloads(@Param('token') token: string) {
    return this.paymentsService.getDownloadsByToken(token);
  }
}
