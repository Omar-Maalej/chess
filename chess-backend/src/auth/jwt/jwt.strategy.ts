import { PassportStrategy } from "@nestjs/passport";
import {Strategy, ExtractJwt} from "passport-jwt";
import { JwtPayload } from "./jwt-payload.interface";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/user/entities/user.entity";
import { Model } from "mongoose";
import { UnauthorizedException } from "@nestjs/common";

export class JwtStrategy extends PassportStrategy(Strategy){
  constructor(@InjectModel('User') private userModel : Model<User>){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload : JwtPayload) : Promise<User>{
    const {username} = payload;
    const user = await this.userModel.findOne({username}).exec();
    
    if(!user){
      throw new UnauthorizedException();
    }

    return user;

  }
}