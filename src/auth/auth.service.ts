import { Injectable } from '@nestjs/common';
import UserRepository from '@src/repositories/user.repository';
import { User } from '@src/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from '@src/helpers/typeHelper';

@Injectable()
export class AuthService {
    constructor(private userRepository: UserRepository, private jwtService: JwtService) {}

    async validateUser(email: string, password: string): Promise<User | null> {
        const user: User | null = await this.userRepository.findOne({ email }).select('+password');
        if (user && this.userRepository.validPassword(user, password)) {
            return this.toJson(user);
        }
        return null;
    }

    async createUser(email: string, password: string) {
        const user: User = this.userRepository.newInstance();
        user.email = email;
        this.userRepository.setPassword(user, password);
        await user.save();

        return user;
    }

    toJson(user: User): User {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, salt, __v, ...result } = user.toJSON();

        return result as User;
    }

    login(user: User) {
        const payload: JWTPayload = {
            _id: user._id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        const accessToken: string = this.jwtService.sign(payload);

        return {
            ...payload,
            accessToken,
        };
    }
}
