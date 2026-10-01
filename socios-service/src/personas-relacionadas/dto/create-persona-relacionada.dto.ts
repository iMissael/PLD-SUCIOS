import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoRelacion } from '../entities/persona-relacionada.entity';
import { IsCurp } from '../../common/curp/is-curp.decorator';

export class CreatePersonaRelacionadaDto {
  @IsUUID()
  socioId: string;

  @IsEnum(TipoRelacion)
  tipoRelacion: TipoRelacion;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  apellidoPaterno?: string;

  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @IsOptional()
  @IsString()
  rfc?: string;

  @IsOptional()
  @IsCurp()
  curp?: string;

  @IsOptional()
  @IsString()
  parentesco?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
