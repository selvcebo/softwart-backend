// ─────────────────────────────────────────────────────────────────────────────
//  generate-models.js
//  Ejecutar con:  node generate-models.js
//  Genera los modelos TypeORM en ./models/<NombreEntidad>.ts
// ─────────────────────────────────────────────────────────────────────────────

const fs   = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS DE TIPO
// ─────────────────────────────────────────────────────────────────────────────

/** Convierte el tipo de BD a tipo TypeScript */
function toTsType(dbType) {
  const map = {
    int: "number", integer: "number", float: "number", double: "number",
    decimal: "number", numeric: "number",
    varchar: "string", text: "string", char: "string",
    boolean: "boolean", bool: "boolean",
    date: "Date", time: "string", datetime: "Date", timestamp: "Date",
  };
  return map[dbType.toLowerCase()] ?? "string";
}

/** Devuelve el literal de tipo TypeORM cuando hay que declararlo explícitamente */
function toOrmType(dbType) {
  const needsExplicit = ["date", "time", "float", "double", "decimal", "text", "boolean"];
  return needsExplicit.includes(dbType.toLowerCase()) ? `"${dbType.toLowerCase()}"` : null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ESQUEMA COMPLETO
// ─────────────────────────────────────────────────────────────────────────────
//
//  columns  → columnas propias de la tabla
//    { name, dbType, pk?, unique?, nullable? }
//
//  relations → FK / relaciones hacia otras entidades
//    ManyToOne  : esta tabla tiene la FK
//    OneToMany  : la otra tabla tiene la FK que apunta aquí
//    OneToOne   : relación 1-1 (owner:true = lado con @JoinColumn)
//
//    { relType, target, field, fkColumn?, inverseSide,
//      joinColumn?, primaryColumn?, nullable?, owner? }
//
//  compositeKey → true si la PK es compuesta (sin @PrimaryGeneratedColumn)
// ─────────────────────────────────────────────────────────────────────────────

const schema = [

  // ── ISLA 1 · SEGURIDAD ────────────────────────────────────────────────────

  {
    name: "Permiso",
    tableName: "permiso",
    columns: [
      { name: "id_permiso",  dbType: "int",     pk: true },
      { name: "nombre",      dbType: "varchar" },
      { name: "descripcion", dbType: "varchar" },
      { name: "estado",      dbType: "boolean" },
    ],
    relations: [
      { relType: "OneToMany", target: "PermisoRol", field: "permisoRoles", inverseSide: "permiso" },
    ],
  },

  {
    name: "Rol",
    tableName: "rol",
    columns: [
      { name: "id_rol",  dbType: "int",     pk: true },
      { name: "nombre",  dbType: "varchar" },
      { name: "estado",  dbType: "boolean" },
    ],
    relations: [
      { relType: "OneToMany", target: "PermisoRol", field: "permisoRoles", inverseSide: "rol" },
      { relType: "OneToMany", target: "Usuario",    field: "usuarios",     inverseSide: "rol" },
    ],
  },

  {
    name: "PermisoRol",
    tableName: "permiso_rol",
    compositeKey: true,          // PK compuesta → @PrimaryColumn en cada FK
    columns: [],
    relations: [
      {
        relType: "ManyToOne", target: "Permiso", field: "permiso",
        fkColumn: "id_permiso", inverseSide: "permisoRoles",
        joinColumn: true, primaryColumn: true,
      },
      {
        relType: "ManyToOne", target: "Rol", field: "rol",
        fkColumn: "id_rol", inverseSide: "permisoRoles",
        joinColumn: true, primaryColumn: true,
      },
    ],
  },

  {
    name: "Usuario",
    tableName: "usuario",
    columns: [
      { name: "id_usuario", dbType: "int",     pk: true },
      { name: "correo",     dbType: "varchar", unique: true },
      { name: "clave",      dbType: "varchar" },
      { name: "estado",     dbType: "boolean" },
    ],
    relations: [
      {
        relType: "ManyToOne", target: "Rol", field: "rol",
        fkColumn: "id_rol", inverseSide: "usuarios",
        joinColumn: true,
      },
    ],
  },

  // ── ISLA 2 · CLIENTES ─────────────────────────────────────────────────────

  {
    name: "Cliente",
    tableName: "cliente",
    columns: [
      { name: "id_cliente",    dbType: "int",     pk: true },
      { name: "tipoDocumento", dbType: "varchar" },
      { name: "documento",     dbType: "varchar" },
      { name: "nombre",        dbType: "varchar" },
      { name: "correo",        dbType: "varchar", unique: true },
      { name: "telefono",      dbType: "varchar", nullable: true },
      { name: "estado",        dbType: "boolean" },
    ],
    relations: [
      { relType: "OneToMany", target: "Cita",  field: "citas",  inverseSide: "cliente" },
      { relType: "OneToMany", target: "Venta", field: "ventas", inverseSide: "cliente" },
    ],
  },

  // ── ISLA 3 · CATÁLOGOS ────────────────────────────────────────────────────

  {
    name: "Servicio",
    tableName: "servicio",
    columns: [
      { name: "id_servicio", dbType: "int",     pk: true },
      { name: "nombre",      dbType: "varchar" },
      { name: "descripcion", dbType: "varchar", nullable: true },
      { name: "duracion",    dbType: "int" },
      { name: "estado",      dbType: "boolean" },
    ],
    relations: [
      { relType: "OneToMany", target: "DetalleVenta", field: "detallesVenta", inverseSide: "servicio" },
    ],
  },

  {
    name: "EstadoCita",
    tableName: "estado_cita",
    columns: [
      { name: "id_estado_cita", dbType: "int",     pk: true },
      { name: "nombre",         dbType: "varchar" },
    ],
    relations: [
      { relType: "OneToMany", target: "Cita", field: "citas", inverseSide: "estadoCita" },
    ],
  },

  {
    name: "EstadoServicio",
    tableName: "estado_servicio",
    columns: [
      { name: "id_estado", dbType: "int",     pk: true },
      { name: "nombre",    dbType: "varchar" },
    ],
    relations: [
      { relType: "OneToMany", target: "DetalleVenta", field: "detallesVenta", inverseSide: "estadoServicio" },
    ],
  },

  {
    name: "MetodoPago",
    tableName: "metodo_pago",
    columns: [
      { name: "id_metodo_pago", dbType: "int",     pk: true },
      { name: "nombre",         dbType: "varchar" },
    ],
    relations: [
      { relType: "OneToMany", target: "Pago", field: "pagos", inverseSide: "metodoPago" },
    ],
  },

  {
    name: "EstadoPago",
    tableName: "estado_pago",
    columns: [
      { name: "id_estado_pago", dbType: "int",     pk: true },
      { name: "nombre",         dbType: "varchar" },
    ],
    relations: [
      { relType: "OneToMany", target: "Pago", field: "pagos", inverseSide: "estadoPago" },
    ],
  },

  // ── ISLA 4 · OPERACIONES ──────────────────────────────────────────────────

  {
    name: "Cita",
    tableName: "cita",
    columns: [
      { name: "id_cita", dbType: "int",  pk: true },
      { name: "fecha",   dbType: "date" },
      { name: "hora",    dbType: "time" },
    ],
    relations: [
      {
        relType: "ManyToOne", target: "EstadoCita", field: "estadoCita",
        fkColumn: "id_estado_cita", inverseSide: "citas",
        joinColumn: true,
      },
      {
        relType: "ManyToOne", target: "Cliente", field: "cliente",
        fkColumn: "id_cliente", inverseSide: "citas",
        joinColumn: true,
      },
      // Lado inverso de la relación 1-1 con Venta (Venta tiene el @JoinColumn)
      { relType: "OneToOne", target: "Venta", field: "venta", inverseSide: "cita", owner: false },
    ],
  },

  {
    name: "Marco",
    tableName: "marco",
    columns: [
      { name: "id_marco",          dbType: "int",     pk: true },
      { name: "codigo",            dbType: "varchar", unique: true },
      { name: "colilla",           dbType: "varchar" },
      { name: "precio_ensamblado", dbType: "float" },
      { name: "estado",            dbType: "boolean" },
    ],
    relations: [
      { relType: "OneToMany", target: "DetalleVenta", field: "detallesVenta", inverseSide: "marco" },
    ],
  },

  {
    name: "Venta",
    tableName: "venta",
    columns: [
      { name: "id_venta",    dbType: "int",     pk: true },
      { name: "fecha",       dbType: "date" },
      { name: "total",       dbType: "float" },
      { name: "observacion", dbType: "varchar", nullable: true },
      { name: "estado",      dbType: "boolean" },
    ],
    relations: [
      // Lado dueño 1-1 con Cita
      {
        relType: "OneToOne", target: "Cita", field: "cita",
        fkColumn: "id_cita", inverseSide: "venta",
        joinColumn: true, nullable: true, owner: true,
      },
      {
        relType: "ManyToOne", target: "Cliente", field: "cliente",
        fkColumn: "id_cliente", inverseSide: "ventas",
        joinColumn: true,
      },
      { relType: "OneToMany", target: "DetalleVenta", field: "detallesVenta", inverseSide: "venta" },
      { relType: "OneToMany", target: "Pago",         field: "pagos",         inverseSide: "venta" },
    ],
  },

  {
    name: "DetalleVenta",
    tableName: "detalle_venta",
    columns: [
      { name: "id_detalle",  dbType: "int",     pk: true },
      { name: "fecha",       dbType: "date" },
      { name: "observacion", dbType: "varchar" },
      { name: "precio",      dbType: "float" },
      { name: "estado",      dbType: "boolean" },
    ],
    relations: [
      {
        relType: "ManyToOne", target: "Venta", field: "venta",
        fkColumn: "id_venta", inverseSide: "detallesVenta",
        joinColumn: true,
      },
      {
        relType: "ManyToOne", target: "Servicio", field: "servicio",
        fkColumn: "id_servicio", inverseSide: "detallesVenta",
        joinColumn: true,
      },
      {
        relType: "ManyToOne", target: "EstadoServicio", field: "estadoServicio",
        fkColumn: "id_estado", inverseSide: "detallesVenta",
        joinColumn: true,
      },
      {
        relType: "ManyToOne", target: "Marco", field: "marco",
        fkColumn: "id_marco", inverseSide: "detallesVenta",
        joinColumn: true, nullable: true,
      },
    ],
  },

  // ── ISLA 5 · PAGOS ────────────────────────────────────────────────────────

  {
    name: "Pago",
    tableName: "pago",
    columns: [
      { name: "id_pago",     dbType: "int",     pk: true },
      { name: "fecha",       dbType: "date" },
      { name: "monto",       dbType: "float" },
      { name: "observacion", dbType: "varchar", nullable: true },
    ],
    relations: [
      {
        relType: "ManyToOne", target: "Venta", field: "venta",
        fkColumn: "id_venta", inverseSide: "pagos",
        joinColumn: true,
      },
      {
        relType: "ManyToOne", target: "MetodoPago", field: "metodoPago",
        fkColumn: "id_metodo_pago", inverseSide: "pagos",
        joinColumn: true,
      },
      {
        relType: "ManyToOne", target: "EstadoPago", field: "estadoPago",
        fkColumn: "id_estado_pago", inverseSide: "pagos",
        joinColumn: true,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  GENERADOR DE CÓDIGO
// ─────────────────────────────────────────────────────────────────────────────

function buildEntityFile(entity) {

  // ── 1. Recolectar imports ────────────────────────────────────────────────
  const ormImports    = new Set(["Entity", "Column"]);
  const entityImports = new Set();

  // Columnas: ¿necesitamos PrimaryGeneratedColumn o PrimaryColumn?
  if (entity.compositeKey) {
    ormImports.add("PrimaryColumn");
  } else {
    ormImports.add("PrimaryGeneratedColumn");
  }

  for (const rel of entity.relations ?? []) {
    ormImports.add(rel.relType);
    if (rel.joinColumn) ormImports.add("JoinColumn");
    entityImports.add(rel.target);
  }

  const ormImportLine =
    `import { ${[...ormImports].sort().join(", ")} } from "typeorm";`;

  const entityImportLines = [...entityImports]
    .sort()
    .map((e) => `import { ${e} } from "./${e}";`)
    .join("\n");

  // ── 2. Columnas propias ──────────────────────────────────────────────────
  const lines = [];

  for (const col of entity.columns ?? []) {
    const tsType  = toTsType(col.dbType);
    const ormType = toOrmType(col.dbType);

    if (col.pk) {
      lines.push(`  @PrimaryGeneratedColumn()`);
      lines.push(`  ${col.name}!: ${tsType};`);
    } else {
      const opts = [];
      if (ormType)      opts.push(`type: ${ormType}`);
      if (col.unique)   opts.push(`unique: true`);
      if (col.nullable) opts.push(`nullable: true`);

      lines.push(`  @Column(${opts.length ? `{ ${opts.join(", ")} }` : ""})`);
      lines.push(`  ${col.name}${col.nullable ? "?" : "!"}: ${tsType};`);
    }
    lines.push("");
  }

  // ── 3. Relaciones ────────────────────────────────────────────────────────
  for (const rel of entity.relations ?? []) {
    const {
      relType, target, field, fkColumn, inverseSide,
      joinColumn, primaryColumn, nullable, owner,
    } = rel;

    // @RelType(() => Target, (x) => x.inverseSide [, opts])
    const relOpts = [];
    if (nullable) relOpts.push(`nullable: true`);

    const relOptsStr = relOpts.length ? `, { ${relOpts.join(", ")} }` : "";
    lines.push(
      `  @${relType}(() => ${target}, (x) => x.${inverseSide}${relOptsStr})`
    );

    // @PrimaryColumn para PK compuesta (antes del @JoinColumn)
    if (primaryColumn && fkColumn) {
      lines.push(`  @PrimaryColumn({ name: "${fkColumn}" })`);
    }

    // @JoinColumn en el lado dueño
    if (joinColumn) {
      const jcOpts = fkColumn
        ? `{ name: "${fkColumn}"${nullable ? ", nullable: true" : ""} }`
        : "";
      lines.push(`  @JoinColumn(${jcOpts})`);
    }

    // Declaración del campo
    const tsFieldType = relType === "OneToMany" ? `${target}[]` : target;
    const nullMark    = (nullable || (relType === "OneToOne" && owner === false)) ? "?" : "!";
    lines.push(`  ${field}${nullMark}: ${tsFieldType};`);
    lines.push("");
  }

  // ── 4. Ensamblar ─────────────────────────────────────────────────────────
  const imports = [ormImportLine, entityImportLines ? entityImportLines : null]
    .filter(Boolean)
    .join("\n");

  return [
    `// Generado automáticamente por generate-models.js`,
    imports,
    ``,
    `@Entity("${entity.tableName}")`,
    `export class ${entity.name} {`,
    ``,
    lines.join("\n"),
    `}`,
    ``,
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
//  RUNNER
// ─────────────────────────────────────────────────────────────────────────────

function run() {
  const outputDir = path.join(process.cwd(), "models");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁  Carpeta creada: ${outputDir}`);
  }

  let ok = 0, fail = 0;

  for (const entity of schema) {
    try {
      const content  = buildEntityFile(entity);
      const filePath = path.join(outputDir, `${entity.name}.ts`);
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅  ${entity.name}.ts`);
      ok++;
    } catch (err) {
      console.error(`❌  Error generando ${entity.name}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n🎉  Listo — ${ok} modelos generados, ${fail} errores.`);
  console.log(`📂  Carpeta: ${outputDir}\n`);
}

run();