import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Manga } from '@src/schemas/manga.schema';

@Schema()
export class MangaLike extends Document {
    @Prop()
    accessCountToken: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Manga.name })
    manga: Manga | Types.ObjectId;
}

export const MangaLikeSchema = SchemaFactory.createForClass(MangaLike);
