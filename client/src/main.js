import 'toastify-js/src/toastify.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import { DashboardPage } from './pages/dashboard.js';
import { MovementsPage } from './pages/movements.js';
import { CategoriesPage } from './pages/categories.js';
import { AccountsPage } from './pages/accounts.js';
import { BudgetsPage } from './pages/budgets.js';

const routes = {
    '#/dashboard': DashboardPage,
    '#/movements': MovementsPage,
    '#/categories': CategoriesPage,
    '#/accounts': AccountsPage,
    '#/budgets': BudgetsPage
};

function router() {
    const app = document.getElementById('app');
    const hash = window.location.hash || '#/dashboard';
    
    // Si la ruta no existe, redirigir a dashboard
    const view = routes[hash] || DashboardPage;
    
    app.innerHTML = view();
    
    // Actualizar clase activa en nav si fuera necesario
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
