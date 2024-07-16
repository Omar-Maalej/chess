import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
@Schema()
export class User extends Document{
  @Prop({
    required: true,
    unique: true,
  })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  salt: string;

  @Prop({ type: [{type: MongooseSchema.Types.ObjectId, ref: 'User'}] })
  friends: User[];  


  //TODO add gamesPlayed field
}

export const UserSchema = SchemaFactory.createForClass(User);
