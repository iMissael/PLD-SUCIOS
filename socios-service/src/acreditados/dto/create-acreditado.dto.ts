import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateBy,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EstatusAcreditado,
  NivelRiesgo,
  TipoPersona,
} from '../entities/acreditado.entity';
import { DomicilioDto } from '../../common/domicilio/domicilio.dto';
import { IsCurp } from '../../common/curp/is-curp.decorator';
import { CreditoSolicitadoDto } from './credito-solicitado.dto';
import { HistorialCrediticioDto } from './historial-crediticio.dto';

function IsClaveActividadEconomica() {
  return ValidateBy({
    name: 'isClaveActividadEconomica',
    validator: {
      validate: (value: unknown) =>
        typeof value === 'string' &&
        (!/^\d+$/.test(value) ||
          (/^\d{6,7}$/.test(value) &&
            Number(value) >= 100008 &&
            Number(value) <= 9999999)),
      defaultMessage: () =>
        'actividadEconomica debe ser una clave SAT entre 100008 y 9999999',
    },
  });
}

export class CreateAcreditadoDto {
  @IsOptional()
  @IsString()
  codigo?: string;

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
  @ValidateIf((_object, value) => value !== '')
  @IsCurp()
  curp?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  paisNacimiento?: string;

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
  @IsClaveActividadEconomica()
  actividadEconomica?: string;

  @IsOptional()
  @IsDateString()
  fechaInicioActividad?: string;

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
  @ValidateNested()
  @Type(() => DomicilioDto)
  domicilio?: DomicilioDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreditoSolicitadoDto)
  creditoSolicitado?: CreditoSolicitadoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistorialCrediticioDto)
  historialCrediticio?: HistorialCrediticioDto[];

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // Si no viene, la base de datos usa la fecha del día (CURRENT_DATE).
  @IsOptional()
  @IsDateString()
  fechaAlta?: string;

  @IsOptional()
  @IsEnum(EstatusAcreditado)
  estatus?: EstatusAcreditado;

  @IsOptional()
  @IsEnum(NivelRiesgo)
  nivelRiesgo?: NivelRiesgo;

  @IsOptional()
  @IsBoolean()
  esPep?: boolean;
}
