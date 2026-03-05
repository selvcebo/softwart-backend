// Generado automáticamente por generate-routes.js
import { Router } from "express";
import { getAllMetodoPago, getMetodoPagoById, createMetodoPago, updateMetodoPago, deleteMetodoPago, asignarMetodoPago } from "../controllers/MetodoPagoController";

const router = Router();

// ── Rutas de MetodoPago ──────────────────────────────────────
// GET    /           → listar todos
router.get("/", getAllMetodoPago);

// GET    /:id      → obtener uno por ID
router.get("/:id", getMetodoPagoById);

// POST   /           → crear nuevo
router.post("/", createMetodoPago);

// PUT    /:id      → actualizar
router.put("/:id", updateMetodoPago);

// DELETE /:id      → eliminar (valida dependencias)
router.delete("/:id", deleteMetodoPago);

// PATCH  /pago/:id_pago/metodo            → Asigna un método de pago a un Pago
router.patch("/pago/:id_pago/metodo", asignarMetodoPago);

export { router as metodoPagoRouter };
