import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePersonaRelacionadaDto } from './create-persona-relacionada.dto';

// acreditadoId no se actualiza aquí: si necesitas mover la persona a otro acreditado,
// bórrala y créala de nuevo (evita reasignaciones accidentales).
export class UpdatePersonaRelacionadaDto extends PartialType(
  OmitType(CreatePersonaRelacionadaDto, ['acreditadoId'] as const),
) {}
