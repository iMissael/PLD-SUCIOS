import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PersonaRelacionada } from '../../personas-relacionadas/entities/persona-relacionada.entity';
import { Domicilio } from '../../common/domicilio/domicilio.embedded';

export enum TipoPersona {
  FISICA = 'FISICA',
  FISICA_ACTIVIDAD_EMPRESARIAL = 'FISICA_ACTIVIDAD_EMPRESARIAL',
  MORAL = 'MORAL',
}

export enum EstatusAcreditado {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export enum NivelRiesgo {
  BAJO = 'BAJO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
}

export interface CreditoSolicitado {
  referencia: string;
  tipoCreditoId: number;
  monto: number;
  origenRecursosId: number;
  destinoRecursosId: number;
  canalPagoId: number;
}

export interface HistorialCrediticio {
  referencia: string;
  tipoCreditoId: number;
  monto: number;
  fechaOtorgamiento: string;
  estatus: string;
}

@Entity('acreditados')
export class Acreditado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  codigo: string;

  @Column({
    name: 'tipo_persona',
    type: 'enum',
    enum: TipoPersona,
    enumName: 'acreditados_tipo_persona_enum',
    default: TipoPersona.FISICA,
  })
  tipoPersona: TipoPersona;

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

  @Column({ name: 'pais_nacimiento', nullable: true })
  paisNacimiento?: string;

  @Column({ nullable: true })
  nacionalidad?: string;

  @Column({ name: 'zona_geografica', nullable: true })
  zonaGeografica?: string;

  @Column({ nullable: true })
  pais?: string;

  @Column({ nullable: true })
  localidad?: string;

  @Column({ nullable: true })
  entidad?: string;

  @Column({ name: 'tiempo_constitucion', type: 'int', nullable: true })
  tiempoConstitucion?: number;

  @Column({ name: 'experiencia_actividad', type: 'int', nullable: true })
  experienciaActividad?: number;

  @Column({ name: 'actividad_economica', nullable: true })
  actividadEconomica?: string;

  @Column({ name: 'fecha_inicio_actividad', type: 'date', nullable: true })
  fechaInicioActividad?: string;

  @Column({ name: 'credito_solicitado', type: 'jsonb', nullable: true })
  creditoSolicitado?: CreditoSolicitado;

  @Column({ name: 'historial_crediticio', type: 'jsonb', nullable: true })
  historialCrediticio?: HistorialCrediticio[];

  @Column({ name: 'tiene_historial', default: false })
  tieneHistorial: boolean;

  @Column({ name: 'origen_recursos', type: 'text', nullable: true })
  origenRecursos?: string;

  @Column({ name: 'destino_recursos', type: 'text', nullable: true })
  destinoRecursos?: string;

  @Column(() => Domicilio, { prefix: false })
  domicilio: Domicilio;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'fecha_alta', type: 'date', default: () => 'CURRENT_DATE' })
  fechaAlta: string;

  @Column({
    type: 'enum',
    enum: EstatusAcreditado,
    enumName: 'acreditados_estatus_enum',
    default: EstatusAcreditado.ACTIVO,
  })
  estatus: EstatusAcreditado;

  @Column({
    name: 'nivel_riesgo',
    type: 'enum',
    enum: NivelRiesgo,
    enumName: 'acreditados_nivel_riesgo_enum',
    nullable: true,
  })
  nivelRiesgo?: NivelRiesgo;

  @Column({ name: 'es_pep', default: false })
  esPep: boolean;

  @OneToMany(() => PersonaRelacionada, (persona) => persona.acreditado, { cascade: false })
  personasRelacionadas: PersonaRelacionada[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
