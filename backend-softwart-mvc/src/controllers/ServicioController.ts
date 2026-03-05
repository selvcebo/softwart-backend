// ─────────────────────────────────────────────────────────────────────────────
//  ServicioController.ts  —  Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Servicio } from "../models/Servicio";
import { DetalleVenta } from "../models/DetalleVenta";


export const getAllServicio = async (_req: Request, res: Response): Promise<void> => {
  try {
    const servicioRepo = AppDataSource.getRepository(Servicio);
    const items = await servicioRepo.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener Servicio", error });
  }
};

export const getServicioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const servicioRepo = AppDataSource.getRepository(Servicio);
    const item = await servicioRepo.findOne({
      where: { id_servicio: Number(req.params.id) },
    });
    if (!item) { res.status(404).json({ success: false, message: "Servicio no encontrado" }); return; }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener Servicio", error });
  }
};

// ── Valores semilla para Servicio ──────────────────────────────────────────
// Puedes ejecutar seedDataServicio() una vez al iniciar la app o via endpoint.
export const seedDataServicio = async (): Promise<void> => {
  try {
    const servicioRepo = AppDataSource.getRepository(Servicio);
    const existing = await servicioRepo.count();
    if (existing > 0) return; // Ya inicializado
    const values = [
      {
          "nombre": "Personalización",
          "descripcion": "Servicio de personalización",
          "duracion": 8,
          "estado": true
      },
      {
          "nombre": "Restauración",
          "descripcion": "Servicio de restauración",
          "duracion": 15,
          "estado": true
      },
      {
          "nombre": "Enmarcación",
          "descripcion": "Servicio de enmarcación",
          "duracion": 8,
          "estado": true
      },
      {
          "nombre": "Decoración",
          "descripcion": "Servicio de decoración",
          "duracion": 15,
          "estado": true
      },
      {
          "nombre": "Texturizado",
          "descripcion": "Servicio de texturizado",
          "duracion": 15,
          "estado": true
      }
  ];
    await servicioRepo.save(servicioRepo.create(values as any[]));
    console.log("✅  Servicio sembrado correctamente (5 registros)");
  } catch (error) {
    console.error("❌  Error al sembrar Servicio:", error);
  }
};

export const createServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const servicioRepo = AppDataSource.getRepository(Servicio);
    const required = ["nombre", "duracion"];
    const missing = required.filter(k => req.body[k] === undefined);
    if (missing.length) { res.status(400).json({ success: false, message: `Campos requeridos: ${missing.join(", ")}` }); return; }
    const obj = servicioRepo.create();
    obj.nombre = req.body.nombre;
    obj.descripcion = req.body.descripcion;
    obj.duracion = req.body.duracion;
    obj.estado = req.body.estado !== undefined ? req.body.estado : true;

    await servicioRepo.save(obj);
    res.status(201).json({ success: true, message: "Servicio creado exitosamente", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear Servicio", error });
  }
};

export const updateServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const servicioRepo = AppDataSource.getRepository(Servicio);
    const item = await servicioRepo.findOne({
      where: { id_servicio: Number(req.params.id) },
    });
    if (!item) { res.status(404).json({ success: false, message: "Servicio no encontrado" }); return; }
    if (req.body.nombre !== undefined) item.nombre = req.body.nombre;
    if (req.body.descripcion !== undefined) item.descripcion = req.body.descripcion;
    if (req.body.duracion !== undefined) item.duracion = req.body.duracion;

    await servicioRepo.save(item);
    res.json({ success: true, message: "Servicio actualizado", data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar Servicio", error });
  }
};

export const deleteServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const servicioRepo = AppDataSource.getRepository(Servicio);
    const detalleVentaRepo = AppDataSource.getRepository(DetalleVenta);
    const countDetalleVenta = await detalleVentaRepo.count({ where: { servicio: { id_servicio: Number(req.params.id) } } });
    if (countDetalleVenta > 0) {
      res.status(409).json({ success: false, message: `No se puede eliminar: existen DetalleVenta asociados (${countDetalleVenta})` }); return;
    }
    const item = await servicioRepo.findOneBy({ id_servicio: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "Servicio no encontrado" }); return; }
    await servicioRepo.remove(item);
    res.json({ success: true, message: "Servicio eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar Servicio", error });
  }
};

export const toggleEstadoServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const servicioRepo = AppDataSource.getRepository(Servicio);
    const item = await servicioRepo.findOneBy({ id_servicio: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "Servicio no encontrado" }); return; }
    item.estado = !item.estado;
    await servicioRepo.save(item);
    res.json({ success: true, message: `Servicio ${item.estado ? "activado" : "inactivado"}`, data: { estado: item.estado } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al cambiar estado de Servicio", error });
  }
};

