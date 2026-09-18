import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EstatusSocio, NivelRiesgo, TipoPersona } from '../entities/socio.entity';

export class CreateSocioDto {
  @IsEnum(TipoPersona)
  tipoPersona: TipoPersona;

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
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  nacionalidad?: string;

  @IsOptional()
  @IsString()
  zonaGeografica?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  localidad?: string;

  @IsOptional()
  @IsString()
  entidad?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  tiempoConstitucion?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienciaActividad?: number;

  @IsOptional()
  @IsString()
  actividadEconomica?: string;

  @IsOptional()
  @IsBoolean()
  tieneHistorial?: boolean;

  @IsOptional()
  @IsString()
  origenRecursos?: string;

  @IsOptional()
  @IsString()
  destinoRecursos?: string;

  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(EstatusSocio)
  estatus?: EstatusSocio;

  @IsOptional()
  @IsEnum(NivelRiesgo)
  nivelRiesgo?: NivelRiesgo;

  @IsOptional()
  @IsBoolean()
  esPep?: boolean;
}
