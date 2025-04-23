import { z } from 'zod';

// Esquema para crear un nuevo canal (CreateChannelDto)
export const CreateChannelSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre del canal es obligatorio.', // Mensaje de error si no se proporciona
      invalid_type_error: 'El nombre debe ser una cadena de texto.', // Mensaje si el tipo es incorrecto
    })
    .min(1, { message: 'El nombre del canal no puede estar vacío.' }) // Validación de longitud mínima
    .max(100, {
      message: 'El nombre del canal no puede exceder los 100 caracteres.',
    }), // Validación opcional de longitud máxima

  description: z
    .string({
      invalid_type_error: 'La descripción debe ser una cadena de texto.',
    })
    .max(500, {
      message: 'La descripción no puede exceder los 500 caracteres.',
    }) // Validación opcional de longitud máxima
    .optional() // La descripción es opcional
    .nullable(), // Permite que la descripción sea null explícitamente
});

// Tipo inferido del esquema de creación
export type CreateChannelDto = z.infer<typeof CreateChannelSchema>;

// Esquema para actualizar un canal existente (UpdateChannelDto)
// Hacemos todos los campos opcionales usando .partial()
export const UpdateChannelSchema = CreateChannelSchema.partial();

// Tipo inferido del esquema de actualización
export type UpdateChannelDto = z.infer<typeof UpdateChannelSchema>;
