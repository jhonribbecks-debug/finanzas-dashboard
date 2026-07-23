import { http } from '../api/http.js';
import { store } from '../utils/store.js';
import { formatCurrency, formatMonth } from '../utils/formatters.js';
import { Chart, registerables } from 'chart.js';
import Toastify from 'toastify-js';

Chart.register(...registerables);

let expenseChart = null;
let evolutionChart = null;

function toast(message, type = 'info') {
  Toastify({
    text: message,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    backgroundColor:
      type === 'error'
        ? '#ef4444'
        : type === 'success'
        ? '#10b981'
        : '#3b82f6',
  }).showToast();
}

async function loadSummary() {
  try {
    const data = await http.get('/dashboard/summary');
    store.set('dashboard', data);
    renderIndicators();
    renderExpenseChart();
    renderEvolutionChart();
  } catch (err) {
    toast(err.message, 'error');
  }
}

function renderIndicators() {
  const data = store.get('dashboard');
  if (!data) return;

  const container = document.getElementById('dashboard-indicators');
  if (!container) return;

  const { monthly, consolidatedBalance } = data;
  const balanceClass = monthly.balance >= 0 ? 'text-green' : 'text-red';
  const balanceSign = monthly.balance >= 0 ? '' : '-';

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Ingresos del mes</div>
      <div class="stat-value text-green">${formatCurrency(monthly.income)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Gastos del mes</div>
      <div class="stat-value text-red">${formatCurrency(monthly.expenses)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Balance del mes</div>
      <div class="stat-value ${balanceClass}">${balanceSign}${formatCurrency(Math.abs(monthly.balance))}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Saldo consolidado</div>
      <div class="stat-value">${formatCurrency(consolidatedBalance)}</div>
    </div>
  `;
}

function renderExpenseChart() {
  const data = store.get('dashboard');
  if (!data) return;

  const canvas = document.getElementById('chart-expenses');
  if (!canvas) return;

  if (expenseChart) {
    expenseChart.destroy();
  }

  const { expensesByCategory } = data;

  const labels = expensesByCategory.length > 0
    ? expensesByCategory.map((c) => c.name)
    : ['Sin gastos'];
  const amounts = expensesByCategory.length > 0
    ? expensesByCategory.map((c) => c.total)
    : [0];
  const colors = expensesByCategory.length > 0
    ? expensesByCategory.map((c) => c.color || '#ccc')
    : ['#ccc'];

  expenseChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: amounts,
        backgroundColor: colors,
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            generateLabels: (chart) => {
              const ds = chart.data.datasets[0];
              return chart.data.labels.map((label, i) => ({
                text: `${label}: ${formatCurrency(ds.data[i])}`,
                fillStyle: ds.backgroundColor[i],
                index: i,
              }));
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}`,
          },
        },
      },
    },
  });
}

function renderEvolutionChart() {
  const data = store.get('dashboard');
  if (!data) return;

  const canvas = document.getElementById('chart-evolution');
  if (!canvas) return;

  if (evolutionChart) {
    evolutionChart.destroy();
  }

  const { monthlyEvolution } = data;
  const labels = monthlyEvolution.map((m) => formatMonth(m.month));
  const income = monthlyEvolution.map((m) => m.income);
  const expenses = monthlyEvolution.map((m) => m.expenses);

  evolutionChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: income,
          backgroundColor: '#16a34a',
          borderColor: '#16a34a',
          borderWidth: 1,
        },
        {
          label: 'Gastos',
          data: expenses,
          backgroundColor: '#dc2626',
          borderColor: '#dc2626',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { stacked: false },
        y: { stacked: false },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
          },
        },
      },
    },
  });
}

function initDashboardPage() {
  loadSummary();
}

export function DashboardPage() {
  const html = `
    <section class="dashboard-page">
      <div class="page-header">
        <h1>Dashboard</h1>
      </div>

      <div id="dashboard-indicators" class="stats-grid"></div>

      <div class="charts-grid">
        <div class="chart-card">
          <h2 class="chart-title">Gastos por categoría</h2>
          <canvas id="chart-expenses"></canvas>
        </div>
        <div class="chart-card">
          <h2 class="chart-title">Evolución mensual</h2>
          <canvas id="chart-evolution"></canvas>
        </div>
      </div>
    </section>
  `;

  setTimeout(initDashboardPage, 0);
  return html;
}
