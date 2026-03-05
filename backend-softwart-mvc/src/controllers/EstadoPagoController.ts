// ─────────────────────────────────────────────────────────────────────────────
//  EstadoPagoController.ts  —  Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { EstadoPago } from "../models/EstadoPago";
import { Pago } from "../models/Pago";


export const getAllEstadoPago = async (_req: Request, res: Response): Promise<void> => {
  try {
    const estadoPagoRepo = AppDataSource.getRepository(EstadoPago);
    const items = await estadoPagoRepo.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener EstadoPago", error });
  }
};

export const getEstadoPagoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoPagoRepo = AppDataSource.getRepository(EstadoPago);
    const item = await estadoPagoRepo.findOne({
      where: { id_estado_pago: Number(req.params.id) },
    });
    if (!item) { res.status(404).json({ success: false, message: "EstadoPago no encontrado" }); return; }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener EstadoPago", error });
  }
};

// ── Valores semilla para EstadoPago ──────────────────────────────────────────
// Puedes ejecutar seedDataEstadoPago() una vez al iniciar la app o via endpoint.
export const seedDataEstadoPago = async (): Promise<void> => {
  try {
    const estadoPagoRepo = AppDataSource.getRepository(EstadoPago);
    const existing = await estadoPagoRepo.count();
    if (existing > 0) return; // Ya inicializado
    const values = [
      {
          "nombre": "Pendiente"
      },
      {
          "nombre": "Validado"
      },
      {
          "nombre": "Rechazado"
      }
  ];
    await estadoPagoRepo.save(estadoPagoRepo.create(values as any[]));
    console.log("✅  EstadoPago sembrado correctamente (3 registros)");
  } catch (error) {
    console.error("❌  Error al sembrar EstadoPago:", error);
  }
};

export const createEstadoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoPagoRepo = AppDataSource.getRepository(EstadoPago);
    const required = ["nombre"];
    const missing = required.filter(k => req.body[k] === undefined);
    if (missing.length) { res.status(400).json({ success: false, message: `Campos requeridos: ${missing.join(", ")}` }); return; }
    const obj = estadoPagoRepo.create();
    obj.nombre = req.body.nombre;

    await estadoPagoRepo.save(obj);
    res.status(201).json({ success: true, message: "EstadoPago creado exitosamente", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear EstadoPago", error });
  }
};

export const updateEstadoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoPagoRepo = AppDataSource.getRepository(EstadoPago);
    const item = await estadoPagoRepo.findOne({
      where: { id_estado_pago: Number(req.params.id) },
    });
    if (!item) { res.status(404).json({ success: false, message: "EstadoPago no encontrado" }); return; }
    if (req.body.nombre !== undefined) item.nombre = req.body.nombre;

    await estadoPagoRepo.save(item);
    res.json({ success: true, message: "EstadoPago actualizado", data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar EstadoPago", error });
  }
};

export const deleteEstadoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadoPagoRepo = AppDataSource.getRepository(EstadoPago);
    const pagoRepo = AppDataSource.getRepository(Pago);
    const countPago = await pagoRepo.count({ where: { estadoPago: { id_estado_pago: Number(req.params.id) } } });
    if (countPago > 0) {
      res.status(409).json({ success: false, message: `No se puede eliminar: existen Pago asociados (${countPago})` }); return;
    }
    const item = await estadoPagoRepo.findOneBy({ id_estado_pago: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "EstadoPago no encontrado" }); return; }
    await estadoPagoRepo.remove(item);
    res.json({ success: true, message: "EstadoPago eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar EstadoPago", error });
  }
};


// Cambiar el estado de un Pago
export const cambiarEstadoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagoRepo = AppDataSource.getRepository(Pago);
    const estadoPagoRepo   = AppDataSource.getRepository(EstadoPago);
    const target = await pagoRepo.findOneBy({ id_pago: Number(req.params.id_pago) });
    if (!target) { res.status(404).json({ success: false, message: "Pago no encontrado" }); return; }
    const nuevoEstado = await estadoPagoRepo.findOneBy({ id_estado_pago: Number(req.body.id_estado_pago) });
    if (!nuevoEstado) { res.status(404).json({ success: false, message: "EstadoPago no encontrado" }); return; }
    target.estadoPago = nuevoEstado;
    await pagoRepo.save(target);
    res.json({ success: true, message: "Cambiar el estado de un Pago actualizado", data: target });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en cambiarEstadoPago", error });
  }
};

