# Tareas — Dashboard de Finanzas Personales

> El agente ejecuta tarea por tarea, marcando `[x]` al completar. Cada tarea deja el proyecto en estado funcional.

## Fase 0 — Andamiaje
- [x] T-01 Inicializar monorepo con workspaces (`client`, `server`), Git, ESLint, `.gitignore`.
- [x] T-02 Crear proyecto Vite en `client/` con página base y router por hash.
- [x] T-03 Bootstrap Express en `server/` con middleware de errores y respuesta uniforme.
- [ ] T-04 Conexión SQLite (`better-sqlite3`), `PRAGMA foreign_keys=ON`, script de migración con las 4 tablas, seed de categorías.

## Fase 1 — Núcleo de datos
- [ ] T-05 CRUD **categorías**: repository → service → controller → rutas + validación. Regla de eliminación con reasignación.
- [ ] T-06 CRUD **cuentas** con saldo calculado en SQL. Misma regla de eliminación.
- [ ] T-07 CRUD **movimientos** con validación completa (monto > 0, fecha ISO, FKs existentes).
- [ ] T-08 Endpoint `GET /movements` con filtros combinables y paginación en servidor.
- [x] T-09 Pruebas unitarias de services (Vitest) + integración de endpoints (Supertest, BD `:memory:`).

## Fase 2 — Frontend CRUD
- [x] T-10 Wrapper `http.js` y módulo `store.js` de estado/eventos.
- [x] T-11 Página **Movimientos**: tabla paginada, formulario modal (SweetAlert2), notificaciones (Toastify).
- [x] T-12 Barra de **filtros** combinables conectada a la tabla.
- [x] T-13 Páginas **Categorías** y **Cuentas** (CRUD completo, flujo de reasignación).

## Fase 3 — Dashboard y presupuesto
- [ ] T-14 Endpoints de agregación: `summary`, `by-category`, `timeline` (SQL con GROUP BY).
- [ ] T-15 Página **Dashboard**: tarjetas de indicadores + 3 gráficos Chart.js + selector de mes.
- [ ] T-16 CRUD de **presupuesto** (global y por categoría) + barra de progreso + alertas 80 %/100 %.
- [ ] T-17 Pruebas de los endpoints de agregación y reglas de presupuesto.

## Fase 4 — Exportación y cierre
- [ ] T-18 Exportar historial filtrado a **Excel** (SheetJS) con totales.
- [ ] T-19 Exportar a **PDF** (jsPDF) con encabezado, período y totales.
- [ ] T-20 Estados vacíos, manejo de errores en UI, responsividad móvil.
- [ ] T-21 README con instrucciones de instalación/ejecución + revisión final de cobertura ≥ 70 %.