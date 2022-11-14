import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { SignUpDto } from './dto/signup.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  signUp(signUpDto: SignUpDto) {
    return 'This action signs a user up';
  }

  signIn(signUpDto: SignUpDto) {
    return 'This action signs a user in';
  }

  signOut() {
    return 'This action signs a user up';
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
