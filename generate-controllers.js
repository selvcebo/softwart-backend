// ─────────────────────────────────────────────────────────────────────────────
//  generate-controllers.js
//  Ejecutar con:  node generate-controllers.js
//  Genera los controladores Express+TypeORM en ./controllers/<Nombre>Controller.ts
// ─────────────────────────────────────────────────────────────────────────────

const fs   = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────────────────────
//  ESQUEMA DE CONTROLADORES
//
//  name          : nombre de la entidad (PascalCase) → clase del modelo
//  file          : nombre del archivo a generar (sin extensión)
//  pkField       : campo PK de la entidad
//  hasEstado     : true → generar endpoint PATCH /:id/estado
//  dependents    : tablas hijas que bloquean el DELETE
//    { entity, field }  entity = nombre clase, field = campo FK en esa entidad
//  catalogValues : si es tabla catálogo, lista de valores semilla
//  seedComment   : comentario opcional para endpoint de seed/asignación
//  isJunction    : tabla puente (sin PK simple, sin estado, sin update)
//  specialEndpoints: bloques de código extra para agregar al final del controlador
// ─────────────────────────────────────────────────────────────────────────────

const entities = [

  // ── ISLA 1 · SEGURIDAD ────────────────────────────────────────────────────

  {
    name: "Permiso",
    file: "PermisoController",
    pkField: "id_permiso",
    hasEstado: true,
    dependents: [
      { entity: "PermisoRol", field: "permiso" },
    ],
    fields: [
      { name: "nombre",      type: "string" },
      { name: "descripcion", type: "string" },
      { name: "estado",      type: "boolean", default: true },
    ],
  },

  {
    name: "Rol",
    file: "RolController",
    pkField: "id_rol",
    hasEstado: true,
    dependents: [
      { entity: "PermisoRol", field: "rol" },
      { entity: "Usuario",    field: "rol" },
    ],
    fields: [
      { name: "nombre", type: "string" },
      { name: "estado", type: "boolean", default: true },
    ],
  },

  {
    name: "PermisoRol",
    file: "PermisoRolController",
    pkField: null,           // PK compuesta
    hasEstado: false,
    isJunction: true,
    dependents: [],
    compositePk: ["id_permiso", "id_rol"],
    fields: [
      { name: "permiso", type: "relation", fk: "id_permiso" },
      { name: "rol",     type: "relation", fk: "id_rol"     },
    ],
  },

  {
    name: "Usuario",
    file: "UsuarioController",
    pkField: "id_usuario",
    hasEstado: true,
    dependents: [],
    fields: [
      { name: "correo", type: "string" },
      { name: "clave",  type: "string" },
      { name: "rol",    type: "relation", fk: "id_rol" },
      { name: "estado", type: "boolean", default: true },
    ],
  },

  // ── ISLA 2 · CLIENTES ─────────────────────────────────────────────────────

  {
    name: "Cliente",
    file: "ClienteController",
    pkField: "id_cliente",
    hasEstado: true,
    dependents: [
      { entity: "Cita",  field: "cliente" },
      { entity: "Venta", field: "cliente" },
    ],
    fields: [
      { name: "tipoDocumento", type: "string" },
      { name: "documento",     type: "string" },
      { name: "nombre",        type: "string" },
      { name: "correo",        type: "string" },
      { name: "telefono",      type: "string",  nullable: true },
      { name: "estado",        type: "boolean", default: true },
    ],
  },

  // ── ISLA 3 · CATÁLOGOS ────────────────────────────────────────────────────

  {
    name: "Servicio",
    file: "ServicioController",
    pkField: "id_servicio",
    hasEstado: true,
    dependents: [
      { entity: "DetalleVenta", field: "servicio" },
    ],
    fields: [
      { name: "nombre",      type: "string" },
      { name: "descripcion", type: "string", nullable: true },
      { name: "duracion",    type: "number" },
      { name: "estado",      type: "boolean", default: true },
    ],
    catalogValues: [
      { nombre: "Personalización", descripcion: "Servicio de personalización",  duracion: 8,  estado: true },
      { nombre: "Restauración",    descripcion: "Servicio de restauración",      duracion: 15, estado: true },
      { nombre: "Enmarcación",     descripcion: "Servicio de enmarcación",       duracion: 8,  estado: true },
      { nombre: "Decoración",      descripcion: "Servicio de decoración",        duracion: 15, estado: true },
      { nombre: "Texturizado",     descripcion: "Servicio de texturizado",       duracion: 15, estado: true },
    ],
  },

  {
    name: "EstadoCita",
    file: "EstadoCitaController",
    pkField: "id_estado_cita",
    hasEstado: false,
    dependents: [
      { entity: "Cita", field: "estadoCita" },
    ],
    fields: [
      { name: "nombre", type: "string" },
    ],
    catalogValues: [
      { nombre: "Pendiente"   },
      { nombre: "Completada"  },
      { nombre: "No Asistió"  },
      { nombre: "Cancelada"   },
    ],
    // endpoint extra: cambiar estado de una Cita
    extraEndpoints: [
      {
        method: "patch",
        route: "/cita/:id_cita/estado",
        funcName: "cambiarEstadoCita",
        description: "Cambiar el estado de una Cita",
        targetEntity: "Cita",
        targetPk: "id_cita",
        targetField: "estadoCita",
        selfPk: "id_estado_cita",
        bodyParam: "id_estado_cita",
      },
    ],
  },

  {
    name: "EstadoServicio",
    file: "EstadoServicioController",
    pkField: "id_estado",
    hasEstado: false,
    dependents: [
      { entity: "DetalleVenta", field: "estadoServicio" },
    ],
    fields: [
      { name: "nombre", type: "string" },
    ],
    catalogValues: [
      { nombre: "Sin empezar"    },
      { nombre: "En preparación" },
      { nombre: "Finalizado"     },
    ],
    extraEndpoints: [
      {
        method: "patch",
        route: "/detalle/:id_detalle/estado",
        funcName: "cambiarEstadoDetalle",
        description: "Cambiar el estado de un DetalleVenta",
        targetEntity: "DetalleVenta",
        targetPk: "id_detalle",
        targetField: "estadoServicio",
        selfPk: "id_estado",
        bodyParam: "id_estado",
      },
    ],
  },

  {
    name: "MetodoPago",
    file: "MetodoPagoController",
    pkField: "id_metodo_pago",
    hasEstado: false,
    dependents: [
      { entity: "Pago", field: "metodoPago" },
    ],
    fields: [
      { name: "nombre", type: "string" },
    ],
    catalogValues: [
      { nombre: "Efectivo"       },
      { nombre: "Transferencia"  },
    ],
    extraEndpoints: [
      {
        method: "patch",
        route: "/pago/:id_pago/metodo",
        funcName: "asignarMetodoPago",
        description: "Asignar método de pago a un Pago",
        targetEntity: "Pago",
        targetPk: "id_pago",
        targetField: "metodoPago",
        selfPk: "id_metodo_pago",
        bodyParam: "id_metodo_pago",
      },
    ],
  },

  {
    name: "EstadoPago",
    file: "EstadoPagoController",
    pkField: "id_estado_pago",
    hasEstado: false,
    dependents: [
      { entity: "Pago", field: "estadoPago" },
    ],
    fields: [
      { name: "nombre", type: "string" },
    ],
    catalogValues: [
      { nombre: "Pendiente"   },
      { nombre: "Validado"    },
      { nombre: "Rechazado"   },
    ],
    extraEndpoints: [
      {
        method: "patch",
        route: "/pago/:id_pago/estado",
        funcName: "cambiarEstadoPago",
        description: "Cambiar el estado de un Pago",
        targetEntity: "Pago",
        targetPk: "id_pago",
        targetField: "estadoPago",
        selfPk: "id_estado_pago",
        bodyParam: "id_estado_pago",
      },
    ],
  },

  // ── ISLA 4 · OPERACIONES ──────────────────────────────────────────────────

  {
    name: "Cita",
    file: "CitaController",
    pkField: "id_cita",
    hasEstado: false,
    dependents: [
      { entity: "Venta", field: "cita" },
    ],
    fields: [
      { name: "fecha",      type: "Date" },
      { name: "hora",       type: "string" },
      { name: "estadoCita", type: "relation", fk: "id_estado_cita" },
      { name: "cliente",    type: "relation", fk: "id_cliente" },
    ],
    relations: ["estadoCita", "cliente"],
  },

  {
    name: "Marco",
    file: "MarcoController",
    pkField: "id_marco",
    hasEstado: true,
    dependents: [
      { entity: "DetalleVenta", field: "marco" },
    ],
    fields: [
      { name: "codigo",            type: "string" },
      { name: "colilla",           type: "string" },
      { name: "precio_ensamblado", type: "number" },
      { name: "estado",            type: "boolean", default: true },
    ],
  },

  {
    name: "Venta",
    file: "VentaController",
    pkField: "id_venta",
    hasEstado: true,
    dependents: [
      { entity: "DetalleVenta", field: "venta" },
      { entity: "Pago",         field: "venta" },
    ],
    fields: [
      { name: "cita",        type: "relation", fk: "id_cita",    nullable: true },
      { name: "cliente",     type: "relation", fk: "id_cliente" },
      { name: "fecha",       type: "Date" },
      { name: "total",       type: "number" },
      { name: "observacion", type: "string",   nullable: true },
      { name: "estado",      type: "boolean",  default: true },
    ],
    relations: ["cita", "cliente"],
  },

  {
    name: "DetalleVenta",
    file: "DetalleVentaController",
    pkField: "id_detalle",
    hasEstado: true,
    dependents: [],
    fields: [
      { name: "venta",          type: "relation", fk: "id_venta"    },
      { name: "servicio",       type: "relation", fk: "id_servicio" },
      { name: "estadoServicio", type: "relation", fk: "id_estado"   },
      { name: "marco",          type: "relation", fk: "id_marco",   nullable: true },
      { name: "fecha",          type: "Date" },
      { name: "observacion",    type: "string" },
      { name: "precio",         type: "number" },
      { name: "estado",         type: "boolean", default: true },
    ],
    relations: ["venta", "servicio", "estadoServicio", "marco"],
  },

  // ── ISLA 5 · PAGOS ────────────────────────────────────────────────────────

  {
    name: "Pago",
    file: "PagoController",
    pkField: "id_pago",
    hasEstado: false,
    dependents: [],
    fields: [
      { name: "venta",       type: "relation", fk: "id_venta"        },
      { name: "metodoPago",  type: "relation", fk: "id_metodo_pago"  },
      { name: "estadoPago",  type: "relation", fk: "id_estado_pago"  },
      { name: "fecha",       type: "Date" },
      { name: "monto",       type: "number" },
      { name: "observacion", type: "string", nullable: true },
    ],
    relations: ["venta", "metodoPago", "estadoPago"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

/** Recoge todos los nombres de entidades usadas en relations/dependents */
function collectImports(entity) {
  const set = new Set([entity.name]);
  (entity.dependents   ?? []).forEach(d  => set.add(d.entity));
  (entity.extraEndpoints ?? []).forEach(e => set.add(e.targetEntity));
  // entidades de campos de relacion (FKs)
  (entity.fields ?? []).filter(f => f.type === "relation").forEach(f => set.add(capitalize(f.name)));
  return [...set];
}

/** Construye los bloques de asignación para CREATE / PUT */
function buildAssignBlock(fields, varName, bodyVar, repoMap) {
  const lines = [];
  for (const f of fields) {
    if (f.type === "relation") {
      const entityName = capitalize(f.name);  // camelCase field → entity name
      lines.push(
        `    if (${bodyVar}.${f.fk} !== undefined) {`,
        `      const rel = await ${repoMap[entityName] ?? entityName.toLowerCase() + "Repo"}.findOneBy({ ${getPkForRelation(f, fields)}: ${bodyVar}.${f.fk} });`,
        `      if (!rel) return res.status(404).json({ message: "${entityName} con id \${${bodyVar}.${f.fk}} no encontrado" });`,
        `      ${varName}.${f.name} = rel;`,
        `    }`,
      );
    } else if (f.name !== "estado" || varName === "obj") {
      // en CREATE asignamos estado; en UPDATE lo omitimos (tiene su propio endpoint)
      lines.push(`    if (${bodyVar}.${f.name} !== undefined) ${varName}.${f.name} = ${bodyVar}.${f.name};`);
    }
  }
  return lines.join("\n");
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Dado un campo de relación, devuelve el par pk:value para findOneBy */
function getPkForRelation(field, _fields) {
  // Para relaciones usamos el fk como nombre del campo PK en la entidad destino
  return field.fk;
}

/** Genera el import de repositorios necesarios */
function buildRepoImports(entity) {
  const names = collectImports(entity);
  return names.map(n => `import { ${n} } from "../models/${n}";`).join("\n");
}

/** Lista de repos extra que necesitamos declarar (para relaciones y dependents) */
function buildRepoDeclarations(entity) {
  const set = new Set();
  // relaciones propias
  (entity.fields ?? [])
    .filter(f => f.type === "relation")
    .forEach(f => set.add(capitalize(f.name)));
  // dependents
  (entity.dependents ?? []).forEach(d => set.add(d.entity));
  // extra endpoints target
  (entity.extraEndpoints ?? []).forEach(e => {
    set.add(e.targetEntity);
    set.add(entity.name);
  });
  // quitar la entidad principal
  set.delete(entity.name);

  return [...set].map(n => `  const ${lcFirst(n)}Repo = AppDataSource.getRepository(${n});`).join("\n");
}

function lcFirst(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// ─────────────────────────────────────────────────────────────────────────────
//  GENERADOR PRINCIPAL DEL ARCHIVO
// ─────────────────────────────────────────────────────────────────────────────

function buildController(entity) {
  const {
    name, pkField, hasEstado, isJunction,
    fields = [], dependents = [], relations = [],
    catalogValues, extraEndpoints = [],
  } = entity;

  const repoVar     = `${lcFirst(name)}Repo`;
  const relationsArr = relations ?? fields.filter(f => f.type === "relation").map(f => f.name);
  const relStr      = relationsArr.length
    ? `relations: [${relationsArr.map(r => `"${r}"`).join(", ")}]`
    : "";

  // ── imports ───────────────────────────────────────────────────────────────
  const modelImports = collectImports(entity)
    .map(n => `import { ${n} } from "../models/${n}";`)
    .join("\n");

  // ── getAll ────────────────────────────────────────────────────────────────
  const getAllFn = `
export const getAll${name} = async (_req: Request, res: Response): Promise<void> => {
  try {
    const ${repoVar} = AppDataSource.getRepository(${name});
    const items = await ${repoVar}.find(${relStr ? `{ ${relStr} }` : ""});
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener ${name}", error });
  }
};`;

  // ── getById ───────────────────────────────────────────────────────────────
  let getByIdFn = "";
  if (!isJunction) {
    getByIdFn = `
export const get${name}ById = async (req: Request, res: Response): Promise<void> => {
  try {
    const ${repoVar} = AppDataSource.getRepository(${name});
    const item = await ${repoVar}.findOne({
      where: { ${pkField}: Number(req.params.id) },${relStr ? `\n      ${relStr},` : ""}
    });
    if (!item) { res.status(404).json({ success: false, message: "${name} no encontrado" }); return; }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener ${name}", error });
  }
};`;
  }

  // ── seed / catalogValues comment ──────────────────────────────────────────
  let seedFn = "";
  if (catalogValues) {
    const seedJson = JSON.stringify(catalogValues, null, 4)
      .split("\n").map((l, i) => (i === 0 ? l : "  " + l)).join("\n");
    seedFn = `
// ── Valores semilla para ${name} ──────────────────────────────────────────
// Puedes ejecutar seedData${name}() una vez al iniciar la app o via endpoint.
export const seedData${name} = async (): Promise<void> => {
  try {
    const ${repoVar} = AppDataSource.getRepository(${name});
    const existing = await ${repoVar}.count();
    if (existing > 0) return; // Ya inicializado
    const values = ${seedJson};
    await ${repoVar}.save(${repoVar}.create(values as any[]));
    console.log("✅  ${name} sembrado correctamente (${catalogValues.length} registros)");
  } catch (error) {
    console.error("❌  Error al sembrar ${name}:", error);
  }
};`;
  }

  // ── create ────────────────────────────────────────────────────────────────
  let createFn = "";
  if (isJunction) {
    createFn = `
export const create${name} = async (req: Request, res: Response): Promise<void> => {
  try {
    const ${repoVar}     = AppDataSource.getRepository(${name});
    const permisoRepo = AppDataSource.getRepository(Permiso);
    const rolRepo     = AppDataSource.getRepository(Rol);
    const { id_permiso, id_rol } = req.body;
    if (!id_permiso || !id_rol) {
      res.status(400).json({ success: false, message: "id_permiso e id_rol son requeridos" }); return;
    }
    const permiso = await permisoRepo.findOneBy({ id_permiso: Number(id_permiso) });
    const rol     = await rolRepo.findOneBy({ id_rol: Number(id_rol) });
    if (!permiso) { res.status(404).json({ success: false, message: "Permiso no encontrado" }); return; }
    if (!rol)     { res.status(404).json({ success: false, message: "Rol no encontrado" }); return; }
    const existing = await ${repoVar}.findOne({ where: { permiso: { id_permiso: Number(id_permiso) }, rol: { id_rol: Number(id_rol) } } });
    if (existing) { res.status(409).json({ success: false, message: "La relación ya existe" }); return; }
    const obj = ${repoVar}.create({ permiso, rol });
    await ${repoVar}.save(obj);
    res.status(201).json({ success: true, message: "${name} creado", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear ${name}", error });
  }
};`;
  } else {
    // Campos requeridos (no nullable, no boolean con default)
    const required = fields.filter(f => !f.nullable && f.type !== "boolean" && f.type !== "relation");
    const requiredCheck = required.length
      ? `    const required = [${required.map(f => `"${f.name}"`).join(", ")}];\n    const missing = required.filter(k => req.body[k] === undefined);\n    if (missing.length) { res.status(400).json({ success: false, message: \`Campos requeridos: \${missing.join(", ")}\` }); return; }`
      : "";

    // Cuerpo de asignación para relaciones
    const relationFields = fields.filter(f => f.type === "relation");
    const relAssign = relationFields.map(f => {
      const entityName = capitalize(f.name);
      const fkName     = f.fk;
      const repoName   = `${lcFirst(entityName)}Repo`;
      const pkGuess    = fkName; // usamos el mismo nombre de FK como PK en entidad destino
      return `    if (req.body.${fkName} !== undefined) {
      const ${repoName} = AppDataSource.getRepository(${entityName});
      const rel${entityName} = await ${repoName}.findOneBy({ ${pkGuess}: Number(req.body.${fkName}) });
      if (!rel${entityName}) { res.status(404).json({ success: false, message: "${entityName} no encontrado" }); return; }
      obj.${f.name} = rel${entityName};
    }`;
    }).join("\n");

    const simpleFields = fields.filter(f => f.type !== "relation");
    const simpleAssign = simpleFields.map(f => {
      const val = f.type === "boolean" && f.default !== undefined
        ? `req.body.${f.name} !== undefined ? req.body.${f.name} : ${f.default}`
        : `req.body.${f.name}`;
      return `    obj.${f.name} = ${val};`;
    }).join("\n");

    createFn = `
export const create${name} = async (req: Request, res: Response): Promise<void> => {
  try {
    const ${repoVar} = AppDataSource.getRepository(${name});
${requiredCheck ? requiredCheck + "\n" : ""}    const obj = ${repoVar}.create();
${simpleAssign}
${relAssign}
    await ${repoVar}.save(obj);
    res.status(201).json({ success: true, message: "${name} creado exitosamente", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear ${name}", error });
  }
};`;
  }

  // ── update ────────────────────────────────────────────────────────────────
  let updateFn = "";
  if (!isJunction) {
    const relationFields = fields.filter(f => f.type === "relation");
    const relUpdate = relationFields.map(f => {
      const entityName = capitalize(f.name);
      const fkName     = f.fk;
      const repoName   = `${lcFirst(entityName)}Repo`;
      const pkGuess    = fkName;
      return `    if (req.body.${fkName} !== undefined) {
      const ${repoName} = AppDataSource.getRepository(${entityName});
      const rel${entityName} = await ${repoName}.findOneBy({ ${pkGuess}: Number(req.body.${fkName}) });
      if (!rel${entityName}) { res.status(404).json({ success: false, message: "${entityName} no encontrado" }); return; }
      item.${f.name} = rel${entityName};
    }`;
    }).join("\n");

    const simpleUpdate = fields
      .filter(f => f.type !== "relation" && f.name !== "estado")
      .map(f => `    if (req.body.${f.name} !== undefined) item.${f.name} = req.body.${f.name};`)
      .join("\n");

    updateFn = `
export const update${name} = async (req: Request, res: Response): Promise<void> => {
  try {
    const ${repoVar} = AppDataSource.getRepository(${name});
    const item = await ${repoVar}.findOne({
      where: { ${pkField}: Number(req.params.id) },${relStr ? `\n      ${relStr},` : ""}
    });
    if (!item) { res.status(404).json({ success: false, message: "${name} no encontrado" }); return; }
${simpleUpdate}
${relUpdate}
    await ${repoVar}.save(item);
    res.json({ success: true, message: "${name} actualizado", data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar ${name}", error });
  }
};`;
  }

  // ── delete ────────────────────────────────────────────────────────────────
  let deleteFn = "";
  if (isJunction) {
    deleteFn = `
export const delete${name} = async (req: Request, res: Response): Promise<void> => {
  try {
    const ${repoVar} = AppDataSource.getRepository(${name});
    const { id_permiso, id_rol } = req.body;
    const item = await ${repoVar}.findOne({ where: { permiso: { id_permiso: Number(id_permiso) }, rol: { id_rol: Number(id_rol) } } });
    if (!item) { res.status(404).json({ success: false, message: "${name} no encontrado" }); return; }
    await ${repoVar}.remove(item);
    res.json({ success: true, message: "${name} eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar ${name}", error });
  }
};`;
  } else {
    const depChecks = dependents.map(d => {
      const depRepo   = lcFirst(d.entity) + "Repo";
      const countVar  = "count" + d.entity;
      return `    const ${depRepo} = AppDataSource.getRepository(${d.entity});
    const ${countVar} = await ${depRepo}.count({ where: { ${d.field}: { ${pkField}: Number(req.params.id) } } });
    if (${countVar} > 0) {
      res.status(409).json({ success: false, message: \`No se puede eliminar: existen ${d.entity} asociados (\${${countVar}})\` }); return;
    }`;
    }).join("\n");

    deleteFn = `
export const delete${name} = async (req: Request, res: Response): Promise<void> => {
  try {
    const ${repoVar} = AppDataSource.getRepository(${name});
${depChecks}
    const item = await ${repoVar}.findOneBy({ ${pkField}: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "${name} no encontrado" }); return; }
    await ${repoVar}.remove(item);
    res.json({ success: true, message: "${name} eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar ${name}", error });
  }
};`;
  }

  // ── toggleEstado ──────────────────────────────────────────────────────────
  let toggleFn = "";
  if (hasEstado) {
    toggleFn = `
export const toggleEstado${name} = async (req: Request, res: Response): Promise<void> => {
  try {
    const ${repoVar} = AppDataSource.getRepository(${name});
    const item = await ${repoVar}.findOneBy({ ${pkField}: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "${name} no encontrado" }); return; }
    item.estado = !item.estado;
    await ${repoVar}.save(item);
    res.json({ success: true, message: \`${name} \${item.estado ? "activado" : "inactivado"}\`, data: { estado: item.estado } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al cambiar estado de ${name}", error });
  }
};`;
  }

  // ── extraEndpoints ────────────────────────────────────────────────────────
  let extraFns = "";
  for (const ep of extraEndpoints) {
    const targetRepo  = `${lcFirst(ep.targetEntity)}Repo`;
    const selfRepo    = `${lcFirst(name)}Repo`;
    extraFns += `
// ${ep.description}
export const ${ep.funcName} = async (req: Request, res: Response): Promise<void> => {
  try {
    const ${targetRepo} = AppDataSource.getRepository(${ep.targetEntity});
    const ${selfRepo}   = AppDataSource.getRepository(${name});
    const target = await ${targetRepo}.findOneBy({ ${ep.targetPk}: Number(req.params.${ep.targetPk}) });
    if (!target) { res.status(404).json({ success: false, message: "${ep.targetEntity} no encontrado" }); return; }
    const nuevoEstado = await ${selfRepo}.findOneBy({ ${ep.selfPk}: Number(req.body.${ep.bodyParam}) });
    if (!nuevoEstado) { res.status(404).json({ success: false, message: "${name} no encontrado" }); return; }
    target.${ep.targetField} = nuevoEstado;
    await ${targetRepo}.save(target);
    res.json({ success: true, message: "${ep.description} actualizado", data: target });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en ${ep.funcName}", error });
  }
};`;
  }

  // ── Exports summary ───────────────────────────────────────────────────────
  const exports = [
    `getAll${name}`,
    !isJunction ? `get${name}ById` : null,
    catalogValues ? `seedData${name}` : null,
    `create${name}`,
    !isJunction ? `update${name}` : null,
    `delete${name}`,
    hasEstado ? `toggleEstado${name}` : null,
    ...extraEndpoints.map(e => e.funcName),
  ].filter(Boolean);

  // ── Assemble ──────────────────────────────────────────────────────────────
  return `// ─────────────────────────────────────────────────────────────────────────────
//  ${entity.file}.ts  —  Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
${modelImports}

${getAllFn}
${getByIdFn}
${seedFn}
${createFn}
${updateFn}
${deleteFn}
${toggleFn}
${extraFns}
// Exportaciones
export {
  ${exports.join(",\n  ")},
};
`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  RUNNER
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  GENERADOR DE seeds/index.ts
// ─────────────────────────────────────────────────────────────────────────────

function buildSeedIndex() {
  const seedEntities = entities.filter(e => e.catalogValues);

  const imports = seedEntities
    .map(e => `import { seedData${e.name} } from "../controllers/${e.file}";`)
    .join("\n");

  const calls = seedEntities
    .map(e => `  await seedData${e.name}();   // ${e.catalogValues.length} registros: ${e.catalogValues.map(v => v.nombre).join(", ")}`)
    .join("\n");

  const names = seedEntities.map(e => e.name).join(", ");

  return `// Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
//  seeds/index.ts
//
//  Llama a todas las funciones de semilla en orden seguro.
//  Cada función es idempotente: si la tabla ya tiene datos, la omite.
//
//  Catálogos que puebla: ${names}
// ─────────────────────────────────────────────────────────────────────────────
${imports}

export async function runAllSeeds(): Promise<void> {
  console.log("\\n🌱  Iniciando semilla de catálogos...");
${calls}
  console.log("✅  Semilla completada\\n");
}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  RUNNER PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

function run() {
  const baseDir     = process.cwd();
  const ctrlDir     = path.join(baseDir, "controllers");
  const seedDir     = path.join(baseDir, "seeds");

  const divider = "─".repeat(56);
  console.log(`\n${"═".repeat(56)}`);
  console.log(`  🚀  generate-controllers.js`);
  console.log(`${"═".repeat(56)}`);

  // ── 1. Controladores ──────────────────────────────────────────────────────
  console.log(`\n${divider}`);
  console.log(`  🎮  CONTROLADORES`);
  console.log(`${divider}`);

  if (!fs.existsSync(ctrlDir)) {
    fs.mkdirSync(ctrlDir, { recursive: true });
    console.log(`  📁  Carpeta creada: controllers/`);
  }

  let ok = 0, fail = 0;

  for (const entity of entities) {
    try {
      const content  = buildController(entity);
      const filePath = path.join(ctrlDir, `${entity.file}.ts`);
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`  ✅  controllers/${entity.file}.ts`);
      ok++;
    } catch (err) {
      console.error(`  ❌  controllers/${entity.file}.ts — ${err.message}`);
      fail++;
    }
  }

  // ── 2. seeds/index.ts ─────────────────────────────────────────────────────
  console.log(`\n${divider}`);
  console.log(`  🌱  ÍNDICE DE SEEDS`);
  console.log(`${divider}`);

  if (!fs.existsSync(seedDir)) {
    fs.mkdirSync(seedDir, { recursive: true });
    console.log(`  📁  Carpeta creada: seeds/`);
  }

  try {
    fs.writeFileSync(path.join(seedDir, "index.ts"), buildSeedIndex(), "utf8");
    console.log(`  ✅  seeds/index.ts`);
    ok++;
  } catch (err) {
    console.error(`  ❌  seeds/index.ts — ${err.message}`);
    fail++;
  }

  // ── Resumen ───────────────────────────────────────────────────────────────
  const seedEntities = entities.filter(e => e.catalogValues);
  console.log(`\n${"═".repeat(56)}`);
  console.log(`  🎉  ${ok} archivos generados, ${fail} errores`);
  console.log(`\n  📂  Estructura:`);
  console.log(`      controllers/   ${ok - 1} archivos .ts`);
  console.log(`      seeds/         index.ts`);
  console.log(`\n  💡  En tu app.ts / data-source.ts agrega:`);
  console.log(`      import { runAllSeeds } from "./seeds";`);
  console.log(`      await AppDataSource.initialize();`);
  console.log(`      await runAllSeeds();`);
  console.log(`\n  🌱  Catálogos que se poblarán automáticamente:`);
  seedEntities.forEach(e =>
    console.log(`      • ${e.name.padEnd(18)} ${e.catalogValues.length} registros`)
  );
  console.log(`${"═".repeat(56)}\n`);
}

run();
