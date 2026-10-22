import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: 'acreditados-service',
      status: 'ok',
      message: 'API de acreditados funcionando',
      endpoints: {
        auth: '/auth/login',
        usuarios: '/usuarios',
        acreditados: '/acreditados',
        personasRelacionadas: '/personas-relacionadas',
      },
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'acreditados-service',
      timestamp: new Date().toISOString(),
    };
  }
}
