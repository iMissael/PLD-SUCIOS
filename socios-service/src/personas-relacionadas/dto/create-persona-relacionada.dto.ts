import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoRelacion } from '../entities/persona-relacionada.entity';

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
  @IsString()
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
