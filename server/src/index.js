import express from 'express';
import cors from 'cors';

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
