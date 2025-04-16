import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { Channel, Message, Participant, User } from '@prisma/client';
import { Action, Role } from 'src/utils/global.enum';

// Definimos todos los sujetos como strings o 'all'
type AppSubjects =
  | Subjects<{
      User: User;
      Channel: Channel;
      Participant: Participant;
      Message: Message;
    }>
  | 'all';

export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
  defineAbility(user: User) {
    // Usamos AbilityBuilder con createPrismaAbility para integración con Prisma
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    // Definimos los permisos basados en el rol del usuario
    switch (user.role) {
      case Role.SUPER_ADMIN:
        // El SUPER_ADMIN puede gestionar ('manage') todo ('all')
        can(Action.MANAGE, 'all');
        break;

      case Role.ADMIN:
        // El ADMIN puede gestionar todo, excepto eliminar a un SUPER_ADMIN
        can(Action.MANAGE, 'all');
        cannot(Action.DELETE, 'User', { role: Role.SUPER_ADMIN });
        break;

      case Role.MODERADOR:
        // El MODERADOR puede gestionar su propio perfil de usuario
        can(Action.MANAGE, 'User', { id: user.id });
        // El MODERADOR puede gestionar completamente Canales, Mensajes y Participantes
        can(Action.MANAGE, 'Channel');
        can(Action.MANAGE, 'Message');
        can(Action.MANAGE, 'Participant');
        break;

      case Role.DEFAULT:
        // El usuario DEFAULT tiene permisos más restringidos (acciones propias)

        // Usuario: Puede leer y actualizar su propio perfil
        can([Action.READ, Action.UPDATE], 'User', { id: user.id });

        // Canal: Puede crear y leer canales
        can([Action.CREATE, Action.READ], 'Channel');
        // No puede eliminar canales (podrías añadir reglas para actualizar o eliminar canales que creó, si es necesario)
        cannot(Action.DELETE, 'Channel');

        // Mensaje: Puede crear y leer mensajes. Puede eliminar sus propios mensajes.
        can([Action.CREATE, Action.READ], 'Message');
        can(Action.DELETE, 'Message', { userId: user.id });
        // Podrías restringir la lectura solo a mensajes de canales donde es participante

        // Participante: Puede crear (unirse a canal) y leer participantes. Puede eliminarse a sí mismo (salir de canal).
        can([Action.CREATE, Action.READ], 'Participant');
        can(Action.DELETE, 'Participant', { userId: user.id });
        break;

      default:
        // Por defecto, si no hay rol o es desconocido, no se otorgan permisos explícitos.
        // Podrías definir aquí permisos mínimos si lo necesitas.
        break;
    }

    // Construye y devuelve el objeto de habilidad con las reglas definidas
    return build();
  }
}
