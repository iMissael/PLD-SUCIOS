import { IsEmail, IsEnum, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RolUsuario } from '../entities/usuario.entity';
import { DomicilioDto } from '../../common/domicilio/domicilio.dto';
import { IsCurp } from '../../common/curp/is-curp.decorator';

export class CreateUsuarioDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @IsOptional()
  @IsCurp()
  curp?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DomicilioDto)
  domicilio?: DomicilioDto;
}
