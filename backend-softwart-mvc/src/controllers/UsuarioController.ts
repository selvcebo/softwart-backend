// ─────────────────────────────────────────────────────────────────────────────
//  UsuarioController.ts
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Usuario } from "../models/Usuario";
import { Rol } from "../models/Rol";
import bcrypt from "bcrypt";

// Helper: elimina la clave del objeto antes de enviarlo
const sinClave = ({ clave, ...rest }: Usuario) => rest;

export const getAllUsuario = async (_req: Request, res: Response): Promise<void> => {
  try {
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const items = await usuarioRepo.find({ relations: ["rol"] });
    res.json({ success: true, data: items.map(sinClave) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener Usuario", error });
  }
};

export const getUsuarioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const item = await usuarioRepo.findOne({
      where: { id_usuario: Number(req.params.id) },
      relations: ["rol"],
    });
    if (!item) { res.status(404).json({ success: false, message: "Usuario no encontrado" }); return; }
    res.json({ success: true, data: sinClave(item) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener Usuario", error });
  }
};

export const createUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const required = ["correo", "clave"];
    const missing = required.filter(k => req.body[k] === undefined);
    if (missing.length) { res.status(400).json({ success: false, message: `Campos requeridos: ${missing.join(", ")}` }); return; }
    const obj = usuarioRepo.create();
    obj.correo = req.body.correo;
    obj.clave  = await bcrypt.hash(req.body.clave, 10);
    obj.estado = req.body.estado !== undefined ? req.body.estado : true;
    if (req.body.id_rol !== undefined) {
      const rolRepo = AppDataSource.getRepository(Rol);
      const relRol  = await rolRepo.findOneBy({ id_rol: Number(req.body.id_rol) });
      if (!relRol) { res.status(404).json({ success: false, message: "Rol no encontrado" }); return; }
      obj.rol = relRol;
    }
    await usuarioRepo.save(obj);
    res.status(201).json({ success: true, message: "Usuario creado exitosamente", data: sinClave(obj) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear Usuario", error });
  }
};

export const updateUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const item = await usuarioRepo.findOne({
      where: { id_usuario: Number(req.params.id) },
      relations: ["rol"],
    });
    if (!item) { res.status(404).json({ success: false, message: "Usuario no encontrado" }); return; }
    if (req.body.correo !== undefined) item.correo = req.body.correo;
    if (req.body.clave  !== undefined) item.clave  = await bcrypt.hash(req.body.clave, 10);
    if (req.body.id_rol !== undefined) {
      const rolRepo = AppDataSource.getRepository(Rol);
      const relRol  = await rolRepo.findOneBy({ id_rol: Number(req.body.id_rol) });
      if (!relRol) { res.status(404).json({ success: false, message: "Rol no encontrado" }); return; }
      item.rol = relRol;
    }
    await usuarioRepo.save(item);
    res.json({ success: true, message: "Usuario actualizado", data: sinClave(item) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar Usuario", error });
  }
};

export const deleteUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const item = await usuarioRepo.findOneBy({ id_usuario: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "Usuario no encontrado" }); return; }
    await usuarioRepo.remove(item);
    res.json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar Usuario", error });
  }
};

export const toggleEstadoUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const item = await usuarioRepo.findOneBy({ id_usuario: Number(req.params.id) });
    if (!item) { res.status(404).json({ success: false, message: "Usuario no encontrado" }); return; }
    item.estado = !item.estado;
    await usuarioRepo.save(item);
    res.json({ success: true, message: `Usuario ${item.estado ? "activado" : "inactivado"}`, data: { estado: item.estado } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al cambiar estado de Usuario", error });
  }
};