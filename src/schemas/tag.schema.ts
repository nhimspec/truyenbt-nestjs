import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Tag extends Document {
    @Prop()
    name: string;

    @Prop({ unique: true })
    slug: string;

    @Prop()
    description: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
