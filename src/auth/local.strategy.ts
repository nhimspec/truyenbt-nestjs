import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@src/schemas/user.schema';
import { AuthService } from './auth.service';
import { isEmail, isNotEmpty, maxLength, minLength } from 'class-validator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string): Promise<User> {
        if (
            isNotEmpty(email) &&
            isEmail(email) &&
            isNotEmpty(password) &&
            minLength(password, 6) &&
            maxLength(password, 12)
        ) {
            const user = await this.authService.validateUser(email, password);
            if (user) {
                return user;
            }
        }

        throw new UnauthorizedException();
    }
}
