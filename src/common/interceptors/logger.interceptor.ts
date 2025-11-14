import {
  ExecutionContext,
  NestInterceptor,
  CallHandler,
  Injectable
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const correlationId =
      req.headers['x-correlation-id'] || randomUUID();
      res.setHeader('x-correlation-id', correlationId);

    const { method, url, query, body, headers } = req;

    const userAgent = headers['user-agent'] || 'unknown';

    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      'unknown';

    console.log(
      JSON.stringify({
        type: 'request',
        timestamp: new Date().toISOString(),
        correlationId,
        method,
        url,
        ip,
        userAgent,
        body
      })
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        console.log(
          JSON.stringify({
            type: 'response',
            timestamp: new Date().toISOString(),
            correlationId,
            method,
            url,
            status: res.statusCode,
            durationMs: duration
          })
        );
      }),
      catchError((err) => {
        const duration = Date.now() - now;

        console.error(
          JSON.stringify({
            type: 'error',
            timestamp: new Date().toISOString(),
            correlationId,
            method,
            url,
            ip,
            userAgent,
            status: err.status || 500,
            durationMs: duration,
            message: err.message,
            stack: err.stack
          })
        );

        return throwError(() => err);
      })
    );
  }

}
