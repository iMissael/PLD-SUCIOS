import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { ValidateBy, ValidationOptions } from 'class-validator';
import { esCurpValida } from './curp';

/**
 * Normaliza la CURP (trim + mayúsculas) y valida estructura, fecha y
 * dígito verificador.
 */
export function IsCurp(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value)),
    ValidateBy(
      {
        name: 'isCurp',
        validator: {
          validate: (value) => esCurpValida(value),
          defaultMessage: () =>
            '$property no es una CURP válida (revisa formato, fecha y dígito verificador)',
        },
      },
      validationOptions,
    ),
  );
}
