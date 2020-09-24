import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BaseRepository from './base.repository';
import { Author } from '@src/schemas/author.schema';

@Injectable()
class AuthorRepository extends BaseRepository<Author> {
    @InjectModel(Author.name) protected model: Model<Author>;
}

export default AuthorRepository;
