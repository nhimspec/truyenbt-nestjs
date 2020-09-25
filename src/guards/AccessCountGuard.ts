import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { isNotEmpty, isString } from 'class-validator';

@Injectable()
export class AccessCountGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const accessCountToken = request.headers['access-count-token'];

        return isNotEmpty(accessCountToken) && isString(accessCountToken);
    }
}
