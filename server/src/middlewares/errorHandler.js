import { sendResponse } from '../utils/response.js';

const errorHandler = (err, req, res, next) => {
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
};

export { errorHandler };
