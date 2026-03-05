// src/middlewares/rateLimit.middleware.ts
import rateLimit from "express-rate-limit";

// ── Límite general para toda la API ──────────────────────────────────────────
export const generalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,  // ventana de 15 minutos
  max:              100,              // máx 100 requests por IP
  standardHeaders:  true,            // devuelve info en headers RateLimit-*
  legacyHeaders:    false,
  message: {
    success: false,
    message: "Demasiadas solicitudes, intenta de nuevo en 15 minutos",
  },
});

// ── Límite estricto para auth (login, registro) ───────────────────────────────
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,  // ventana de 15 minutos
  max:              10,              // máx 10 intentos de login por IP
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: "Demasiados intentos de autenticación, intenta de nuevo en 15 minutos",
  },
});