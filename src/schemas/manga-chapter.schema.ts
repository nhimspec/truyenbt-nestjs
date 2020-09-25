import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Manga } from './manga.schema';

export interface MangaChapterImage {
    imageUrl: string;
    order: number;
}

@Schema({ timestamps: true })
export class MangaChapter extends Document {
    @Prop()
    number: number;

    @Prop({ type: Number, default: 0 })
    viewCount: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Manga.name })
    manga: Manga;

    @Prop(raw({ imageUrl: String, order: { type: Number, default: 0 } }))
    images: MangaChapterImage[];

    @Prop({ type: Date, default: new Date() })
    publishedAt: Date;
}

export const MangaChapterSchema = SchemaFactory.createForClass(MangaChapter);
