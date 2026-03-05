// ─────────────────────────────────────────────────────────────────────────────
//  DetalleVentaController.ts  —  Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { DetalleVenta } from "../models/DetalleVenta";
import { Venta } from "../models/Venta";
import { Servicio } from "../models/Servicio";
import { EstadoServicio } from "../models/EstadoServicio";
import { Marco } from "../models/Marco";


export const getAllDetalleVenta = async (_req: Request, res: Response): Promise<void> => {
  try {
    const detalleVentaRepo = AppDataSource.getRepository(DetalleVenta);
    const items = await detalleVentaRepo.find({ relations: ["venta", "servicio", "estadoServicio", "marco"] });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener DetalleVenta", error });
  }
};

export const getDetalleVentaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const detalleVentaRepo = AppDataSource.getRepository(DetalleVenta);
    const item = await detalleVentaRepo.findOne({
      where: { id_detalle: Number(req.params.id) },
      relations: ["venta", "servicio", "estadoServicio", "marco"],
    });
    if (!item) { res.status(404).json({ success: false, message: "DetalleVenta no encontrado" }); return; }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener DetalleVenta", error });
  }
};


export const createDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const detalleVentaRepo = AppDataSource.getRepository(DetalleVenta);
    const required = ["fecha", "observacion", "precio"];
    const missing = required.filter(k => req.body[k] === undefined);
    if (missing.length) { res.status(400).json({ success: false, message: `Campos requeridos: ${missing.join(", ")}` }); return; }
    const obj = detalleVentaRepo.create();
    obj.fecha = req.body.fecha;
    obj.observacion = req.body.observacion;
    obj.precio = req.body.precio;
    obj.estado = req.body.estado !== undefined ? req.body.estado : true;
    if (req.body.id_venta !== undefined) {
      const ventaRepo = AppDataSource.getRepository(Venta);
      const relVenta = await ventaRepo.findOneBy({ id_venta: Number(req.body.id_venta) });
      if (!relVenta) { res.status(404).json({ success: false, message: "Venta no encontrado" }); return; }
      obj.venta = relVenta;
    }
    if (req.body.id_servicio !== undefined) {
      const servicioRepo = AppDataSource.getRepository(Servicio);
      const relServicio = await servicioRepo.findOneBy({ id_servicio: Number(req.body.id_servicio) });
      if (!relServicio) { res.status(404).json({ success: false, message: "Servicio no encontrado" }); return; }
      obj.servicio = relServicio;
    }
    if (req.body.id_estado !== undefined) {
      const estadoServicioRepo = AppDataSource.getRepository(EstadoServicio);
      const relEstadoServicio = await estadoServicioRepo.findOneBy({ id_estado: Number(req.body.id_estado) });
      if (!relEstadoServicio) { res.status(404).json({ success: false, message: "EstadoServicio no encontrado" }); return; }
      obj.estadoServicio = relEstadoServicio;
    }
    if (req.body.id_marco !== undefined) {
      const marcoRepo = AppDataSource.getRepository(Marco);
      const relMarco = await marcoRepo.findOneBy({ id_marco: Number(req.body.id_marco) });
      if (!relMarco) { res.status(404).json({ success: false, message: "Marco no encontrado" }); return; }
      obj.marco = relMarco;
    }
    await detalleVentaRepo.save(obj);
    res.status(201).json({ success: true, message: "DetalleVenta creado exitosamente", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear DetalleVenta", error });
  }
};

export const updateDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const detalleVentaRepo = AppDataSource.getRepository(DetalleVenta);
    const item = await detalleVentaRepo.findOne({
      where: { id_detalle: Number(req.params.id) },
      relations: ["venta", "servicio", "estadoServicio", "marco"],
    });
    if (!item) { res.status(404).json({ success: false, message: "DetalleVenta no encontrado" }); return; }
    if (req.body.fecha !== undefined) item.fecha = req.body.fecha;
    if (req.body.observacion !== undefined) item.observacion = req.body.observacion;
    if (req.body.precio !== undefined) item.precio = req.body.precio;
    if (req.body.id_venta !== undefined) {
      const ventaRepo = AppDataSource.getRepository(Venta);
      const relVenta = await ventaRepo.findOneBy({ id_venta: Number(req.body.id_venta) });
      if (!relVenta) { res.status(404).json({ success: false, message: "Venta no encontrado" }); return; }
      item.venta = relVenta;
    }
    if (req.body.id_servicio !== undefined) {
      const servicioRepo = AppDataSource.getRepository(Servicio);
      const relServicio = await servicioRepo.findOneBy({ id_servicio: Number(req.body.id_servicio) });
      if (!relServicio) { res.status(404).json({ success: false, message: "Servicio no encontrado" }); return; }
      item.servicio = relServicio;
    }
    if (req.body.id_estado !== undefined) {
      const estadoServicioRepo = AppDataSource.getRepository(EstadoServicio);
      const relEstadoServicio = await estadoServicioRepo.findOneBy({ id_estado: Number(req.body.id_estado) });
      if (!relEstadoServicio) { res.status(404).json({ success: false, message: "EstadoServicio no encontrado" }); return; }
      item.estadoServicio = relEstadoServicio;
    }
    if (req.body.id_marco !== undefined) {
      const marcoRepo = AppDataSource.getRepository(Marco);
      const relMarco = await marcoRepo.findOneBy({ id_marco: Number(req.body.id_marco) });
      if (!relMarco) { res.status(404).json({ success: false, message: "Marco no encontrado" }); return; }
      item.marco = relMarco;
    }
    await detalleVentaRepo.save(item);
    res.json({ success: true, message: "DetalleVenta actualizado", data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar DetalleVenta", error });
  }
};

export const deleteDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const detalleVentaRepo = AppDataSource.getRepository(DetalleVenta);

    const item = await detalleVentaRepo.findOneBy({ id_detalle: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "DetalleVenta no encontrado" }); return; }
    await detalleVentaRepo.remove(item);
    res.json({ success: true, message: "DetalleVenta eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar DetalleVenta", error });
  }
};

export const toggleEstadoDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const detalleVentaRepo = AppDataSource.getRepository(DetalleVenta);
    const item = await detalleVentaRepo.findOneBy({ id_detalle: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "DetalleVenta no encontrado" }); return; }
    item.estado = !item.estado;
    await detalleVentaRepo.save(item);
    res.json({ success: true, message: `DetalleVenta ${item.estado ? "activado" : "inactivado"}`, data: { estado: item.estado } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al cambiar estado de DetalleVenta", error });
  }
};

