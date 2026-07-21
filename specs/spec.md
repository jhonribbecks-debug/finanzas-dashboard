# Especificación — Dashboard de Finanzas Personales

## 1. Propósito (el porqué)

Permitir a un usuario registrar, organizar, visualizar y analizar sus ingresos y gastos personales mediante una interfaz web moderna, para identificar hábitos de consumo, controlar su presupuesto y apoyar la toma de decisiones financieras.

## 2. Alcance

**Incluye:** gestión de movimientos (ingresos/gastos), categorías, cuentas/medios de pago, presupuesto mensual, dashboard con indicadores y gráficos, filtros, exportación PDF/Excel.
**Excluye:** multiusuario, autenticación, sincronización en nube, monedas múltiples, importación bancaria automática.

## 3. Actores

- **Usuario** (único): persona que administra sus finanzas personales.

## 4. Requerimientos funcionales

### RF-01 Gestión de movimientos
- El usuario puede registrar un movimiento con: tipo (ingreso/gasto), monto (> 0, 2 decimales), fecha, categoría, cuenta, descripción opcional (≤ 200 caracteres).
- El usuario puede editar y eliminar movimientos existentes.
- Cada movimiento recibe un UUID como identificador.

### RF-02 Gestión de categorías
- CRUD de categorías con: nombre único (por tipo), tipo (ingreso/gasto), color e ícono opcionales.
- No se puede eliminar una categoría con movimientos asociados; el sistema ofrece reasignarlos o cancelar.
- El sistema incluye categorías semilla (Alimentación, Transporte, Vivienda, Salario, etc.).

### RF-03 Gestión de cuentas / medios de pago
- CRUD de cuentas con: nombre único, tipo (efectivo, débito, crédito, billetera digital), saldo inicial.
- El saldo actual de cada cuenta se calcula como saldo inicial + ingresos − gastos asociados.

### RF-04 Historial y filtros
- Vista de historial con tabla paginada (20 por página) ordenada por fecha descendente.
- Filtros combinables: rango de fechas, categoría, cuenta, tipo de movimiento, texto en descripción.

### RF-05 Dashboard e indicadores
- Indicadores del período seleccionado (mes por defecto): total ingresos, total gastos, balance, % de presupuesto consumido.
- Gráficos con Chart.js:
  - Línea/barras: ingresos vs. gastos por mes (últimos 6 meses).
  - Dona: distribución de gastos por categoría del período.
  - Barra de progreso: presupuesto mensual vs. gasto acumulado.

### RF-06 Presupuesto mensual
- El usuario define un presupuesto global mensual y opcionalmente por categoría de gasto.
- El sistema muestra el avance y alerta visualmente (Toastify) al superar el 80 % y el 100 %.

### RF-07 Exportación
- Exportar el historial filtrado a **Excel** (SheetJS) y a **PDF** (jsPDF) con encabezado, período y totales.

### RF-08 Validación y errores
- Validación en backend de todos los campos (Validator.js); errores devueltos con código y mensaje claros.
- El frontend muestra errores con SweetAlert2 y confirma acciones destructivas.

## 5. Requerimientos no funcionales

- **RNF-01** Interfaz responsiva (≥ 360 px).
- **RNF-02** Respuestas API < 200 ms en operaciones CRUD.
- **RNF-03** Persistencia íntegra en SQLite con claves foráneas activadas (`PRAGMA foreign_keys = ON`).
- **RNF-04** Cobertura de pruebas ≥ 70 % en capa Service.
- **RNF-05** Código conforme a la constitución del proyecto.

## 6. Criterios de aceptación globales

1. Registrar un gasto lo refleja de inmediato en historial, dashboard, saldo de cuenta y presupuesto.
2. Los filtros son combinables y afectan tanto la tabla como la exportación.
3. Eliminar una categoría con movimientos exige decisión explícita del usuario.
4. Los archivos exportados abren correctamente en Excel y en un lector PDF.
5. La aplicación funciona completa sin conexión a internet (solo localhost).