import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Acreditado } from '../acreditados/entities/acreditado.entity';
import { PersonaRelacionada } from './entities/persona-relacionada.entity';
import { CreatePersonaRelacionadaDto } from './dto/create-persona-relacionada.dto';
import { UpdatePersonaRelacionadaDto } from './dto/update-persona-relacionada.dto';

@Injectable()
export class PersonasRelacionadasService {
  constructor(
    @InjectRepository(PersonaRelacionada)
    private readonly personasRepo: Repository<PersonaRelacionada>,
    @InjectRepository(Acreditado)
    private readonly acreditadosRepo: Repository<Acreditado>,
  ) {}

  async create(dto: CreatePersonaRelacionadaDto): Promise<PersonaRelacionada> {
    const acreditado = await this.findAcreditado(dto.acreditadoId);
    const persona = this.personasRepo.create({
      ...dto,
      acreditadoId: acreditado.id,
    });
    return this.personasRepo.save(persona);
  }

  async findAllByAcreditado(acreditadoId: string): Promise<PersonaRelacionada[]> {
    const acreditado = await this.findAcreditado(acreditadoId);
    return this.personasRepo.find({ where: { acreditadoId: acreditado.id } });
  }

  async findOne(id: string): Promise<PersonaRelacionada> {
    if (!isUUID(id)) throw new NotFoundException('Persona relacionada no encontrada');
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

  private async findAcreditado(id: string): Promise<Acreditado> {
    if (!id) throw new BadRequestException('acreditadoId es obligatorio');
    const where: FindOptionsWhere<Acreditado>[] = [{ codigo: id }];
    if (isUUID(id)) where.push({ id });
    const acreditado = await this.acreditadosRepo.findOne({ where });
    if (!acreditado) throw new NotFoundException('Acreditado no encontrado');
    return acreditado;
  }
}
