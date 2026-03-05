// Generado automáticamente por generate-routes.js
import { Router } from "express";
import { getAllServicio, getServicioById, createServicio, updateServicio, deleteServicio, toggleEstadoServicio } from "../controllers/ServicioController";

const router = Router();

// ── Rutas de Servicio ────────────────────────────────────────
// GET    /           → listar todos
router.get("/", getAllServicio);

// GET    /:id      → obtener uno por ID
router.get("/:id", getServicioById);

// POST   /           → crear nuevo
router.post("/", createServicio);

// PUT    /:id      → actualizar
router.put("/:id", updateServicio);

// DELETE /:id      → eliminar (valida dependencias)
router.delete("/:id", deleteServicio);

// PATCH  /:id/estado → activar / inactivar
router.patch("/:id/estado", toggleEstadoServicio);

export { router as servicioRouter };
