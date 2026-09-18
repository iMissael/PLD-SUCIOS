import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'cambia_este_secreto_en_dev',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const usuario = await this.usuariosService.findOne(payload.sub);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario inválido o inactivo');
    }
    // Esto queda disponible como request.user en los controllers.
    return { id: usuario.id, email: usuario.email, rol: usuario.rol };
  }
}
