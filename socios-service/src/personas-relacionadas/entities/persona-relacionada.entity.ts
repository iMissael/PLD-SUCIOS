import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Socio } from '../../socios/entities/socio.entity';

export enum TipoRelacion {
  AVAL = 'AVAL',
  CONYUGE = 'CONYUGE',
  REPRESENTANTE_LEGAL = 'REPRESENTANTE_LEGAL',
  BENEFICIARIO_CONTROLADOR = 'BENEFICIARIO_CONTROLADOR',
  REFERENCIA = 'REFERENCIA',
}

@Entity('personas_relacionadas')
export class PersonaRelacionada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Socio, (socio) => socio.personasRelacionadas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'socio_id' })
  socio: Socio;

  @Column({ name: 'socio_id' })
  socioId: string;

  @Column({ name: 'tipo_relacion', type: 'enum', enum: TipoRelacion })
  tipoRelacion: TipoRelacion;

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

  @Column({ nullable: true })
  parentesco?: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ nullable: true })
  email?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
