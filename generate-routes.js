// ─────────────────────────────────────────────────────────────────────────────
//  generate-routes.js
//  Ejecutar con:  node generate-routes.js
//  Genera los archivos de rutas en ./routes/<Nombre>Routes.ts
// ─────────────────────────────────────────────────────────────────────────────

"use strict";
const fs   = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────────────────────
//  ESQUEMA DE RUTAS
//
//  name        : nombre de la entidad
//  file        : nombre del archivo Routes (sin extensión)
//  controller  : nombre del archivo Controller (sin extensión)
//  pkParam     : nombre del parámetro de ruta para el ID  (ej: "id", "id_usuario")
//  hasEstado   : genera  PATCH /:id/estado  → toggleEstado<Nombre>
//  isJunction  : tabla puente → DELETE usa body, sin GET-by-id ni PUT
//  extraRoutes : rutas adicionales de catálogos especiales
//    { method, path, handler }
// ─────────────────────────────────────────────────────────────────────────────

const routeSchema = [

  // ── ISLA 1 · SEGURIDAD ────────────────────────────────────────────────────

  {
    name: "Permiso", file: "PermisoRoutes", controller: "PermisoController",
    pkParam: "id", hasEstado: true,
    exports: ["getAllPermiso", "getPermisoById", "createPermiso", "updatePermiso", "deletePermiso", "toggleEstadoPermiso"],
  },

  {
    name: "Rol", file: "RolRoutes", controller: "RolController",
    pkParam: "id", hasEstado: true,
    exports: ["getAllRol", "getRolById", "createRol", "updateRol", "deleteRol", "toggleEstadoRol"],
  },

  {
    name: "PermisoRol", file: "PermisoRolRoutes", controller: "PermisoRolController",
    pkParam: null, hasEstado: false, isJunction: true,
    exports: ["getAllPermisoRol", "createPermisoRol", "deletePermisoRol"],
  },

  {
    name: "Usuario", file: "UsuarioRoutes", controller: "UsuarioController",
    pkParam: "id", hasEstado: true,
    exports: ["getAllUsuario", "getUsuarioById", "createUsuario", "updateUsuario", "deleteUsuario", "toggleEstadoUsuario"],
  },

  // ── ISLA 2 · CLIENTES ─────────────────────────────────────────────────────

  {
    name: "Cliente", file: "ClienteRoutes", controller: "ClienteController",
    pkParam: "id", hasEstado: true,
    exports: ["getAllCliente", "getClienteById", "createCliente", "updateCliente", "deleteCliente", "toggleEstadoCliente"],
  },

  // ── ISLA 3 · CATÁLOGOS ────────────────────────────────────────────────────

  {
    name: "Servicio", file: "ServicioRoutes", controller: "ServicioController",
    pkParam: "id", hasEstado: true,
    exports: ["getAllServicio", "getServicioById", "createServicio", "updateServicio", "deleteServicio", "toggleEstadoServicio"],
  },

  {
    name: "EstadoCita", file: "EstadoCitaRoutes", controller: "EstadoCitaController",
    pkParam: "id", hasEstado: false,
    exports: ["getAllEstadoCita", "getEstadoCitaById", "createEstadoCita", "updateEstadoCita", "deleteEstadoCita", "cambiarEstadoCita"],
    extraRoutes: [
      // PATCH /api/estado-cita/cita/:id_cita/estado  → cambiarEstadoCita
      { method: "patch", routePath: "/cita/:id_cita/estado", handler: "cambiarEstadoCita",
        comment: "Cambia el estado de una Cita" },
    ],
  },

  {
    name: "EstadoServicio", file: "EstadoServicioRoutes", controller: "EstadoServicioController",
    pkParam: "id", hasEstado: false,
    exports: ["getAllEstadoServicio", "getEstadoServicioById", "createEstadoServicio", "updateEstadoServicio", "deleteEstadoServicio", "cambiarEstadoDetalle"],
    extraRoutes: [
      // PATCH /api/estado-servicio/detalle/:id_detalle/estado  → cambiarEstadoDetalle
      { method: "patch", routePath: "/detalle/:id_detalle/estado", handler: "cambiarEstadoDetalle",
        comment: "Cambia el estadoServicio de un DetalleVenta" },
    ],
  },

  {
    name: "MetodoPago", file: "MetodoPagoRoutes", controller: "MetodoPagoController",
    pkParam: "id", hasEstado: false,
    exports: ["getAllMetodoPago", "getMetodoPagoById", "createMetodoPago", "updateMetodoPago", "deleteMetodoPago", "asignarMetodoPago"],
    extraRoutes: [
      // PATCH /api/metodo-pago/pago/:id_pago/metodo  → asignarMetodoPago
      { method: "patch", routePath: "/pago/:id_pago/metodo", handler: "asignarMetodoPago",
        comment: "Asigna un método de pago a un Pago" },
    ],
  },

  {
    name: "EstadoPago", file: "EstadoPagoRoutes", controller: "EstadoPagoController",
    pkParam: "id", hasEstado: false,
    exports: ["getAllEstadoPago", "getEstadoPagoById", "createEstadoPago", "updateEstadoPago", "deleteEstadoPago", "cambiarEstadoPago"],
    extraRoutes: [
      // PATCH /api/estado-pago/pago/:id_pago/estado  → cambiarEstadoPago
      { method: "patch", routePath: "/pago/:id_pago/estado", handler: "cambiarEstadoPago",
        comment: "Cambia el estadoPago de un Pago" },
    ],
  },

  // ── ISLA 4 · OPERACIONES ──────────────────────────────────────────────────

  {
    name: "Cita", file: "CitaRoutes", controller: "CitaController",
    pkParam: "id", hasEstado: false,
    exports: ["getAllCita", "getCitaById", "createCita", "updateCita", "deleteCita"],
  },

  {
    name: "Marco", file: "MarcoRoutes", controller: "MarcoController",
    pkParam: "id", hasEstado: true,
    exports: ["getAllMarco", "getMarcoById", "createMarco", "updateMarco", "deleteMarco", "toggleEstadoMarco"],
  },

  {
    name: "Venta", file: "VentaRoutes", controller: "VentaController",
    pkParam: "id", hasEstado: true,
    exports: ["getAllVenta", "getVentaById", "createVenta", "updateVenta", "deleteVenta", "toggleEstadoVenta"],
  },

  {
    name: "DetalleVenta", file: "DetalleVentaRoutes", controller: "DetalleVentaController",
    pkParam: "id", hasEstado: true,
    exports: ["getAllDetalleVenta", "getDetalleVentaById", "createDetalleVenta", "updateDetalleVenta", "deleteDetalleVenta", "toggleEstadoDetalleVenta"],
  },

  // ── ISLA 5 · PAGOS ────────────────────────────────────────────────────────

  {
    name: "Pago", file: "PagoRoutes", controller: "PagoController",
    pkParam: "id", hasEstado: false,
    exports: ["getAllPago", "getPagoById", "createPago", "updatePago", "deletePago"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function buildRouteFile(entity) {
  const {
    name, file, controller,
    pkParam, hasEstado, isJunction,
    exports: ctrlExports,
    extraRoutes = [],
  } = entity;

  const routerVar  = `${name[0].toLowerCase() + name.slice(1)}Router`;
  const importLine = `import { ${ctrlExports.join(", ")} } from "../controllers/${controller}";`;

  // ── Rutas estándar ────────────────────────────────────────────────────────
  const stdRoutes = [];

  if (isJunction) {
    stdRoutes.push(
      `// GET    /           → listar todas las relaciones`,
      `router.get("/", getAllPermisoRol);`,
      ``,
      `// POST   /           → crear relación  { id_permiso, id_rol }`,
      `router.post("/", createPermisoRol);`,
      ``,
      `// DELETE /           → eliminar relación  { id_permiso, id_rol }`,
      `router.delete("/", deletePermisoRol);`,
    );
  } else {
    const n = name;
    stdRoutes.push(
      `// GET    /           → listar todos`,
      `router.get("/", getAll${n});`,
      ``,
      `// GET    /:${pkParam}      → obtener uno por ID`,
      `router.get("/:${pkParam}", get${n}ById);`,
      ``,
      `// POST   /           → crear nuevo`,
      `router.post("/", create${n});`,
      ``,
      `// PUT    /:${pkParam}      → actualizar`,
      `router.put("/:${pkParam}", update${n});`,
      ``,
      `// DELETE /:${pkParam}      → eliminar (valida dependencias)`,
      `router.delete("/:${pkParam}", delete${n});`,
    );

    if (hasEstado) {
      stdRoutes.push(
        ``,
        `// PATCH  /:${pkParam}/estado → activar / inactivar`,
        `router.patch("/:${pkParam}/estado", toggleEstado${n});`,
      );
    }
  }

  // ── Rutas extra (catálogos con endpoints de asignación) ───────────────────
  const extraLines = [];
  for (const er of extraRoutes) {
    extraLines.push(
      ``,
      `// ${er.method.toUpperCase()}  ${er.routePath.padEnd(32)} → ${er.comment}`,
      `router.${er.method}("${er.routePath}", ${er.handler});`,
    );
  }

  // ── Ensamblar ─────────────────────────────────────────────────────────────
  return [
    `// Generado automáticamente por generate-routes.js`,
    `import { Router } from "express";`,
    importLine,
    ``,
    `const router = Router();`,
    ``,
    `// ── Rutas de ${name} ${"─".repeat(Math.max(0, 48 - name.length))}`,
    ...stdRoutes,
    ...extraLines,
    ``,
    `export { router as ${routerVar} };`,
    ``,
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
//  INDEX DE RUTAS  (src/routes/index.ts)
//  Centraliza todos los routers para importarlos fácilmente en app.ts
// ─────────────────────────────────────────────────────────────────────────────

const API_PREFIXES = {
  Permiso:        "/api/permisos",
  Rol:            "/api/roles",
  PermisoRol:     "/api/permiso-rol",
  Usuario:        "/api/usuarios",
  Cliente:        "/api/clientes",
  Servicio:       "/api/servicios",
  EstadoCita:     "/api/estado-cita",
  EstadoServicio: "/api/estado-servicio",
  MetodoPago:     "/api/metodo-pago",
  EstadoPago:     "/api/estado-pago",
  Cita:           "/api/citas",
  Marco:          "/api/marcos",
  Venta:          "/api/ventas",
  DetalleVenta:   "/api/detalle-venta",
  Pago:           "/api/pagos",
};

function buildRoutesIndex() {
  const lcFirst = (s) => s[0].toLowerCase() + s.slice(1);

  const imports = routeSchema
    .map(e => {
      const rv = lcFirst(e.name) + "Router";
      return `import { ${rv} } from "./${e.file}";`;
    })
    .join("\n");

  const uses = routeSchema
    .map(e => {
      const rv     = lcFirst(e.name) + "Router";
      const prefix = API_PREFIXES[e.name];
      return `  app.use("${prefix}", ${rv});`;
    })
    .join("\n");

  const listing = routeSchema
    .map(e => {
      const prefix = API_PREFIXES[e.name];
      const extras = (e.extraRoutes ?? [])
        .map(er => `//   ${er.method.toUpperCase().padEnd(7)} ${prefix}${er.routePath}`)
        .join("\n");
      const base = [
        `//   GET     ${prefix}`,
        !e.isJunction ? `//   GET     ${prefix}/:id` : null,
        `//   POST    ${prefix}`,
        !e.isJunction ? `//   PUT     ${prefix}/:id` : null,
        `//   DELETE  ${prefix}${e.isJunction ? "  (body: { id_permiso, id_rol })" : "/:id"}`,
        e.hasEstado   ? `//   PATCH   ${prefix}/:id/estado` : null,
      ].filter(Boolean).join("\n");
      return base + (extras ? "\n" + extras : "");
    })
    .join("\n");

  return `// Generado automáticamente por generate-routes.js
// ─────────────────────────────────────────────────────────────────────────────
//  routes/index.ts
//  Registra todos los routers en la app de Express.
//  Importa y llama a registerRoutes(app) desde tu app.ts.
// ─────────────────────────────────────────────────────────────────────────────
import { Application } from "express";
${imports}

/**
 * Registra todas las rutas de la API en la aplicación Express.
 *
 * Endpoints disponibles:
${listing.split("\n").map(l => " * " + l).join("\n")}
 */
export function registerRoutes(app: Application): void {
${uses}
}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  RUNNER
// ─────────────────────────────────────────────────────────────────────────────

function run() {
  const baseDir  = process.cwd();
  const routeDir = path.join(baseDir, "routes");
  const divider  = "─".repeat(56);

  console.log(`\n${"═".repeat(56)}`);
  console.log(`  🚀  generate-routes.js`);
  console.log(`${"═".repeat(56)}`);

  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
    console.log(`  📁  Carpeta creada: routes/`);
  }

  let ok = 0, fail = 0;

  // ── Archivos individuales ─────────────────────────────────────────────────
  console.log(`\n${divider}`);
  console.log(`  🛣   ARCHIVOS DE RUTAS`);
  console.log(`${divider}`);

  for (const entity of routeSchema) {
    try {
      const content = buildRouteFile(entity);
      fs.writeFileSync(path.join(routeDir, `${entity.file}.ts`), content, "utf8");
      console.log(`  ✅  routes/${entity.file}.ts`);
      ok++;
    } catch (err) {
      console.error(`  ❌  routes/${entity.file}.ts — ${err.message}`);
      fail++;
    }
  }

  // ── Index ─────────────────────────────────────────────────────────────────
  console.log(`\n${divider}`);
  console.log(`  📋  ÍNDICE DE RUTAS`);
  console.log(`${divider}`);

  try {
    fs.writeFileSync(path.join(routeDir, "index.ts"), buildRoutesIndex(), "utf8");
    console.log(`  ✅  routes/index.ts`);
    ok++;
  } catch (err) {
    console.error(`  ❌  routes/index.ts — ${err.message}`);
    fail++;
  }

  // ── Resumen ───────────────────────────────────────────────────────────────
  console.log(`\n${"═".repeat(56)}`);
  console.log(`  🎉  ${ok} archivos generados, ${fail} errores`);
  console.log(`\n  💡  En tu app.ts agrega:`);
  console.log(`      import { registerRoutes } from "./routes";`);
  console.log(`      registerRoutes(app);`);
  console.log(`${"═".repeat(56)}\n`);
}

run();
