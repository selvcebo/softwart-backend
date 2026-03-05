// src/routes/CuentaClienteRoutes.ts
import { Router }                                            from "express";
import { verPerfil, editarPerfil, misCitas, eliminarCuenta } from "../controllers/CuentaClienteController";
import { verifyToken, requireCliente }                       from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyToken, requireCliente);   // todas requieren token de cliente

router.get("/perfil",   verPerfil);        // GET    /api/cuenta/perfil
router.put("/perfil",   editarPerfil);     // PUT    /api/cuenta/perfil
router.get("/citas",    misCitas);         // GET    /api/cuenta/citas
router.delete("/",      eliminarCuenta);   // DELETE /api/cuenta

export { router as cuentaClienteRouter };