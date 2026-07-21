# Constitución del Proyecto — Dashboard de Finanzas Personales

> Reglas no negociables. Todo artefacto posterior (spec, plan, tasks) y todo código generado debe cumplirlas. El agente de IA no debe sugerir alternativas descartadas aquí.

## 1. Estándares tecnológicos

- **Frontend:** HTML5, CSS3 y JavaScript puro (ES2023). Sin frameworks SPA (React/Vue/Angular prohibidos).
- **Bundler/entorno de desarrollo:** Vite.
- **Backend:** Node.js (LTS ≥ 20) con Express.
- **Base de datos:** SQLite (archivo local, acceso vía `better-sqlite3`).
- **Librerías permitidas:** Chart.js (gráficos), Day.js (fechas), SweetAlert2 (alertas), Toastify (notificaciones), SheetJS (export Excel), jsPDF (export PDF), Validator.js (validación), UUID (identificadores).
- **Comunicación:** el frontend consume exclusivamente la API REST vía `fetch`. Sin renderizado en servidor.

## 2. Arquitectura

- Arquitectura cliente-servidor estricta: `/client` (Vite) y `/server` (Express) separados en el monorepo.
- Backend por capas: **Controller → Service → Repository**. Ningún controller accede a la base de datos directamente; ningún repository contiene lógica de negocio.
- Rutas REST versionadas bajo `/api/v1/`.
- Respuestas JSON con formato uniforme: `{ ok: boolean, data?: any, error?: { code, message } }`.

## 3. Principios de código

- SOLID, Clean Code, KISS, DRY y YAGNI son obligatorios.
- Nombres en inglés para código; comentarios y documentación en español.
- Módulos ES (`import/export`), nunca CommonJS en código nuevo.
- Funciones ≤ 30 líneas; archivos ≤ 300 líneas como guía.
- ESLint con configuración estándar; el código debe pasar lint antes de cada commit.

## 4. Políticas de testing

- Pruebas automatizadas con **Vitest** (unitarias de services) y **Supertest** (integración de endpoints).
- Cobertura mínima: 70 % en la capa Service.
- Cada bug corregido requiere un test de regresión.

## 5. Requisitos de seguridad y validación

- Toda entrada del usuario se valida en backend con Validator.js (el frontend valida solo para UX).
- Consultas SQL siempre parametrizadas (prepared statements). Concatenación de SQL prohibida.
- Manejo centralizado de errores con middleware de Express; nunca exponer stack traces al cliente.

## 6. Control de versiones y trazabilidad

- Git + GitHub. Commits en formato Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
- Los artefactos SDD (`constitution.md`, `spec.md`, `clarification.md`, `plan.md`, `tasks.md`) viven en `/specs` dentro del repositorio y se actualizan antes que el código.
- Ningún cambio de comportamiento se implementa sin actualizar primero la spec correspondiente.

## 7. Rendimiento y UX

- Interfaz responsiva (móvil ≥ 360 px y escritorio).
- Respuesta de API < 200 ms para operaciones CRUD locales.
- El dashboard debe renderizar sus gráficos con datos ya agregados por el backend (no calcular agregaciones pesadas en el cliente).

## 8. Lo que NO queremos (decisiones descartadas)

- ORMs pesados (Sequelize, Prisma): descartados; se usa `better-sqlite3` directo en repositories.
- TypeScript: descartado para este proyecto (alcance académico, JS puro).
- Autenticación multiusuario: fuera de alcance; la app es monousuario local.
- Docker/despliegue en nube: fuera de alcance.