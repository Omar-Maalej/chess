import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {
  }

  async create(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;

    const usernameExists = await this.userModel.findOne({ username }).exec();
    if (usernameExists) {
      throw new ConflictException('Username already exists');
    }
    
    const salt = await bcrypt.genSalt();
    console.log("salt: ", salt);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      salt,
    })
    return newUser.save();
  }

  findAll() {
    return this.userModel.find().exec();
  }

  findOne(id: string) {
    return this.userModel.findById(id).exec();
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto).exec();
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async addFriend(userId: string, friendId: string) {
    //same user
    if(userId === friendId) {
      return;
    }
    //check if users exist
    if(this.userModel.findById(userId).exec() === null || this.userModel.findById(friendId).exec() === null) {
      return;
    }
    //check if user is already a friend
    const user = await this.userModel.findById(userId).exec();
    const friendIds = user.friends.map(friend => friend.id);
    if(friendIds.includes(friendId)) 
        return;

    //add friend
    this.userModel.findByIdAndUpdate(friendId, {
      $push: { friends: userId }
    }).exec();

    
    return this.userModel.findByIdAndUpdate(userId, {
      $push: { friends: friendId }
    }).exec();
  }
}
