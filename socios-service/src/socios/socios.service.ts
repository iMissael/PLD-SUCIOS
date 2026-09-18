import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socio } from './entities/socio.entity';
import { CreateSocioDto } from './dto/create-socio.dto';
import { UpdateSocioDto } from './dto/update-socio.dto';

@Injectable()
export class SociosService {
  constructor(
    @InjectRepository(Socio)
    private readonly sociosRepo: Repository<Socio>,
  ) {}

  create(dto: CreateSocioDto): Promise<Socio> {
    const socio = this.sociosRepo.create(dto);
    return this.sociosRepo.save(socio);
  }

  findAll(): Promise<Socio[]> {
    return this.sociosRepo.find({ relations: ['personasRelacionadas'] });
  }

  async findOne(id: string): Promise<Socio> {
    const socio = await this.sociosRepo.findOne({
      where: { id },
      relations: ['personasRelacionadas'],
    });
    if (!socio) throw new NotFoundException('Socio no encontrado');
    return socio;
  }

  async update(id: string, dto: UpdateSocioDto): Promise<Socio> {
    const socio = await this.findOne(id);
    Object.assign(socio, dto);
    return this.sociosRepo.save(socio);
  }

  async remove(id: string): Promise<void> {
    const socio = await this.findOne(id);
    await this.sociosRepo.remove(socio);
  }
}
