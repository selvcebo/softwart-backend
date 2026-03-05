import { Router } from "express";
import { getAllCita, getCitaById, createCita,
         updateCita, deleteCita } from "../controllers/CitaController";
import { verifyToken, requireRol } from "../middlewares/auth.middleware";

const router = Router();

// Admin y Empleado gestionan citas
router.use(verifyToken, requireRol("Admin", "Empleado"));

router.get("/",      getAllCita);
router.get("/:id",   getCitaById);
router.post("/",     createCita);
router.put("/:id",   updateCita);
router.delete("/:id", deleteCita);

export { router as citaRouter };
