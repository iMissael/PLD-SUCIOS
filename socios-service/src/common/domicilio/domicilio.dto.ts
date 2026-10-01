import { IsOptional, IsString, Matches } from 'class-validator';

export class DomicilioDto {
  @IsOptional()
  @IsString()
  calle?: string;

  @IsOptional()
  @IsString()
  numeroExterior?: string;

  @IsOptional()
  @IsString()
  numeroInterior?: string;

  @IsOptional()
  @IsString()
  colonia?: string;

  @IsOptional()
  @Matches(/^\d{5}$/, { message: 'codigoPostal debe tener 5 dígitos' })
  codigoPostal?: string;

  @IsOptional()
  @IsString()
  municipio?: string;

  @IsOptional()
  @IsString()
  entidad?: string;

  @IsOptional()
  @IsString()
  pais?: string;
}
