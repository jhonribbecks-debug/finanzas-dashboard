import express from 'express';
import cors from 'cors';
import categoryRoutes from './routes/category.routes.js';
import accountRoutes from './routes/account.routes.js';
import movementRoutes from './routes/movement.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const sendResponse = (res, { ok, data = null, error = null }, statusCode = 200) => {
  const response = { ok };
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;
  res.status(statusCode).json(response);
};

app.get('/api/v1/health', (req, res) => {
  sendResponse(res, { ok: true });
});

app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/movements', movementRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  sendResponse(
    res,
    {
      ok: false,
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Internal server error',
      },
    },
    err.statusCode || 500
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, sendResponse };
