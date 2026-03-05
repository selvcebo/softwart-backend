// ─────────────────────────────────────────────────────────────────────────────
//  MetodoPagoController.ts  —  Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { MetodoPago } from "../models/MetodoPago";
import { Pago } from "../models/Pago";


export const getAllMetodoPago = async (_req: Request, res: Response): Promise<void> => {
  try {
    const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
    const items = await metodoPagoRepo.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener MetodoPago", error });
  }
};

export const getMetodoPagoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
    const item = await metodoPagoRepo.findOne({
      where: { id_metodo_pago: Number(req.params.id) },
    });
    if (!item) { res.status(404).json({ success: false, message: "MetodoPago no encontrado" }); return; }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener MetodoPago", error });
  }
};

// ── Valores semilla para MetodoPago ──────────────────────────────────────────
// Puedes ejecutar seedDataMetodoPago() una vez al iniciar la app o via endpoint.
export const seedDataMetodoPago = async (): Promise<void> => {
  try {
    const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
    const existing = await metodoPagoRepo.count();
    if (existing > 0) return; // Ya inicializado
    const values = [
      {
          "nombre": "Efectivo"
      },
      {
          "nombre": "Transferencia"
      }
  ];
    await metodoPagoRepo.save(metodoPagoRepo.create(values as any[]));
    console.log("✅  MetodoPago sembrado correctamente (2 registros)");
  } catch (error) {
    console.error("❌  Error al sembrar MetodoPago:", error);
  }
};

export const createMetodoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
    const required = ["nombre"];
    const missing = required.filter(k => req.body[k] === undefined);
    if (missing.length) { res.status(400).json({ success: false, message: `Campos requeridos: ${missing.join(", ")}` }); return; }
    const obj = metodoPagoRepo.create();
    obj.nombre = req.body.nombre;

    await metodoPagoRepo.save(obj);
    res.status(201).json({ success: true, message: "MetodoPago creado exitosamente", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear MetodoPago", error });
  }
};

export const updateMetodoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
    const item = await metodoPagoRepo.findOne({
      where: { id_metodo_pago: Number(req.params.id) },
    });
    if (!item) { res.status(404).json({ success: false, message: "MetodoPago no encontrado" }); return; }
    if (req.body.nombre !== undefined) item.nombre = req.body.nombre;

    await metodoPagoRepo.save(item);
    res.json({ success: true, message: "MetodoPago actualizado", data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar MetodoPago", error });
  }
};

export const deleteMetodoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
    const pagoRepo = AppDataSource.getRepository(Pago);
    const countPago = await pagoRepo.count({ where: { metodoPago: { id_metodo_pago: Number(req.params.id) } } });
    if (countPago > 0) {
      res.status(409).json({ success: false, message: `No se puede eliminar: existen Pago asociados (${countPago})` }); return;
    }
    const item = await metodoPagoRepo.findOneBy({ id_metodo_pago: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "MetodoPago no encontrado" }); return; }
    await metodoPagoRepo.remove(item);
    res.json({ success: true, message: "MetodoPago eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar MetodoPago", error });
  }
};


// Asignar método de pago a un Pago
export const asignarMetodoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagoRepo = AppDataSource.getRepository(Pago);
    const metodoPagoRepo   = AppDataSource.getRepository(MetodoPago);
    const target = await pagoRepo.findOneBy({ id_pago: Number(req.params.id_pago) });
    if (!target) { res.status(404).json({ success: false, message: "Pago no encontrado" }); return; }
    const nuevoEstado = await metodoPagoRepo.findOneBy({ id_metodo_pago: Number(req.body.id_metodo_pago) });
    if (!nuevoEstado) { res.status(404).json({ success: false, message: "MetodoPago no encontrado" }); return; }
    target.metodoPago = nuevoEstado;
    await pagoRepo.save(target);
    res.json({ success: true, message: "Asignar método de pago a un Pago actualizado", data: target });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en asignarMetodoPago", error });
  }
};

