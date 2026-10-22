import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Acreditado } from './entities/acreditado.entity';
import { AcreditadosController } from './acreditados.controller';
import { AcreditadosService } from './acreditados.service';

@Module({
  imports: [TypeOrmModule.forFeature([Acreditado])],
  controllers: [AcreditadosController],
  providers: [AcreditadosService, JwtAuthGuard],
  exports: [AcreditadosService],
})
export class AcreditadosModule {}
