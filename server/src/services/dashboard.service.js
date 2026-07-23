import dashboardRepository from '../repositories/dashboard.repository.js';

class DashboardService {
  getSummary() {
    const { firstDay, lastDay } = this.getCurrentMonthRange();
    const { fromDate, monthLabels } = this.getLastSixMonthsRange();

    const monthly = dashboardRepository.getMonthlyTotals(firstDay, lastDay);
    const expensesByCategory = dashboardRepository.getExpensesByCategory(firstDay, lastDay);
    const evolutionRaw = dashboardRepository.getMonthlyEvolution(fromDate);
    const consolidatedBalance = dashboardRepository.getConsolidatedBalance();

    const evolution = this.fillMissingMonths(monthLabels, evolutionRaw);

    return {
      monthly: {
        income: monthly.income,
        expenses: monthly.expenses,
        balance: monthly.income - monthly.expenses,
      },
      consolidatedBalance,
      expensesByCategory,
      monthlyEvolution: evolution,
    };
  }

  getCurrentMonthRange() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
    return { firstDay, lastDay };
  }

  getLastSixMonthsRange() {
    const now = new Date();
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      labels.push(`${y}-${m}`);
    }
    const fromDate = `${labels[0]}-01`;
    return { fromDate, monthLabels: labels };
  }

  fillMissingMonths(labels, raw) {
    const map = {};
    raw.forEach((r) => {
      map[r.month] = { income: r.income, expenses: r.expenses };
    });
    return labels.map((month) => ({
      month,
      income: map[month]?.income || 0,
      expenses: map[month]?.expenses || 0,
    }));
  }
}

export default new DashboardService();
