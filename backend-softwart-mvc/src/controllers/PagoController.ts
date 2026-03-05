// ─────────────────────────────────────────────────────────────────────────────
//  PagoController.ts  —  Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Pago } from "../models/Pago";
import { Venta } from "../models/Venta";
import { MetodoPago } from "../models/MetodoPago";
import { EstadoPago } from "../models/EstadoPago";


export const getAllPago = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pagoRepo = AppDataSource.getRepository(Pago);
    const items = await pagoRepo.find({ relations: ["venta", "metodoPago", "estadoPago"] });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener Pago", error });
  }
};

export const getPagoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagoRepo = AppDataSource.getRepository(Pago);
    const item = await pagoRepo.findOne({
      where: { id_pago: Number(req.params.id) },
      relations: ["venta", "metodoPago", "estadoPago"],
    });
    if (!item) { res.status(404).json({ success: false, message: "Pago no encontrado" }); return; }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener Pago", error });
  }
};


export const createPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagoRepo = AppDataSource.getRepository(Pago);
    const required = ["fecha", "monto"];
    const missing = required.filter(k => req.body[k] === undefined);
    if (missing.length) { res.status(400).json({ success: false, message: `Campos requeridos: ${missing.join(", ")}` }); return; }
    const obj = pagoRepo.create();
    obj.fecha = req.body.fecha;
    obj.monto = req.body.monto;
    obj.observacion = req.body.observacion;
    if (req.body.id_venta !== undefined) {
      const ventaRepo = AppDataSource.getRepository(Venta);
      const relVenta = await ventaRepo.findOneBy({ id_venta: Number(req.body.id_venta) });
      if (!relVenta) { res.status(404).json({ success: false, message: "Venta no encontrado" }); return; }
      obj.venta = relVenta;
    }
    if (req.body.id_metodo_pago !== undefined) {
      const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
      const relMetodoPago = await metodoPagoRepo.findOneBy({ id_metodo_pago: Number(req.body.id_metodo_pago) });
      if (!relMetodoPago) { res.status(404).json({ success: false, message: "MetodoPago no encontrado" }); return; }
      obj.metodoPago = relMetodoPago;
    }
    if (req.body.id_estado_pago !== undefined) {
      const estadoPagoRepo = AppDataSource.getRepository(EstadoPago);
      const relEstadoPago = await estadoPagoRepo.findOneBy({ id_estado_pago: Number(req.body.id_estado_pago) });
      if (!relEstadoPago) { res.status(404).json({ success: false, message: "EstadoPago no encontrado" }); return; }
      obj.estadoPago = relEstadoPago;
    }
    await pagoRepo.save(obj);
    res.status(201).json({ success: true, message: "Pago creado exitosamente", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear Pago", error });
  }
};

export const updatePago = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagoRepo = AppDataSource.getRepository(Pago);
    const item = await pagoRepo.findOne({
      where: { id_pago: Number(req.params.id) },
      relations: ["venta", "metodoPago", "estadoPago"],
    });
    if (!item) { res.status(404).json({ success: false, message: "Pago no encontrado" }); return; }
    if (req.body.fecha !== undefined) item.fecha = req.body.fecha;
    if (req.body.monto !== undefined) item.monto = req.body.monto;
    if (req.body.observacion !== undefined) item.observacion = req.body.observacion;
    if (req.body.id_venta !== undefined) {
      const ventaRepo = AppDataSource.getRepository(Venta);
      const relVenta = await ventaRepo.findOneBy({ id_venta: Number(req.body.id_venta) });
      if (!relVenta) { res.status(404).json({ success: false, message: "Venta no encontrado" }); return; }
      item.venta = relVenta;
    }
    if (req.body.id_metodo_pago !== undefined) {
      const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
      const relMetodoPago = await metodoPagoRepo.findOneBy({ id_metodo_pago: Number(req.body.id_metodo_pago) });
      if (!relMetodoPago) { res.status(404).json({ success: false, message: "MetodoPago no encontrado" }); return; }
      item.metodoPago = relMetodoPago;
    }
    if (req.body.id_estado_pago !== undefined) {
      const estadoPagoRepo = AppDataSource.getRepository(EstadoPago);
      const relEstadoPago = await estadoPagoRepo.findOneBy({ id_estado_pago: Number(req.body.id_estado_pago) });
      if (!relEstadoPago) { res.status(404).json({ success: false, message: "EstadoPago no encontrado" }); return; }
      item.estadoPago = relEstadoPago;
    }
    await pagoRepo.save(item);
    res.json({ success: true, message: "Pago actualizado", data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar Pago", error });
  }
};

export const deletePago = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagoRepo = AppDataSource.getRepository(Pago);

    const item = await pagoRepo.findOneBy({ id_pago: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "Pago no encontrado" }); return; }
    await pagoRepo.remove(item);
    res.json({ success: true, message: "Pago eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar Pago", error });
  }
};

