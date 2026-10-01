import { Column } from 'typeorm';

/**
 * Domicilio desglosado, reutilizable por socios y usuarios (empleados).
 *
 * Se usa como columna embebida: `@Column(() => Domicilio, { prefix: false })`.
 * Los nombres de columna (domicilio_calle, domicilio_numero_exterior, ...) se
 * fijan aquí porque el prefijo automático de TypeORM los generaría en
 * camelCase (domicilioCalle). En el JSON sale anidado como `domicilio: {...}`.
 */
export class Domicilio {
  @Column({ name: 'domicilio_calle', nullable: true })
  calle?: string;

  @Column({ name: 'domicilio_numero_exterior', nullable: true })
  numeroExterior?: string;

  @Column({ name: 'domicilio_numero_interior', nullable: true })
  numeroInterior?: string;

  @Column({ name: 'domicilio_colonia', nullable: true })
  colonia?: string;

  @Column({ name: 'domicilio_codigo_postal', length: 5, nullable: true })
  codigoPostal?: string;

  // Municipio o alcaldía
  @Column({ name: 'domicilio_municipio', nullable: true })
  municipio?: string;

  // Entidad federativa (estado)
  @Column({ name: 'domicilio_entidad', nullable: true })
  entidad?: string;

  @Column({ name: 'domicilio_pais', nullable: true })
  pais?: string;
}
