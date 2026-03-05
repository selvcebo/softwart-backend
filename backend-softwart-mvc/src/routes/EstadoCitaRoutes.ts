// Generado automáticamente por generate-routes.js
import { Router } from "express";
import { getAllEstadoCita, getEstadoCitaById, createEstadoCita, updateEstadoCita, deleteEstadoCita, cambiarEstadoCita } from "../controllers/EstadoCitaController";

const router = Router();

// ── Rutas de EstadoCita ──────────────────────────────────────
// GET    /           → listar todos
router.get("/", getAllEstadoCita);

// GET    /:id      → obtener uno por ID
router.get("/:id", getEstadoCitaById);

// POST   /           → crear nuevo
router.post("/", createEstadoCita);

// PUT    /:id      → actualizar
router.put("/:id", updateEstadoCita);

// DELETE /:id      → eliminar (valida dependencias)
router.delete("/:id", deleteEstadoCita);

// PATCH  /cita/:id_cita/estado            → Cambia el estado de una Cita
router.patch("/cita/:id_cita/estado", cambiarEstadoCita);

export { router as estadoCitaRouter };
