// ─────────────────────────────────────────────────────────────────────────────
//  EstadoServicioController.ts  —  Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { EstadoServicio } from "../models/EstadoServicio";
import { DetalleVenta } from "../models/DetalleVenta";


export const getAllEstadoServicio = async (_req: Request, res: Response): Promise<void> => {
  try {
    const estadoServicioRepo = AppDataSource.getRepository(EstadoServicio);
    const items = await estadoServicioRepo.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener EstadoServicio", error });
  }
};

export const getEstadoServicioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoServicioRepo = AppDataSource.getRepository(EstadoServicio);
    const item = await estadoServicioRepo.findOne({
      where: { id_estado: Number(req.params.id) },
    });
    if (!item) { res.status(404).json({ success: false, message: "EstadoServicio no encontrado" }); return; }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener EstadoServicio", error });
  }
};

// ── Valores semilla para EstadoServicio ──────────────────────────────────────────
// Puedes ejecutar seedDataEstadoServicio() una vez al iniciar la app o via endpoint.
export const seedDataEstadoServicio = async (): Promise<void> => {
  try {
    const estadoServicioRepo = AppDataSource.getRepository(EstadoServicio);
    const existing = await estadoServicioRepo.count();
    if (existing > 0) return; // Ya inicializado
    const values = [
      {
          "nombre": "Sin empezar"
      },
      {
          "nombre": "En preparación"
      },
      {
          "nombre": "Finalizado"
      }
  ];
    await estadoServicioRepo.save(estadoServicioRepo.create(values as any[]));
    console.log("✅  EstadoServicio sembrado correctamente (3 registros)");
  } catch (error) {
    console.error("❌  Error al sembrar EstadoServicio:", error);
  }
};

export const createEstadoServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoServicioRepo = AppDataSource.getRepository(EstadoServicio);
    const required = ["nombre"];
    const missing = required.filter(k => req.body[k] === undefined);
    if (missing.length) { res.status(400).json({ success: false, message: `Campos requeridos: ${missing.join(", ")}` }); return; }
    const obj = estadoServicioRepo.create();
    obj.nombre = req.body.nombre;

    await estadoServicioRepo.save(obj);
    res.status(201).json({ success: true, message: "EstadoServicio creado exitosamente", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear EstadoServicio", error });
  }
};

export const updateEstadoServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoServicioRepo = AppDataSource.getRepository(EstadoServicio);
    const item = await estadoServicioRepo.findOne({
      where: { id_estado: Number(req.params.id) },
    });
    if (!item) { res.status(404).json({ success: false, message: "EstadoServicio no encontrado" }); return; }
    if (req.body.nombre !== undefined) item.nombre = req.body.nombre;

    await estadoServicioRepo.save(item);
    res.json({ success: true, message: "EstadoServicio actualizado", data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar EstadoServicio", error });
  }
};

export const deleteEstadoServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoServicioRepo = AppDataSource.getRepository(EstadoServicio);
    const detalleVentaRepo = AppDataSource.getRepository(DetalleVenta);
    const countDetalleVenta = await detalleVentaRepo.count({ where: { estadoServicio: { id_estado: Number(req.params.id) } } });
    if (countDetalleVenta > 0) {
      res.status(409).json({ success: false, message: `No se puede eliminar: existen DetalleVenta asociados (${countDetalleVenta})` }); return;
    }
    const item = await estadoServicioRepo.findOneBy({ id_estado: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "EstadoServicio no encontrado" }); return; }
    await estadoServicioRepo.remove(item);
    res.json({ success: true, message: "EstadoServicio eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar EstadoServicio", error });
  }
};


// Cambiar el estado de un DetalleVenta
export const cambiarEstadoDetalle = async (req: Request, res: Response): Promise<void> => {
  try {
    const detalleVentaRepo = AppDataSource.getRepository(DetalleVenta);
    const estadoServicioRepo   = AppDataSource.getRepository(EstadoServicio);
    const target = await detalleVentaRepo.findOneBy({ id_detalle: Number(req.params.id_detalle) });
    if (!target) { res.status(404).json({ success: false, message: "DetalleVenta no encontrado" }); return; }
    const nuevoEstado = await estadoServicioRepo.findOneBy({ id_estado: Number(req.body.id_estado) });
    if (!nuevoEstado) { res.status(404).json({ success: false, message: "EstadoServicio no encontrado" }); return; }
    target.estadoServicio = nuevoEstado;
    await detalleVentaRepo.save(target);
    res.json({ success: true, message: "Cambiar el estado de un DetalleVenta actualizado", data: target });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en cambiarEstadoDetalle", error });
  }
};

