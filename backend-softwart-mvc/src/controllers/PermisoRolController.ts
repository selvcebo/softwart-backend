// ─────────────────────────────────────────────────────────────────────────────
//  PermisoRolController.ts  —  Generado automáticamente por generate-controllers.js
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { PermisoRol } from "../models/PermisoRol";
import { Permiso } from "../models/Permiso";
import { Rol } from "../models/Rol";


export const getAllPermisoRol = async (_req: Request, res: Response): Promise<void> => {
  try {
    const permisoRolRepo = AppDataSource.getRepository(PermisoRol);
    const items = await permisoRolRepo.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener PermisoRol", error });
  }
};



export const createPermisoRol = async (req: Request, res: Response): Promise<void> => {
  try {
    const permisoRolRepo     = AppDataSource.getRepository(PermisoRol);
    const permisoRepo = AppDataSource.getRepository(Permiso);
    const rolRepo     = AppDataSource.getRepository(Rol);
    const { id_permiso, id_rol } = req.body;
    if (!id_permiso || !id_rol) {
      res.status(400).json({ success: false, message: "id_permiso e id_rol son requeridos" }); return;
    }
    const permiso = await permisoRepo.findOneBy({ id_permiso: Number(id_permiso) });
    const rol     = await rolRepo.findOneBy({ id_rol: Number(id_rol) });
    if (!permiso) { res.status(404).json({ success: false, message: "Permiso no encontrado" }); return; }
    if (!rol)     { res.status(404).json({ success: false, message: "Rol no encontrado" }); return; }
    const existing = await permisoRolRepo.findOne({ where: { permiso: { id_permiso: Number(id_permiso) }, rol: { id_rol: Number(id_rol) } } });
    if (existing) { res.status(409).json({ success: false, message: "La relación ya existe" }); return; }
    const obj = permisoRolRepo.create({ permiso, rol });
    await permisoRolRepo.save(obj);
    res.status(201).json({ success: true, message: "PermisoRol creado", data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear PermisoRol", error });
  }
};


export const deletePermisoRol = async (req: Request, res: Response): Promise<void> => {
  try {
    const permisoRolRepo = AppDataSource.getRepository(PermisoRol);
    const { id_permiso, id_rol } = req.body;
    const item = await permisoRolRepo.findOne({ where: { permiso: { id_permiso: Number(id_permiso) }, rol: { id_rol: Number(id_rol) } } });
    if (!item) { res.status(404).json({ success: false, message: "PermisoRol no encontrado" }); return; }
    await permisoRolRepo.remove(item);
    res.json({ success: true, message: "PermisoRol eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar PermisoRol", error });
  }
};

