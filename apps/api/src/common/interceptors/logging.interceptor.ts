import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly log = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ method: string; url: string }>();
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<{ statusCode: number }>();
        this.log.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
      }),
    );
  }
}
