import {
  IsDateString,
  IsInt,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class HistorialCrediticioDto {
  @IsString()
  referencia: string;

  @IsInt()
  @Min(1)
  @Max(3)
  tipoCreditoId: number;

  @IsNumber()
  @Min(0)
  monto: number;

  @IsDateString()
  fechaOtorgamiento: string;

  @IsString()
  estatus: string;
}
