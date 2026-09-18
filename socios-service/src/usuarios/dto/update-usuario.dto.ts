import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';

// Nota: si no tienes @nestjs/mapped-types instalado, agrégalo con
// `pnpm add @nestjs/mapped-types`. Se omite el password del update
// para no reescribirlo por accidente vía PUT/PATCH genérico.
export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['password'] as const),
) {}
