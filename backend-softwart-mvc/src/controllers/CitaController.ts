// ─────────────────────────────────────────────────────────────────────────────
//  CitaController.ts  —  Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Cita } from "../models/Cita";
import { Venta } from "../models/Venta";
import { EstadoCita } from "../models/EstadoCita";
import { Cliente } from "../models/Cliente";


export const getAllCita = async (_req: Request, res: Response): Promise<void> => {
  try {
    const citaRepo = AppDataSource.getRepository(Cita);
    const items = await citaRepo.find({ relations: ["estadoCita", "cliente"] });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener Cita", error });
  }
};

export const getCitaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const citaRepo = AppDataSource.getRepository(Cita);
    const item = await citaRepo.findOne({
      where: { id_cita: Number(req.params.id) },
      relations: ["estadoCita", "cliente"],
    });
    if (!item) { res.status(404).json({ success: false, message: "Cita no encontrado" }); return; }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener Cita", error });
  }
};


export const createCita = async (req: Request, res: Response): Promise<void> => {
  try {
    const citaRepo = AppDataSource.getRepository(Cita);
    const required = ["fecha", "hora"];
    const missing = required.filter(k => req.body[k] === undefined);
    if (missing.length) { res.status(400).json({ success: false, message: `Campos requeridos: ${missing.join(", ")}` }); return; }
    const obj = citaRepo.create();
    obj.fecha = req.body.fecha;
    obj.hora = req.body.hora;
    if (req.body.id_estado_cita !== undefined) {
      const estadoCitaRepo = AppDataSource.getRepository(EstadoCita);
      const relEstadoCita = await estadoCitaRepo.findOneBy({ id_estado_cita: Number(req.body.id_estado_cita) });
      if (!relEstadoCita) { res.status(404).json({ success: false, message: "EstadoCita no encontrado" }); return; }
      obj.estadoCita = relEstadoCita;
    }
    if (req.body.id_cliente !== undefined) {
      const clienteRepo = AppDataSource.getRepository(Cliente);
      const relCliente = await clienteRepo.findOneBy({ id_cliente: Number(req.body.id_cliente) });
      if (!relCliente) { res.status(404).json({ success: false, message: "Cliente no encontrado" }); return; }
      obj.cliente = relCliente;
    }
    await citaRepo.save(obj);
    res.status(201).json({ success: true, message: "Cita creado exitosamente", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear Cita", error });
  }
};

export const updateCita = async (req: Request, res: Response): Promise<void> => {
  try {
    const citaRepo = AppDataSource.getRepository(Cita);
    const item = await citaRepo.findOne({
      where: { id_cita: Number(req.params.id) },
      relations: ["estadoCita", "cliente"],
    });
    if (!item) { res.status(404).json({ success: false, message: "Cita no encontrado" }); return; }
    if (req.body.fecha !== undefined) item.fecha = req.body.fecha;
    if (req.body.hora !== undefined) item.hora = req.body.hora;
    if (req.body.id_estado_cita !== undefined) {
      const estadoCitaRepo = AppDataSource.getRepository(EstadoCita);
      const relEstadoCita = await estadoCitaRepo.findOneBy({ id_estado_cita: Number(req.body.id_estado_cita) });
      if (!relEstadoCita) { res.status(404).json({ success: false, message: "EstadoCita no encontrado" }); return; }
      item.estadoCita = relEstadoCita;
    }
    if (req.body.id_cliente !== undefined) {
      const clienteRepo = AppDataSource.getRepository(Cliente);
      const relCliente = await clienteRepo.findOneBy({ id_cliente: Number(req.body.id_cliente) });
      if (!relCliente) { res.status(404).json({ success: false, message: "Cliente no encontrado" }); return; }
      item.cliente = relCliente;
    }
    await citaRepo.save(item);
    res.json({ success: true, message: "Cita actualizado", data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar Cita", error });
  }
};

export const deleteCita = async (req: Request, res: Response): Promise<void> => {
  try {
    const citaRepo = AppDataSource.getRepository(Cita);
    const ventaRepo = AppDataSource.getRepository(Venta);
    const countVenta = await ventaRepo.count({ where: { cita: { id_cita: Number(req.params.id) } } });
    if (countVenta > 0) {
      res.status(409).json({ success: false, message: `No se puede eliminar: existen Venta asociados (${countVenta})` }); return;
    }
    const item = await citaRepo.findOneBy({ id_cita: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "Cita no encontrado" }); return; }
    await citaRepo.remove(item);
    res.json({ success: true, message: "Cita eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar Cita", error });
  }
};

