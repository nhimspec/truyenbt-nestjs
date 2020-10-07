import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from '@src/helpers/typeHelper';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        return next.handle().pipe(
            map(data => {
                return {
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message: data.message,
                    data: data.data,
                };
            }),
        );
    }
}
