import { z } from 'zod';
// Asegúrate de importar el enum Role desde el cliente Prisma generado
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  // email: Requerido, debe ser un string y formato de email válido.
  email: z
    .string({
      required_error: 'Email is required', // Mensaje si no se provee
      invalid_type_error: 'Email must be a string', // Mensaje si no es string
    })
    .email({
      message: 'Invalid email address', // Mensaje si el formato no es válido
    }),

  // password: Requerido, debe ser un string.
  // Puedes añadir más validaciones, como longitud mínima.
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(8, { message: 'Password must be at least 8 characters long' }), // Ejemplo: mínimo 8 caracteres

  // role: Opcional. Si no se provee, Prisma usará el valor por defecto (DEFAULT).
  // Validamos que el valor (si se provee) sea uno de los definidos en el enum Role.
  role: z
    .nativeEnum(Role, {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      errorMap: (issue, ctx) => ({ message: 'Invalid role provided' }), // Mensaje de error personalizado
    })
    .optional(),
});

// El tipo CreateUserDto se infiere del esquema Zod.
export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  // email: Opcional, pero si se provee, debe ser un string y formato de email válido.
  email: z
    .string({
      invalid_type_error: 'Email must be a string',
    })
    .email({
      message: 'Invalid email address',
    })
    .optional(),

  // password: Opcional, pero si se provee, debe ser un string.
  password: z
    .string({
      invalid_type_error: 'Password must be a string',
    })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .optional(),

  // role: Opcional. Si se provee, debe ser uno de los definidos en el enum Role.
  role: z
    .nativeEnum(Role, {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      errorMap: (issue, ctx) => ({ message: 'Invalid role provided' }),
    })
    .optional(),
});

export type UpdateUserDto = z.infer<typeof createUserSchema> & {
  email?: never; // Evitamos que se pueda actualizar el email
  role?: Role;
};
