// src/seeds/seedPermisos.ts
import { AppDataSource } from "../data-source";
import { Permiso }       from "../models/Permiso";
import { Rol }           from "../models/Rol";
import { PermisoRol }    from "../models/PermisoRol";

const PERMISOS_BASE = [
  { nombre: "VER_PERFIL",               descripcion: "Ver el perfil del cliente" },
  { nombre: "EDITAR_PERFIL",            descripcion: "Editar el perfil del cliente" },
  { nombre: "VER_CITAS",                descripcion: "Consultar citas del cliente" },
  { nombre: "ELIMINAR_CUENTA",          descripcion: "Eliminar cuenta del cliente" },
  { nombre: "GESTIONAR_CLIENTES",       descripcion: "CRUD de clientes" },
  { nombre: "GESTIONAR_CITAS",          descripcion: "CRUD de citas" },
  { nombre: "GESTIONAR_DETALLE_VENTA",  descripcion: "CRUD de detalle de venta" },
  { nombre: "GESTIONAR_MARCOS",         descripcion: "CRUD de marcos" },
  { nombre: "GESTIONAR_PAGOS",          descripcion: "CRUD de pagos" },
  { nombre: "GESTIONAR_VENTAS",         descripcion: "CRUD de ventas" },
  { nombre: "GESTIONAR_SERVICIOS",      descripcion: "CRUD de servicios" },
  { nombre: "GESTIONAR_USUARIOS",       descripcion: "CRUD de usuarios" },
  { nombre: "GESTIONAR_ROLES",          descripcion: "CRUD de roles" },
  { nombre: "GESTIONAR_PERMISOS",       descripcion: "CRUD de permisos" },
  { nombre: "GESTIONAR_PERMISO_ROL",    descripcion: "CRUD de relaciones permiso-rol" },
  { nombre: "GESTIONAR_ESTADO_CITA",    descripcion: "CRUD de estados de cita" },
  { nombre: "GESTIONAR_ESTADO_PAGO",    descripcion: "CRUD de estados de pago" },
  { nombre: "GESTIONAR_ESTADO_SERVICIO",descripcion: "CRUD de estados de servicio" },
  { nombre: "GESTIONAR_METODO_PAGO",    descripcion: "CRUD de métodos de pago" },
];

const PERMISOS_CLIENTE = [
  "VER_PERFIL", "EDITAR_PERFIL", "VER_CITAS", "ELIMINAR_CUENTA",
];

async function asignarPermisos(
  permisoRolRepo: ReturnType<typeof AppDataSource.getRepository<PermisoRol>>,
  rol: Rol,
  permisos: Permiso[],
): Promise<void> {
  for (const permiso of permisos) {
    const existe = await permisoRolRepo
      .createQueryBuilder("pr")
      .where("pr.id_rol = :idRol",           { idRol: rol.id_rol })
      .andWhere("pr.id_permiso = :idPermiso", { idPermiso: permiso.id_permiso })
      .getOne();

    if (!existe) {
      const pr = new PermisoRol();
      pr.permiso = permiso;
      pr.rol     = rol;
      await permisoRolRepo.save(pr);
    }
  }
}

export async function seedPermisos(): Promise<void> {
  const permisoRepo    = AppDataSource.getRepository(Permiso);
  const rolRepo        = AppDataSource.getRepository(Rol);
  const permisoRolRepo = AppDataSource.getRepository(PermisoRol);

  // ── 1. Crear permisos que no existan ──────────────────────────────────────
  for (const { nombre, descripcion } of PERMISOS_BASE) {
    const existe = await permisoRepo.findOne({ where: { nombre } });
    if (!existe) {
      await permisoRepo.save(
        permisoRepo.create({ nombre, descripcion, estado: true }),
      );
    }
  }
  console.log("✅  Permisos sembrados");

  // ── 2. Cargar todos los permisos ya guardados ─────────────────────────────
  const todosLosPermisos = await permisoRepo.find();
  const permisosCliente  = todosLosPermisos.filter(p =>
    PERMISOS_CLIENTE.includes(p.nombre),
  );

  // ── 3. Asignar a Admin → todos ────────────────────────────────────────────
  const admin = await rolRepo.findOne({ where: { nombre: "Admin" } });
  if (admin) {
    await asignarPermisos(permisoRolRepo, admin, todosLosPermisos);
    console.log("✅  Permisos asignados a Admin");
  }

  // ── 4. Asignar a Cliente → solo los 4 básicos ─────────────────────────────
  const cliente = await rolRepo.findOne({ where: { nombre: "Cliente" } });
  if (cliente) {
    await asignarPermisos(permisoRolRepo, cliente, permisosCliente);
    console.log("✅  Permisos asignados a Cliente");
  }
}
