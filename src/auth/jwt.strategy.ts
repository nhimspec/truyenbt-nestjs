import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { JWTPayload } from '@src/helpers/typeHelper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: JWTPayload): Promise<JWTPayload> {
        return {
            _id: payload._id,
            email: payload.email,
            createdAt: payload.createdAt,
            updatedAt: payload.updatedAt,
        };
    }
}
