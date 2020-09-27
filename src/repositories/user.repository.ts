import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import BaseRepository from './base.repository';
import { User } from '@src/schemas/user.schema';

@Injectable()
class UserRepository extends BaseRepository<User> {
    @InjectModel(User.name) protected model: Model<User>;

    validPassword(user: User, password: string): boolean {
        return bcrypt.compareSync(password, user.password);
    }

    setPassword(user: User, password): User {
        user.salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password, user.salt);

        return user;
    }
}

export default UserRepository;
