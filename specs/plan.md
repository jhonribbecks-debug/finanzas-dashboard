# Plan Técnico — Dashboard de Finanzas Personales

## 1. Estructura del repositorio

```
finanzas-dashboard/
├── specs/                      # artefactos SDD (este folder)
├── client/                     # Vite (HTML/CSS/JS puro)
│   ├── index.html
│   ├── src/
│   │   ├── main.js
│   │   ├── api/http.js         # wrapper fetch → /api/v1
│   │   ├── pages/              # dashboard, movimientos, categorias, cuentas, presupuesto
│   │   ├── components/         # tabla, filtros, modales, charts
│   │   ├── utils/              # formato moneda, fechas (Day.js)
│   │   └── styles/
├── server/
│   ├── src/
│   │   ├── index.js            # bootstrap Express
│   │   ├── db/database.js      # conexión better-sqlite3 + PRAGMA + migraciones
│   │   ├── db/seed.js          # categorías semilla
│   │   ├── routes/             # *.routes.js → /api/v1
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── middlewares/        # errorHandler, validate
│   └── tests/                  # Vitest + Supertest
└── package.json                # workspaces: client, server
```

## 2. Modelo de datos (SQLite)

```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,               -- UUID
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  type TEXT NOT NULL CHECK(type IN ('efectivo','debito','credito','billetera')),
  initial_balance REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL COLLATE NOCASE,
  kind TEXT NOT NULL CHECK(kind IN ('ingreso','gasto')),
  color TEXT, icon TEXT,
  UNIQUE(name, kind)
);

CREATE TABLE movements (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('ingreso','gasto')),
  amount REAL NOT NULL CHECK(amount > 0),
  date TEXT NOT NULL,                -- YYYY-MM-DD
  description TEXT,
  category_id TEXT NOT NULL REFERENCES categories(id),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_mov_date ON movements(date);
CREATE INDEX idx_mov_cat  ON movements(category_id);

CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,               -- YYYY-MM
  category_id TEXT REFERENCES categories(id),  -- NULL = presupuesto global
  amount REAL NOT NULL CHECK(amount > 0),
  UNIQUE(month, category_id)
);
```

## 3. API REST (`/api/v1`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/accounts` | listar (con saldo calculado) / crear |
| PUT/DELETE | `/accounts/:id` | editar / eliminar (409 si tiene movimientos) |
| GET/POST | `/categories` | listar / crear |
| PUT/DELETE | `/categories/:id` | editar / eliminar (409 + opción `?reassignTo=`) |
| GET | `/movements` | filtros: `from,to,categoryId,accountId,kind,q,page,limit` |
| POST/PUT/DELETE | `/movements(/:id)` | CRUD |
| GET | `/dashboard/summary?month=YYYY-MM` | totales, balance, % presupuesto |
| GET | `/dashboard/by-category?month=` | agregado para gráfico de dona |
| GET | `/dashboard/timeline?months=6` | serie mensual ingresos/gastos |
| GET/PUT | `/budgets?month=` | leer / definir presupuestos del mes |

Formato de respuesta uniforme según constitución. Errores: `400` validación, `404` no encontrado, `409` conflicto de integridad.

## 4. Decisiones técnicas clave

- **better-sqlite3** síncrono: simplifica repositories, rendimiento sobrado para app local.
- Agregaciones (sumas por categoría, series mensuales) se hacen **en SQL**, no en JS.
- Exportación **en el cliente**: SheetJS y jsPDF consumen el mismo endpoint `/movements` con los filtros activos (sin paginar, `limit=all`).
- Migraciones simples: script `db/migrate.js` idempotente ejecutado al arrancar el server.
- Validación: middleware `validate(schema)` por ruta usando Validator.js.
- Frontend SPA ligera "hecha a mano": router por hash (`#/dashboard`, `#/movimientos`...), sin librerías de routing.

## 5. Estrategia de pruebas

- **Unitarias (Vitest):** services con repositories mockeados — reglas de negocio (rechazo de montos ≤ 0, conflicto al eliminar categoría con movimientos, cálculo de saldo).
- **Integración (Supertest):** endpoints contra SQLite en memoria (`:memory:`) — CRUD completo + filtros + summary.
- **Datos de prueba:** factory sencilla en `tests/helpers/factories.js`.

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Gráficos desincronizados con filtros | Estado central simple (módulo `store.js`) que emite eventos a los charts |
| Fechas mal comparadas como texto | Formato ISO `YYYY-MM-DD` garantiza orden lexicográfico = cronológico |
| Bloqueo de escritura SQLite | Una sola conexión del proceso server; better-sqlite3 la serializa |