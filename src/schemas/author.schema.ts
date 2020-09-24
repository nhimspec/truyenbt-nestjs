import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Author extends Document {
    @Prop()
    name: string;

    @Prop({ unique: true })
    slug: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
