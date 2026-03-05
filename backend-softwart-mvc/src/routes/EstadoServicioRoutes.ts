// Generado automáticamente por generate-routes.js
import { Router } from "express";
import { getAllEstadoServicio, getEstadoServicioById, createEstadoServicio, updateEstadoServicio, deleteEstadoServicio, cambiarEstadoDetalle } from "../controllers/EstadoServicioController";

const router = Router();

// ── Rutas de EstadoServicio ──────────────────────────────────
// GET    /           → listar todos
router.get("/", getAllEstadoServicio);

// GET    /:id      → obtener uno por ID
router.get("/:id", getEstadoServicioById);

// POST   /           → crear nuevo
router.post("/", createEstadoServicio);

// PUT    /:id      → actualizar
router.put("/:id", updateEstadoServicio);

// DELETE /:id      → eliminar (valida dependencias)
router.delete("/:id", deleteEstadoServicio);

// PATCH  /detalle/:id_detalle/estado      → Cambia el estadoServicio de un DetalleVenta
router.patch("/detalle/:id_detalle/estado", cambiarEstadoDetalle);

export { router as estadoServicioRouter };
