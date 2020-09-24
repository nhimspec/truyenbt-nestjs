import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Tag } from './tag.schema';
import { Author } from './author.schema';

export enum MANGA_STATUS {
    CONTINUE = '0',
    COMPLETE = '1',
}

@Schema({
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
})
export class Manga extends Document {
    @Prop()
    name: string;

    @Prop()
    otherName: string;

    @Prop({ unique: true })
    slug: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Author.name })
    author: Author;

    @Prop({
        type: String,
        get: (imageUrl: string): string => {
            return !!imageUrl ? `${process.env.UPLOAD_BASE_URL}${imageUrl}` : '';
        },
    })
    imagePreview: string;

    @Prop({ type: Number, default: 0 })
    viewCount: number;

    @Prop()
    description: string;

    @Prop({ default: MANGA_STATUS.CONTINUE })
    status: MANGA_STATUS;

    @Prop([{ type: MongooseSchema.Types.ObjectId, ref: Tag.name }])
    tags: Tag[];

    @Prop({ type: Date, default: new Date() })
    publishedAt: Date;
}

export const MangaSchema = SchemaFactory.createForClass(Manga);
