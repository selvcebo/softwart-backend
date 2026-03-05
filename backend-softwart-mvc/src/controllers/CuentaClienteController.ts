// src/controllers/CuentaClienteController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Cliente } from "../models/Cliente";
import { Usuario } from "../models/Usuario";
import { Cita } from "../models/Cita";
import { Venta } from "../models/Venta";
import bcrypt from "bcrypt";

// ── GET /api/cuenta/perfil ────────────────────────────────────────────────────
export const verPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const clienteRepo = AppDataSource.getRepository(Cliente);
    const cliente = await clienteRepo.findOneBy({ id_cliente: req.user!.id_cliente! });

    if (!cliente) {
      res.status(404).json({ success: false, message: "Perfil no encontrado" });
      return;
    }

    res.json({ success: true, data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener perfil", error });
  }
};

// ── PUT /api/cuenta/perfil ────────────────────────────────────────────────────
export const editarPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const clienteRepo = AppDataSource.getRepository(Cliente);
    const usuarioRepo = AppDataSource.getRepository(Usuario);

    const cliente = await clienteRepo.findOneBy({ id_cliente: req.user!.id_cliente! });
    const usuario = await usuarioRepo.findOne({ where: { correo: req.user!.correo } });

    if (!cliente || !usuario) {
      res.status(404).json({ success: false, message: "Cuenta no encontrada" });
      return;
    }

    const { nombre, telefono, correo, clave } = req.body;

    if (nombre) cliente.nombre = nombre;
    if (telefono !== undefined) {
      if (!telefono) {
        res.status(400).json({ success: false, message: "El teléfono es requerido" });
        return;
      }
      cliente.telefono = telefono;
    }

    if (correo && correo !== cliente.correo) {
      const [correoEnCliente, correoEnUsuario] = await Promise.all([
        clienteRepo.findOne({ where: { correo } }),
        usuarioRepo.findOne({ where: { correo } }),
      ]);
      if (correoEnCliente || correoEnUsuario) {
        res.status(409).json({ success: false, message: "Ese correo ya está en uso" });
        return;
      }
      cliente.correo = correo;
      usuario.correo = correo;
    }

    if (clave) {
      usuario.clave = await bcrypt.hash(clave, 10);
    }

    await clienteRepo.save(cliente);
    await usuarioRepo.save(usuario);

    res.json({ success: true, message: "Perfil actualizado", data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar perfil", error });
  }
};

// ── GET /api/cuenta/citas ────────────────────────────────────────────────────
export const misCitas = async (req: Request, res: Response): Promise<void> => {
  try {
    const citaRepo = AppDataSource.getRepository(Cita);
    const citas = await citaRepo.find({
      where: { cliente: { id_cliente: req.user!.id_cliente! } },
      relations: ["estadoCita"],
      order: { fecha: "DESC" },
    });

    res.json({ success: true, data: citas });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener citas", error });
  }
};

// ── DELETE /api/cuenta ────────────────────────────────────────────────────────
export const eliminarCuenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const clienteRepo = AppDataSource.getRepository(Cliente);
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const citaRepo = AppDataSource.getRepository(Cita);
    const ventaRepo = AppDataSource.getRepository(Venta);

    const id_cliente = req.user!.id_cliente!;
    const correo = req.user!.correo;

    const [cliente, usuario] = await Promise.all([
      clienteRepo.findOneBy({ id_cliente }),
      usuarioRepo.findOne({ where: { correo } }),
    ]);

    if (!cliente || !usuario) {
      res.status(404).json({ success: false, message: "Cuenta no encontrada" });
      return;
    }

    const [totalCitas, totalVentas] = await Promise.all([
      citaRepo.count({ where: { cliente: { id_cliente } } }),
      ventaRepo.count({ where: { cliente: { id_cliente } } }),
    ]);

    if (totalCitas > 0 || totalVentas > 0) {
      cliente.estado = false;
      usuario.estado = false;
      await Promise.all([clienteRepo.save(cliente), usuarioRepo.save(usuario)]);

      res.json({
        success: true,
        tipo: "desactivada",
        message: "Cuenta desactivada. Tu historial queda conservado.",
      });
    } else {
      await usuarioRepo.remove(usuario);
      await clienteRepo.remove(cliente);

      res.json({
        success: true,
        tipo: "eliminada",
        message: "Cuenta eliminada permanentemente.",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al eliminar cuenta", error });
  }
};
