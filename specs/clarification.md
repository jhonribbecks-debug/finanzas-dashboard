# Clarificación — Dashboard de Finanzas Personales

> Ambigüedades resueltas y casos límite definidos antes de planear.

## Decisiones tomadas

| # | Pregunta | Decisión |
|---|----------|----------|
| C-01 | ¿Moneda? | Una sola: Soles (S/). Formato `S/ 1,234.56`. Sin conversión. |
| C-02 | ¿Zona horaria / formato de fecha? | Fecha local del navegador; almacenada como `YYYY-MM-DD` (texto ISO) en SQLite. Day.js para presentación `DD/MM/YYYY`. |
| C-03 | ¿Movimientos con fecha futura? | Permitidos (gastos programados), pero excluidos de indicadores hasta su fecha. |
| C-04 | ¿Transferencias entre cuentas? | Fuera de alcance v1. Se simulan con un gasto y un ingreso manuales. |
| C-05 | ¿Qué pasa al eliminar una cuenta con movimientos? | Igual que categorías: reasignar o cancelar. Nunca borrado en cascada silencioso. |
| C-06 | ¿Presupuesto por categoría es obligatorio? | No. El global mensual es el mínimo; por categoría es opcional. |
| C-07 | ¿Período por defecto del dashboard? | Mes calendario actual, con selector de mes/año. |
| C-08 | ¿Paginación en servidor o cliente? | En servidor (`?page=&limit=`), para mantener API consistente. |
| C-09 | ¿Montos negativos? | Prohibidos. El signo lo determina el tipo (ingreso/gasto). |
| C-10 | ¿Edición de movimientos recalcula presupuesto retroactivo? | Sí: indicadores siempre se calculan al vuelo desde la BD, nunca se cachean. |

## Casos límite

- Historial vacío → dashboard muestra estado vacío ("Registra tu primer movimiento") en lugar de gráficos rotos.
- División por cero en % de presupuesto cuando no hay presupuesto definido → mostrar "—".
- Exportar con 0 resultados filtrados → deshabilitar botones de exportación.
- Fecha de fin de mes en febrero/meses de 30 días para el rango del dashboard → resolver con Day.js `endOf('month')`.
- Nombre de categoría duplicado con distinta capitalización ("comida" vs "Comida") → comparación case-insensitive, se rechaza.