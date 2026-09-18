import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonaRelacionada } from './entities/persona-relacionada.entity';
import { CreatePersonaRelacionadaDto } from './dto/create-persona-relacionada.dto';
import { UpdatePersonaRelacionadaDto } from './dto/update-persona-relacionada.dto';

@Injectable()
export class PersonasRelacionadasService {
  constructor(
    @InjectRepository(PersonaRelacionada)
    private readonly personasRepo: Repository<PersonaRelacionada>,
  ) {}

  create(dto: CreatePersonaRelacionadaDto): Promise<PersonaRelacionada> {
    const persona = this.personasRepo.create(dto);
    return this.personasRepo.save(persona);
  }

  findAllBySocio(socioId: string): Promise<PersonaRelacionada[]> {
    return this.personasRepo.find({ where: { socioId } });
  }

  async findOne(id: string): Promise<PersonaRelacionada> {
    const persona = await this.personasRepo.findOne({ where: { id } });
    if (!persona) throw new NotFoundException('Persona relacionada no encontrada');
    return persona;
  }

  async update(id: string, dto: UpdatePersonaRelacionadaDto): Promise<PersonaRelacionada> {
    const persona = await this.findOne(id);
    Object.assign(persona, dto);
    return this.personasRepo.save(persona);
  }

  async remove(id: string): Promise<void> {
    const persona = await this.findOne(id);
    await this.personasRepo.remove(persona);
  }
}
