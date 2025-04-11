import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { Channel, Message, Participant, User } from '@prisma/client';
import { Action, Role } from 'src/utils/global.enum';

// Definimos todos los sujetos como strings
type SubjectsList = {
  User: User;
  Channel: Channel;
  Participant: Participant;
  Message: Message;
};

export type AppAbility = PureAbility<
  [Action, Subjects<SubjectsList> | 'all'],
  PrismaQuery
>;

@Injectable()
export class CaslAbilityFactory {
  defineAbility(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    if (user.role === Role.SUPER_ADMIN) {
      can(Action.MANAGE, 'all');
    } else if (user.role === Role.ADMIN) {
      can(Action.MANAGE, 'all');
      cannot(Action.DELETE, 'User', { role: Role.SUPER_ADMIN });
    } else if (user.role === Role.MODERADOR) {
      can([Action.READ, Action.UPDATE, Action.DELETE], 'User', { id: user.id });
      can(
        [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
        'Channel',
      );
      can(
        [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
        'Message',
      );
      can(Action.DELETE, 'Participant');
    } else if (user.role === Role.DEFAULT) {
      can([Action.CREATE, Action.READ], 'Channel');
      can(Action.READ, 'Message');
      can(Action.DELETE, 'Message', { userId: user.id });
      can(Action.READ, 'Participant');
      can(Action.CREATE, 'Participant');
      can(Action.CREATE, 'Message');
    }

    return build();
  }
}
