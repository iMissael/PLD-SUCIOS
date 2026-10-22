import {
  IsInt,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreditoSolicitadoDto {
  @IsString()
  referencia: string;

  @IsInt()
  @Min(1)
  @Max(3)
  tipoCreditoId: number;

  @IsNumber()
  @Min(0.01)
  monto: number;

  @IsInt()
  @Min(1)
  origenRecursosId: number;

  @IsInt()
  @Min(1)
  destinoRecursosId: number;

  @IsInt()
  @Min(1)
  @Max(3)
  canalPagoId: number;
}
