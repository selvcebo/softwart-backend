import { Router } from "express";
import { getAllPermisoRol, createPermisoRol,
         deletePermisoRol } from "../controllers/PermisoRolController";
import { verifyToken, requireRol } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyToken, requireRol("Admin"));

// GET    /           → listar todas las relaciones
router.get("/",    getAllPermisoRol);

// POST   /           → crear relación  { id_permiso, id_rol }
router.post("/",   createPermisoRol);

// DELETE /           → eliminar relación  { id_permiso, id_rol }
router.delete("/", deletePermisoRol);

export { router as permisoRolRouter };
