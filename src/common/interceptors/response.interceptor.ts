/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((result) => {
        const statusCode = response.statusCode;

        // If the service returned a paginated shape { data, total, meta }
        if (result && typeof result === 'object' && 'data' in result) {
          const { data, total, meta, ...rest } = result;
          return {
            statusCode,
            message: 'Request successful',
            data,
            ...(total !== undefined ? { total } : {}),
            ...(meta !== undefined ? { meta } : {}),
            ...rest,
          };
        }

        // Plain response
        return {
          statusCode,
          message: 'Request successful',
          data: result,
        };
      }),
    );
  }
}
