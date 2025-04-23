import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User } from '@prisma/client';

type UserSummary = Pick<User, 'id' | 'email' | 'role' | 'createdAt'>;
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(user: Prisma.UserCreateInput) {
    try {
      const findEmail = await this.findOne({ email: user.email });
      if (findEmail) {
        throw new BadRequestException({
          message: 'Email already exists',
          field: 'email',
        });
      }

      const { password, ...userData } = user;
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      return this.prisma.user.create({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
        data: { ...userData, password: hashedPassword },
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<UserSummary[]> {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(
    UserWhereInput: Prisma.UserWhereInput,
    UserSelectInput?: Prisma.UserSelect,
  ): Promise<User | null> {
    return await this.prisma.user.findFirst({
      select: UserSelectInput,
      where: UserWhereInput,
    });
  }

  async User(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<Omit<User, 'password'>[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<Pick<User, 'id' | 'email' | 'role' | 'createdAt'>> {
    const { where, data } = params;
    const userFind = await this.findOne(where);
    if (!userFind) {
      throw new BadRequestException({
        message: 'User not found',
      });
    }
    const { password: oldPassword }: any = data;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(oldPassword, salt);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userUpdated } = await this.prisma.user.update({
      data: { password: hashedPassword },
      where,
    });
    return userUpdated;
  }

  async deleteUser(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<Pick<User, 'id' | 'email' | 'role' | 'createdAt'>> {
    const user = await this.findOne(where);
    if (!user) {
      throw new BadRequestException({
        message: 'User not found',
      });
    }
    return this.prisma.user.delete({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      where,
    });
  }
}
