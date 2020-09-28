import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Manga } from './manga.schema';
import { MangaChapter } from '@src/schemas/manga-chapter.schema';

@Schema({ timestamps: true })
export class ChapterView extends Document {
    @Prop()
    accessCountToken: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: MangaChapter.name })
    mangaChapter: MangaChapter;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Manga.name })
    manga: Manga;

    @Prop({ type: Date, default: new Date() })
    publishedAt: Date;
}

export const ChapterViewSchema = SchemaFactory.createForClass(ChapterView);
