import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAcreditadoDto } from './create-acreditado.dto';

// El código es el ID público del acreditado: no se cambia después de crearlo.
export class UpdateAcreditadoDto extends PartialType(
  OmitType(CreateAcreditadoDto, ['codigo'] as const),
) {}
