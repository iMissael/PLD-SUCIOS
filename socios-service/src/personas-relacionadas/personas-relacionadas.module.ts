import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonaRelacionada } from './entities/persona-relacionada.entity';
import { PersonasRelacionadasService } from './personas-relacionadas.service';
import { PersonasRelacionadasController } from './personas-relacionadas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PersonaRelacionada])],
  controllers: [PersonasRelacionadasController],
  providers: [PersonasRelacionadasService],
  exports: [PersonasRelacionadasService],
})
export class PersonasRelacionadasModule {}
