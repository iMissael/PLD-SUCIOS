import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socio, TipoPersona } from './entities/socio.entity';
import { CreateSocioDto } from './dto/create-socio.dto';
import { UpdateSocioDto } from './dto/update-socio.dto';
import { fechaNacimientoDeCurp } from '../common/curp/curp';

@Injectable()
export class SociosService {
  constructor(
    @InjectRepository(Socio)
    private readonly sociosRepo: Repository<Socio>,
  ) {}

  create(dto: CreateSocioDto): Promise<Socio> {
    const socio = this.sociosRepo.create(dto);
    this.validarCurp(socio);
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
    this.validarCurp(socio);
    return this.sociosRepo.save(socio);
  }

  async remove(id: string): Promise<void> {
    const socio = await this.findOne(id);
    await this.sociosRepo.remove(socio);
  }

  // El formato de la CURP ya lo valida el DTO; aquí se revisa que sea
  // coherente con el resto de los datos del socio.
  private validarCurp(socio: Socio): void {
    if (!socio.curp) return;
    if (socio.tipoPersona === TipoPersona.MORAL) {
      throw new BadRequestException('Una persona moral no tiene CURP');
    }
    if (socio.fechaNacimiento && fechaNacimientoDeCurp(socio.curp) !== socio.fechaNacimiento) {
      throw new BadRequestException(
        `La fecha de la CURP (${fechaNacimientoDeCurp(socio.curp)}) no coincide con fechaNacimiento (${socio.fechaNacimiento})`,
      );
    }
  }
}
