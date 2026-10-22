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

@Controller('personas-relacionadas')
@UseGuards(JwtAuthGuard)
export class PersonasRelacionadasController {
  constructor(private readonly personasService: PersonasRelacionadasService) {}

  @Post()
  create(@Body() dto: CreatePersonaRelacionadaDto) {
    return this.personasService.create(dto);
  }

  // GET /personas-relacionadas?acreditadoId=<uuid-o-codigo>
  @Get()
  findAllByAcreditado(@Query('acreditadoId') acreditadoId: string) {
    return this.personasService.findAllByAcreditado(acreditadoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePersonaRelacionadaDto) {
    return this.personasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }
}
