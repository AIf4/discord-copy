import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Users } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(userWhereInput: Prisma.UsersWhereInput): Promise<Users | null> {
    return await this.prisma.users.findFirst({
      where: userWhereInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UsersWhereUniqueInput;
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput;
  }): Promise<Omit<Users, 'password'>[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.users.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UsersCreateInput) {
    try {
      const findEmail = await this.findOne({ email: data.email });
      if (findEmail) {
        throw new BadRequestException({
          message: 'Email already exists',
          field: 'email',
        });
      }
      const findNickname = await this.findOne({ nickname: data.nickname });
      if (findNickname) {
        throw new BadRequestException({
          message: 'Nickname already exists',
          field: 'nickname',
        });
      }
      const { password, ...userData } = data;
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      return this.prisma.users.create({
        data: { ...userData, password: hashedPassword },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateUser(params: {
    where: Prisma.UsersWhereUniqueInput;
    data: Prisma.UsersUpdateInput;
  }): Promise<Users> {
    const { where, data } = params;
    return this.prisma.users.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UsersWhereUniqueInput): Promise<Users> {
    return this.prisma.users.delete({
      where,
    });
  }
}
