// ─────────────────────────────────────────────────────────────────────────────
//  EstadoCitaController.ts  —  Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { EstadoCita } from "../models/EstadoCita";
import { Cita } from "../models/Cita";


export const getAllEstadoCita = async (_req: Request, res: Response): Promise<void> => {
  try {
    const estadoCitaRepo = AppDataSource.getRepository(EstadoCita);
    const items = await estadoCitaRepo.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener EstadoCita", error });
  }
};

export const getEstadoCitaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoCitaRepo = AppDataSource.getRepository(EstadoCita);
    const item = await estadoCitaRepo.findOne({
      where: { id_estado_cita: Number(req.params.id) },
    });
    if (!item) { res.status(404).json({ success: false, message: "EstadoCita no encontrado" }); return; }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener EstadoCita", error });
  }
};

// ── Valores semilla para EstadoCita ──────────────────────────────────────────
// Puedes ejecutar seedDataEstadoCita() una vez al iniciar la app o via endpoint.
export const seedDataEstadoCita = async (): Promise<void> => {
  try {
    const estadoCitaRepo = AppDataSource.getRepository(EstadoCita);
    const existing = await estadoCitaRepo.count();
    if (existing > 0) return; // Ya inicializado
    const values = [
      {
          "nombre": "Pendiente"
      },
      {
          "nombre": "Completada"
      },
      {
          "nombre": "No Asistió"
      },
      {
          "nombre": "Cancelada"
      }
  ];
    await estadoCitaRepo.save(estadoCitaRepo.create(values as any[]));
    console.log("✅  EstadoCita sembrado correctamente (4 registros)");
  } catch (error) {
    console.error("❌  Error al sembrar EstadoCita:", error);
  }
};

export const createEstadoCita = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoCitaRepo = AppDataSource.getRepository(EstadoCita);
    const required = ["nombre"];
    const missing = required.filter(k => req.body[k] === undefined);
    if (missing.length) { res.status(400).json({ success: false, message: `Campos requeridos: ${missing.join(", ")}` }); return; }
    const obj = estadoCitaRepo.create();
    obj.nombre = req.body.nombre;

    await estadoCitaRepo.save(obj);
    res.status(201).json({ success: true, message: "EstadoCita creado exitosamente", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear EstadoCita", error });
  }
};

export const updateEstadoCita = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoCitaRepo = AppDataSource.getRepository(EstadoCita);
    const item = await estadoCitaRepo.findOne({
      where: { id_estado_cita: Number(req.params.id) },
    });
    if (!item) { res.status(404).json({ success: false, message: "EstadoCita no encontrado" }); return; }
    if (req.body.nombre !== undefined) item.nombre = req.body.nombre;

    await estadoCitaRepo.save(item);
    res.json({ success: true, message: "EstadoCita actualizado", data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar EstadoCita", error });
  }
};

export const deleteEstadoCita = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoCitaRepo = AppDataSource.getRepository(EstadoCita);
    const citaRepo = AppDataSource.getRepository(Cita);
    const countCita = await citaRepo.count({ where: { estadoCita: { id_estado_cita: Number(req.params.id) } } });
    if (countCita > 0) {
      res.status(409).json({ success: false, message: `No se puede eliminar: existen Cita asociados (${countCita})` }); return;
    }
    const item = await estadoCitaRepo.findOneBy({ id_estado_cita: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "EstadoCita no encontrado" }); return; }
    await estadoCitaRepo.remove(item);
    res.json({ success: true, message: "EstadoCita eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar EstadoCita", error });
  }
};


// Cambiar el estado de una Cita
export const cambiarEstadoCita = async (req: Request, res: Response): Promise<void> => {
  try {
    const citaRepo = AppDataSource.getRepository(Cita);
    const estadoCitaRepo   = AppDataSource.getRepository(EstadoCita);
    const target = await citaRepo.findOneBy({ id_cita: Number(req.params.id_cita) });
    if (!target) { res.status(404).json({ success: false, message: "Cita no encontrado" }); return; }
    const nuevoEstado = await estadoCitaRepo.findOneBy({ id_estado_cita: Number(req.body.id_estado_cita) });
    if (!nuevoEstado) { res.status(404).json({ success: false, message: "EstadoCita no encontrado" }); return; }
    target.estadoCita = nuevoEstado;
    await citaRepo.save(target);
    res.json({ success: true, message: "Cambiar el estado de una Cita actualizado", data: target });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en cambiarEstadoCita", error });
  }
};
