import { z } from 'zod';

/**
 * @description: create role schema
 */

export const createRoleSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .omit({ id: true });

export type CreateRoleDto = z.infer<typeof createRoleSchema>;

/**
 * @description: create permission schema
 */

export const createPermissionSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    roles: z.array(z.string()),
  })
  .omit({ id: true });

export type CreatePermissionDto = z.infer<typeof createPermissionSchema>;
