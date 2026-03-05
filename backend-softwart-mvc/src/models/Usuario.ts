// Generado automáticamente por generate-models.js
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Rol } from "./Rol";

@Entity("usuario")
export class Usuario {

  @PrimaryGeneratedColumn()
  id_usuario!: number;

  @Column({ unique: true })
  correo!: string;

  @Column()
  clave!: string;

  @Column({ type: "boolean" })
  estado!: boolean;

  @ManyToOne(() => Rol, (x) => x.usuarios)
  @JoinColumn({ name: "id_rol" })
  rol!: Rol;

}
