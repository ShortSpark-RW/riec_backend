import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { IsEmail, IsString } from 'class-validator';

class InitProjectCheckoutDto {
  @IsString()
  projectId: string;

  @IsString()
  tierId: string;

  @IsEmail()
  email: string;

  @IsString()
  fullName: string;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('project-checkout')
  @ApiOperation({ summary: 'Initialize Flutterwave project checkout' })
  @ApiOkResponse({
    description: 'Returns a payment link to redirect the user to Flutterwave.',
  })
  initProjectCheckout(@Body() dto: InitProjectCheckoutDto) {
    return this.paymentsService.initProjectCheckout(dto);
  }

  @Post('webhook/flutterwave')
  @ApiOperation({ summary: 'Flutterwave webhook handler' })
  handleWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }

  @Get('downloads/:token')
  @ApiOperation({ summary: 'Get downloadable assets for a successful purchase' })
  @ApiOkResponse({
    description:
      'List of assets the customer can download, filtered by pricing tier.',
  })
  getDownloads(@Param('token') token: string) {
    return this.paymentsService.getDownloadsByToken(token);
  }
}


