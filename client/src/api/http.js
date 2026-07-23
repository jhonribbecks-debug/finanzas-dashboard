const BASE_URL = '/api/v1';

async function request(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const body = await response.json();

  if (!response.ok) {
    const error = new Error(body.error?.message || 'Error en la solicitud');
    error.status = response.status;
    error.code = body.error?.code;
    error.details = body.error?.details;
    throw error;
  }

  return body.data;
}

export const http = {
  get: (url) => request(url),
  post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => request(url, { method: 'DELETE' }),
};
