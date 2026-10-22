import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAcreditadoDto } from './create-acreditado.dto';

// El código es el ID público del acreditado y la fecha de alta solo se fija
// al crearlo: ninguno de los dos se cambia después.
export class UpdateAcreditadoDto extends PartialType(
  OmitType(CreateAcreditadoDto, ['codigo', 'fechaAlta'] as const),
) {}
