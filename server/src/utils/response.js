const sendResponse = (res, { ok, data = null, error = null }, statusCode = 200) => {
  const response = { ok };
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;
  res.status(statusCode).json(response);
};

export { sendResponse };
