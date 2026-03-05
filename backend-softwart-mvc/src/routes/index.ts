// Generado automáticamente por generate-routes.js
// ─────────────────────────────────────────────────────────────────────────────
//  routes/index.ts
//  Registra todos los routers en la app de Express.
//  Importa y llama a registerRoutes(app) desde tu app.ts.
// ─────────────────────────────────────────────────────────────────────────────
import { Application } from "express";
import { permisoRouter } from "./PermisoRoutes";
import { rolRouter } from "./RolRoutes";
import { permisoRolRouter } from "./PermisoRolRoutes";
import { usuarioRouter } from "./UsuarioRoutes";
import { clienteRouter } from "./ClienteRoutes";
import { servicioRouter } from "./ServicioRoutes";
import { estadoCitaRouter } from "./EstadoCitaRoutes";
import { estadoServicioRouter } from "./EstadoServicioRoutes";
import { metodoPagoRouter } from "./MetodoPagoRoutes";
import { estadoPagoRouter } from "./EstadoPagoRoutes";
import { citaRouter } from "./CitaRoutes";
import { marcoRouter } from "./MarcoRoutes";
import { ventaRouter } from "./VentaRoutes";
import { detalleVentaRouter } from "./DetalleVentaRoutes";
import { pagoRouter } from "./PagoRoutes";
import { authRouter }          from "./AuthRoutes";
import { cuentaClienteRouter } from "./CuentaClienteRoutes";


export function registerRoutes(app: Application): void {
  app.use("/api/permisos", permisoRouter);
  app.use("/api/roles", rolRouter);
  app.use("/api/permiso-rol", permisoRolRouter);
  app.use("/api/usuarios", usuarioRouter);
  app.use("/api/clientes", clienteRouter);
  app.use("/api/servicios", servicioRouter);
  app.use("/api/estado-cita", estadoCitaRouter);
  app.use("/api/estado-servicio", estadoServicioRouter);
  app.use("/api/metodo-pago", metodoPagoRouter);
  app.use("/api/estado-pago", estadoPagoRouter);
  app.use("/api/citas", citaRouter);
  app.use("/api/marcos", marcoRouter);
  app.use("/api/ventas", ventaRouter);
  app.use("/api/detalle-venta", detalleVentaRouter);
  app.use("/api/pagos", pagoRouter);
  app.use("/api/auth",   authRouter);
  app.use("/api/cuenta", cuentaClienteRouter);
}
