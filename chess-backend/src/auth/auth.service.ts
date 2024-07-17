import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from 'src/user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService : JwtService,
    @InjectModel('User') private userModel : Model<User>
  ){}

  async register(registerDto : RegisterDto){
    const {username, password} = registerDto;

    const usernameExists = await this.userModel.findOne({username}).exec();
    if(usernameExists){
      throw new ConflictException('Username already exists');
    }

    const salt = await bcrypt.genSalt();
    const hasedPassword = await bcrypt.hash(password, salt);
    return await this.userModel.create({username, password: hasedPassword, salt});
  }

  async login(loginDto : LoginDto){
    const {username, password} = loginDto;
    const user = await this.userModel.findOne({username}).exec();
    if(!user){
      throw new NotFoundException('Wrong Username or Password');
    }
    const passwordValid = await bcrypt.compare(password, user.password);

    if(passwordValid){
      const payload = {username};
      const jwt = this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: 86400
      });

      return {
        access_token: jwt,
        username: user.username
      };
    }else {
      throw new NotFoundException('Wrong Username or Password');
    }
    }
}

