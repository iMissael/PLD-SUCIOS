import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { fechaNacimientoDeCurp } from '../common/curp/curp';
import { Acreditado, TipoPersona } from './entities/acreditado.entity';
import { CreateAcreditadoDto } from './dto/create-acreditado.dto';
import { UpdateAcreditadoDto } from './dto/update-acreditado.dto';

@Injectable()
export class AcreditadosService {
  constructor(
    @InjectRepository(Acreditado)
    private readonly acreditadosRepo: Repository<Acreditado>,
  ) {}

  async create(dto: CreateAcreditadoDto): Promise<Acreditado> {
    const acreditado = this.acreditadosRepo.create({
      ...dto,
      codigo: dto.codigo ?? `ACR-${randomUUID()}`,
    });
    this.validarCurp(acreditado);
    return this.acreditadosRepo.save(acreditado);
  }

  findAll(): Promise<Acreditado[]> {
    return this.acreditadosRepo.find({ relations: ['personasRelacionadas'] });
  }

  async findOne(id: string): Promise<Acreditado> {
    const acreditado = await this.acreditadosRepo.findOne({
      where: this.busquedaPorId(id),
      relations: ['personasRelacionadas'],
    });
    if (!acreditado) throw new NotFoundException('Acreditado no encontrado');
    return acreditado;
  }

  async update(id: string, dto: UpdateAcreditadoDto): Promise<Acreditado> {
    const acreditado = await this.findOne(id);
    Object.assign(acreditado, dto);
    this.validarCurp(acreditado);
    return this.acreditadosRepo.save(acreditado);
  }

  async remove(id: string): Promise<void> {
    const acreditado = await this.findOne(id);
    await this.acreditadosRepo.remove(acreditado);
  }

  private busquedaPorId(id: string): FindOptionsWhere<Acreditado>[] {
    const where: FindOptionsWhere<Acreditado>[] = [{ codigo: id }];
    if (isUUID(id)) where.push({ id });
    return where;
  }

  private validarCurp(acreditado: Acreditado): void {
    if (!acreditado.curp) return;
    if (acreditado.tipoPersona === TipoPersona.MORAL) {
      throw new BadRequestException('Una persona moral no tiene CURP');
    }
    if (
      acreditado.fechaNacimiento &&
      fechaNacimientoDeCurp(acreditado.curp) !== acreditado.fechaNacimiento
    ) {
      throw new BadRequestException(
        `La fecha de la CURP (${fechaNacimientoDeCurp(acreditado.curp)}) no coincide con fechaNacimiento (${acreditado.fechaNacimiento})`,
      );
    }
  }
}
