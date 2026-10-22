import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAcreditadoDto } from './dto/create-acreditado.dto';
import { UpdateAcreditadoDto } from './dto/update-acreditado.dto';
import { Acreditado } from './entities/acreditado.entity';
import { AcreditadosService } from './acreditados.service';

@Controller('acreditados')
@UseGuards(JwtAuthGuard)
export class AcreditadosController {
  constructor(private readonly acreditadosService: AcreditadosService) {}

  @Post()
  async create(@Body() dto: CreateAcreditadoDto) {
    return this.present(await this.acreditadosService.create(dto));
  }

  @Get()
  async findAll() {
    return (await this.acreditadosService.findAll()).map((acreditado) =>
      this.present(acreditado),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.present(await this.acreditadosService.findOne(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAcreditadoDto) {
    return this.present(await this.acreditadosService.update(id, dto));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.acreditadosService.remove(id);
  }

  private present(acreditado: Acreditado) {
    const { id, codigo, personasRelacionadas, ...datos } = acreditado;
    if (!codigo) throw new NotFoundException('Acreditado sin código público');
    return {
      ...datos,
      id: codigo,
      // Las personas relacionadas apuntan al acreditado por su código público, no por el UUID interno.
      personasRelacionadas: personasRelacionadas?.map((persona) => ({
        ...persona,
        acreditadoId: codigo,
      })),
    };
  }
}
