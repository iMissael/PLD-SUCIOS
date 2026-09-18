import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SociosService } from './socios.service';
import { CreateSocioDto } from './dto/create-socio.dto';
import { UpdateSocioDto } from './dto/update-socio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('socios')
@UseGuards(JwtAuthGuard)
export class SociosController {
  constructor(private readonly sociosService: SociosService) {}

  @Post()
  create(@Body() dto: CreateSocioDto) {
    return this.sociosService.create(dto);
  }

  @Get()
  findAll() {
    return this.sociosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sociosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSocioDto) {
    return this.sociosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sociosService.remove(id);
  }
}
