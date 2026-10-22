import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PersonasRelacionadasService } from './personas-relacionadas.service';
import { CreatePersonaRelacionadaDto } from './dto/create-persona-relacionada.dto';
import { UpdatePersonaRelacionadaDto } from './dto/update-persona-relacionada.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonaRelacionada } from './entities/persona-relacionada.entity';

@Controller('personas-relacionadas')
@UseGuards(JwtAuthGuard)
export class PersonasRelacionadasController {
  constructor(private readonly personasService: PersonasRelacionadasService) {}

  @Post()
  async create(@Body() dto: CreatePersonaRelacionadaDto) {
    return this.present(await this.personasService.create(dto));
  }

  // GET /personas-relacionadas?acreditadoId=<uuid-o-codigo>
  @Get()
  async findAllByAcreditado(@Query('acreditadoId') acreditadoId: string) {
    const personas = await this.personasService.findAllByAcreditado(acreditadoId);
    return personas.map((persona) => this.present(persona));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.present(await this.personasService.findOne(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePersonaRelacionadaDto) {
    return this.present(await this.personasService.update(id, dto));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }

  // Expone el código público del acreditado en lugar de su UUID interno.
  private present(persona: PersonaRelacionada) {
    const { acreditado, ...datos } = persona;
    return { ...datos, acreditadoId: acreditado?.codigo ?? persona.acreditadoId };
  }
}
