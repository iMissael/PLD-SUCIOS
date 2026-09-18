import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Socio } from './entities/socio.entity';
import { SociosService } from './socios.service';
import { SociosController } from './socios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Socio])],
  controllers: [SociosController],
  providers: [SociosService],
  exports: [SociosService],
})
export class SociosModule {}
