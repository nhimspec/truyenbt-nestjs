import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Prop({ unique: true, lowercase: true })
    email: string;

    @Prop()
    avatar: string;

    @Prop({ select: false })
    salt: string;

    @Prop({ select: false })
    password: string;

    @Prop()
    accessCountToken: string;

    @Prop()
    gender: number;

    createdAt: string;
    updatedAt: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
