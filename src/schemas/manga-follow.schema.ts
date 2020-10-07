import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Manga } from '@src/schemas/manga.schema';

@Schema()
export class MangaFollow extends Document {
    @Prop()
    accessCountToken: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Manga.name })
    manga: Manga;
}

export const MangaFollowSchema = SchemaFactory.createForClass(MangaFollow);
