import { Permission, PrismaClient, Role } from '@prisma/client';
import { CreatePermissionDto, CreateRoleDto } from 'src/users/dto/admin.dto';
const prisma = new PrismaClient();

const roles: CreateRoleDto[] = [
  {
    name: 'SuperAdmin',
  },
  {
    name: 'moderator',
  },
  {
    name: 'user',
  },
];

const permissions: CreatePermissionDto[] = [
  {
    name: 'view-role',
    roles: ['SuperAdmin'],
  },
  {
    name: 'create-role',
    roles: ['SuperAdmin'],
  },
  {
    name: 'edit-role',
    roles: ['SuperAdmin'],
  },
  {
    name: 'delete-role',
    roles: ['SuperAdmin'],
  },
  {
    name: 'view-users',
    roles: ['SuperAdmin', 'moderator', 'user'],
  },
  {
    name: 'create-user',
    roles: ['SuperAdmin'],
  },
  {
    name: 'edit-user',
    roles: ['SuperAdmin', 'user'],
  },
  {
    name: 'delete-user',
    roles: ['SuperAdmin'],
  },
  {
    name: 'create-post',
    roles: ['SuperAdmin', 'moderator', 'user'],
  },
  {
    name: 'edit-post',
    roles: ['SuperAdmin', 'moderator', 'user'],
  },
  {
    name: 'delete-post',
    roles: ['SuperAdmin', 'moderator', 'user'],
  },
];
async function main() {
  // create role
  await prisma.role.createMany({
    data: roles,
  });
  const roleCreate: Role[] = await prisma.role.findMany();
  // Crear un array para almacenar las promesas de creación de permisos
  const permissionCreates: Promise<Permission>[] = permissions.map(
    async (permission: CreatePermissionDto) => {
      // Obtener los IDs de los roles que corresponden a los nombres de roles en el permiso
      const rolesIds = roleCreate
        .filter((role: Role) => permission.roles.includes(role.name))
        .map((role: Role) => ({ id: role.id })); // Conectar usando el ID del rol

      // Upsert el permiso en la base de datos
      const permissionCreate = await prisma.permission.upsert({
        where: {
          name: permission.name,
        },
        create: {
          name: permission.name,
          roles: {
            connect: rolesIds, // Conectar los roles usando los IDs válidos
          },
        },
        update: {},
      });

      return permissionCreate; // Retornar el permiso creado
    },
  );
  // Esperar a que todas las promesas de creación de permisos se completen
  const createdPermissions: Permission[] = await Promise.all(permissionCreates);

  console.log(createdPermissions); // Mostrar permisos creados
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
