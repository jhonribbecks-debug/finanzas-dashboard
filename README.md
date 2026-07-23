# Dashboard de Finanzas Personales

Aplicación web para gestión de finanzas personales: control de movimientos (ingresos y gastos), presupuestos por categoría, cuentas con saldo consolidado y visualización de indicadores y gráficos.

## Stack tecnológico

**Frontend** (`client/`)
- Vite + vanilla JavaScript (ES modules)
- SweetAlert2 — modales y confirmaciones
- Toastify — notificaciones
- Chart.js — gráficos (doughnut, bar)
- SheetJS (xlsx) — exportación a Excel
- jsPDF + jspdf-autotable — exportación a PDF

**Backend** (`server/`)
- Node.js + Express
- SQLite (`better-sqlite3`) — base de datos embebida
- UUID — generación de IDs

**Testing**
- Vitest — tests unitarios
- Supertest — tests de integración

**Tooling**
- npm workspaces (monorepo)
- ESLint

## Arquitectura

El backend sigue el patrón **Controller → Service → Repository**:

- **Repository** (`server/src/repositories/`): acceso directo a la base de datos mediante consultas SQL. Cada repositorio recibe la conexión `db` como dependencia (inyectable para testing).
- **Service** (`server/src/services/`): lógica de negocio, validaciones, manejo de errores con `statusCode` y `code`. Orquesta repositorios y lanza errores semánticos (404, 409, 400).
- **Controller** (`server/src/controllers/`): maneja requests HTTP, extrae parámetros, llama al servicio y envía la respuesta con `sendResponse`.
- **Routes** (`server/src/routes/`): mapea endpoints a métodos del controller, aplica middleware de validación.
- **Middlewares** (`server/src/middlewares/`): `validate` (validación de body contra esquema) y manejo de errores.

```
server/src/
├── controllers/    → HTTP handlers
├── services/       → business logic
├── repositories/   → SQL queries
├── routes/         → endpoint mapping
├── middlewares/    → validation + error handling
├── db/             → schema + seed
└── utils/          → response helper
```

## Metodología SDD

El desarrollo se guió por 5 artefactos en `specs/`:

| Artefacto | Descripción |
|-----------|-------------|
| `clarification.md` | Preguntas y respuestas de aclaración del producto |
| `constitution.md` | Reglas del proyecto, tecnologías permitidas y prohibidas |
| `plan.md` | Plan de desarrollo por fases |
| `spec.md` | Especificación funcional y técnica del software |
| `tasks.md` | Lista de 21 tareas organizadas por fase |

## Requisitos previos

- Node.js 22+
- npm 10+
- Python 3 + build tools (para compilar `better-sqlite3`)

## Instalación

```bash
git clone <repo-url>
cd finanzas-dashboard
npm install
```

## Ejecución

```bash
# Backend (Express en puerto 3000)
npm run dev -w server

# Frontend (Vite en puerto 5173)
npm run dev -w client
```

## Pruebas

```bash
npm test -w server
```

**68 pruebas** (unitarias + integración) con cobertura ≥ 70%.

## Funcionalidades implementadas

### Fase 0 — Andamiaje
- T-01 Monorepo con workspaces, Git, ESLint
- T-02 Proyecto Vite con router por hash
- T-03 Express con middleware de errores y respuesta uniforme
- T-04 SQLite con migraciones y seed de categorías

### Fase 1 — Núcleo de datos
- T-05 CRUD categorías (con reasignación de movimientos)
- T-06 CRUD cuentas (saldo calculado en SQL)
- T-07 CRUD movimientos (validación completa)
- T-08 Endpoint GET /movements con filtros y paginación
- T-09 Tests unitarios y de integración

### Fase 2 — Frontend CRUD
- T-10 Wrapper `http.js` y módulo `store.js`
- T-11 Página Movimientos (tabla, modal, notificaciones)
- T-12 Filtros combinables
- T-13 Páginas Categorías y Cuentas

### Fase 3 — Dashboard y presupuesto
- T-14 Endpoint `/dashboard/summary` (agregaciones SQL)
- T-15 Dashboard: tarjetas de indicadores + gráficos Chart.js
- T-16 CRUD presupuestos con barra de progreso
- T-17 Tests de endpoints de agregación y presupuesto

### Fase 4 — Exportación y cierre
- T-18 Exportar historial filtrado a Excel (SheetJS)
- T-19 Exportar a PDF (jsPDF) con totales
- T-20 Estados vacíos con botón de creación rápida
- T-21 README completo

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/categories` | Lista todas las categorías |
| GET | `/api/v1/categories/:id` | Obtiene una categoría |
| POST | `/api/v1/categories` | Crea una categoría |
| PUT | `/api/v1/categories/:id` | Actualiza una categoría |
| DELETE | `/api/v1/categories/:id` | Elimina una categoría (con reasignación) |
| GET | `/api/v1/accounts` | Lista todas las cuentas con saldo |
| GET | `/api/v1/accounts/:id` | Obtiene una cuenta con saldo |
| POST | `/api/v1/accounts` | Crea una cuenta |
| PUT | `/api/v1/accounts/:id` | Actualiza una cuenta |
| DELETE | `/api/v1/accounts/:id` | Elimina una cuenta |
| GET | `/api/v1/movements` | Lista movimientos con filtros y paginación |
| GET | `/api/v1/movements/:id` | Obtiene un movimiento |
| POST | `/api/v1/movements` | Crea un movimiento |
| PUT | `/api/v1/movements/:id` | Actualiza un movimiento |
| DELETE | `/api/v1/movements/:id` | Elimina un movimiento |
| GET | `/api/v1/dashboard/summary` | Resumen: totales mensuales, gastos por categoría, evolución, saldo consolidado |
| GET | `/api/v1/budgets?month=YYYY-MM` | Lista presupuestos de un mes con gasto real |
| GET | `/api/v1/budgets/:id` | Obtiene un presupuesto |
| POST | `/api/v1/budgets` | Crea un presupuesto |
| PUT | `/api/v1/budgets/:id` | Actualiza un presupuesto |
| DELETE | `/api/v1/budgets/:id` | Elimina un presupuesto |
