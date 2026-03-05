// Generado automáticamente por generate-routes.js
import { Router } from "express";
import { getAllEstadoPago, getEstadoPagoById, createEstadoPago, updateEstadoPago, deleteEstadoPago, cambiarEstadoPago } from "../controllers/EstadoPagoController";

const router = Router();

// ── Rutas de EstadoPago ──────────────────────────────────────
// GET    /           → listar todos
router.get("/", getAllEstadoPago);

// GET    /:id      → obtener uno por ID
router.get("/:id", getEstadoPagoById);

// POST   /           → crear nuevo
router.post("/", createEstadoPago);

// PUT    /:id      → actualizar
router.put("/:id", updateEstadoPago);

// DELETE /:id      → eliminar (valida dependencias)
router.delete("/:id", deleteEstadoPago);

// PATCH  /pago/:id_pago/estado            → Cambia el estadoPago de un Pago
router.patch("/pago/:id_pago/estado", cambiarEstadoPago);

export { router as estadoPagoRouter };
