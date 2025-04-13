// src/common/pipes/zod-validation.pipe.ts
import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      // Intenta parsear/validar los datos de entrada con el esquema Zod
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      // Si Zod lanza un error (fallo de validación), captura los detalles
      // y lanza una BadRequestException de NestJS con los mensajes de Zod.
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: error.flatten().fieldErrors, // Formatea los errores de Zod
        });
      }
      // Si es otro tipo de error, lánzalo como está
      throw new BadRequestException('Validation failed');
    }
  }
}

// Necesitarás importar 'z' también aquí si no está global
import { z } from 'zod';
