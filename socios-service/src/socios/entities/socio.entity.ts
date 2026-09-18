import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PersonaRelacionada } from '../../personas-relacionadas/entities/persona-relacionada.entity';

export enum TipoPersona {
  FISICA = 'FISICA',
  MORAL = 'MORAL',
}

export enum EstatusSocio {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export enum NivelRiesgo {
  BAJO = 'BAJO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
}

@Entity('socios')
export class Socio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tipo_persona', type: 'enum', enum: TipoPersona, default: TipoPersona.FISICA })
  tipoPersona: TipoPersona;

  // Para persona física: nombre(s). Para persona moral: razón social.
  @Column()
  nombre: string;

  @Column({ name: 'apellido_paterno', nullable: true })
  apellidoPaterno?: string;

  @Column({ name: 'apellido_materno', nullable: true })
  apellidoMaterno?: string;

  @Column({ nullable: true })
  rfc?: string;

  @Column({ nullable: true })
  curp?: string;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento?: string;

  @Column({ nullable: true })
  nacionalidad?: string;

  @Column({ name: 'zona_geografica', nullable: true })
  zonaGeografica?: string;

  @Column({ nullable: true })
  pais?: string;

  @Column({ nullable: true })
  localidad?: string;

  // Entidad federativa (estado)
  @Column({ nullable: true })
  entidad?: string;

  // Años desde la constitución (útil sobre todo para persona moral)
  @Column({ name: 'tiempo_constitucion', type: 'int', nullable: true })
  tiempoConstitucion?: number;

  // Años de experiencia en su actividad económica
  @Column({ name: 'experiencia_actividad', type: 'int', nullable: true })
  experienciaActividad?: number;

  @Column({ name: 'actividad_economica', nullable: true })
  actividadEconomica?: string;

  @Column({ name: 'tiene_historial', default: false })
  tieneHistorial: boolean;

  @Column({ name: 'origen_recursos', type: 'text', nullable: true })
  origenRecursos?: string;

  @Column({ name: 'destino_recursos', type: 'text', nullable: true })
  destinoRecursos?: string;

  @Column({ nullable: true })
  domicilio?: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'fecha_alta', type: 'date', default: () => 'CURRENT_DATE' })
  fechaAlta: string;

  @Column({ type: 'enum', enum: EstatusSocio, default: EstatusSocio.ACTIVO })
  estatus: EstatusSocio;

  @Column({ name: 'nivel_riesgo', type: 'enum', enum: NivelRiesgo, nullable: true })
  nivelRiesgo?: NivelRiesgo;

  @Column({ name: 'es_pep', default: false })
  esPep: boolean;

  @OneToMany(() => PersonaRelacionada, (persona) => persona.socio, { cascade: false })
  personasRelacionadas: PersonaRelacionada[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
