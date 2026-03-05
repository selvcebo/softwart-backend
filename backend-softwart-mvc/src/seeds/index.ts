// ─────────────────────────────────────────────────────────────────────────────
//  src/seeds/index.ts
//  Puebla los catálogos de forma idempotente al arrancar la app.
//  Si la tabla ya tiene datos, la omite sin lanzar error.
// ─────────────────────────────────────────────────────────────────────────────

import { AppDataSource } from "../data-source";
import { Servicio }       from "../models/Servicio";
import { EstadoCita }     from "../models/EstadoCita";
import { EstadoServicio } from "../models/EstadoServicio";
import { MetodoPago }     from "../models/MetodoPago";
import { EstadoPago }     from "../models/EstadoPago";

// ── Servicio ──────────────────────────────────────────────────────────────────

async function seedServicio(): Promise<void> {
  const repo = AppDataSource.getRepository(Servicio);
  if (await repo.count() > 0) return;

  await repo.save(repo.create([
    { nombre: "Personalización", descripcion: "Servicio de personalización", duracion: 8,  estado: true },
    { nombre: "Restauración",    descripcion: "Servicio de restauración",    duracion: 15, estado: true },
    { nombre: "Enmarcación",     descripcion: "Servicio de enmarcación",     duracion: 8,  estado: true },
    { nombre: "Decoración",      descripcion: "Servicio de decoración",      duracion: 15, estado: true },
    { nombre: "Texturizado",     descripcion: "Servicio de texturizado",     duracion: 15, estado: true },
  ] as Servicio[]));

  console.log("✅  Servicio: 5 registros sembrados");
}

// ── EstadoCita ────────────────────────────────────────────────────────────────

async function seedEstadoCita(): Promise<void> {
  const repo = AppDataSource.getRepository(EstadoCita);
  if (await repo.count() > 0) return;

  await repo.save(repo.create([
    { nombre: "Pendiente"  },
    { nombre: "Completada" },
    { nombre: "No Asistió" },
    { nombre: "Cancelada"  },
  ] as EstadoCita[]));

  console.log("✅  EstadoCita: 4 registros sembrados");
}

// ── EstadoServicio ────────────────────────────────────────────────────────────

async function seedEstadoServicio(): Promise<void> {
  const repo = AppDataSource.getRepository(EstadoServicio);
  if (await repo.count() > 0) return;

  await repo.save(repo.create([
    { nombre: "Sin empezar"    },
    { nombre: "En preparación" },
    { nombre: "Finalizado"     },
  ] as EstadoServicio[]));

  console.log("✅  EstadoServicio: 3 registros sembrados");
}

// ── MetodoPago ────────────────────────────────────────────────────────────────

async function seedMetodoPago(): Promise<void> {
  const repo = AppDataSource.getRepository(MetodoPago);
  if (await repo.count() > 0) return;

  await repo.save(repo.create([
    { nombre: "Efectivo"      },
    { nombre: "Transferencia" },
  ] as MetodoPago[]));

  console.log("✅  MetodoPago: 2 registros sembrados");
}

// ── EstadoPago ────────────────────────────────────────────────────────────────

async function seedEstadoPago(): Promise<void> {
  const repo = AppDataSource.getRepository(EstadoPago);
  if (await repo.count() > 0) return;

  await repo.save(repo.create([
    { nombre: "Pendiente"  },
    { nombre: "Validado"   },
    { nombre: "Rechazado"  },
  ] as EstadoPago[]));

  console.log("✅  EstadoPago: 3 registros sembrados");
}

// ─────────────────────────────────────────────────────────────────────────────
//  RUNNER PRINCIPAL
//  Llama a todos los seeds en orden seguro (catálogos sin FK primero).
// ─────────────────────────────────────────────────────────────────────────────

export async function runAllSeeds(): Promise<void> {
  console.log("🌱  Iniciando semilla de catálogos...");
  try {
    await seedServicio();
    await seedEstadoCita();
    await seedEstadoServicio();
    await seedMetodoPago();
    await seedEstadoPago();
    console.log("✅  Semilla completada\n");
  } catch (error) {
    console.error("❌  Error durante la semilla:", error);
  }
}
