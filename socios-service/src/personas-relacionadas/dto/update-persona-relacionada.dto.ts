import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePersonaRelacionadaDto } from './create-persona-relacionada.dto';

// socioId no se actualiza aquí: si necesitas mover la persona a otro socio,
// bórrala y créala de nuevo (evita reasignaciones accidentales).
export class UpdatePersonaRelacionadaDto extends PartialType(
  OmitType(CreatePersonaRelacionadaDto, ['socioId'] as const),
) {}
