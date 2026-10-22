import { PartialType } from '@nestjs/mapped-types';
import { CreateAcreditadoDto } from './create-acreditado.dto';

export class UpdateAcreditadoDto extends PartialType(CreateAcreditadoDto) {}
