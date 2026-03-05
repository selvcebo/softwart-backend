// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_cambiame_en_prod";

export interface AuthRequest extends Request {
  user?: {
    id_usuario:  number;
    correo:      string;
    id_rol:      number;
    rol:         string;              // nombre del rol: "Admin", "Empleado", "Cliente"
    id_cliente:  number | null;      // null si el usuario NO tiene Cliente asociado
  };
}

// ── Verifica el JWT ───────────────────────────────────────────────────────────
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token      = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, message: "Token no proporcionado" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, message: "Token inválido o expirado" });
  }
};

// ── Guard por nombre de rol ───────────────────────────────────────────────────
// Uso: router.get("/ruta", verifyToken, requireRol("Admin"), handler)
export const requireRol = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ success: false, message: "Acceso denegado: permisos insuficientes" });
      return;
    }
    next();
  };
};

// ── Guard: solo clientes (tienen id_cliente en el token) ─────────────────────
// Uso: router.get("/ruta", verifyToken, requireCliente, handler)
export const requireCliente = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.id_cliente === null) {
    res.status(403).json({ success: false, message: "Acceso denegado: se requiere cuenta de cliente" });
    return;
  }
  next();
};