import validator from 'validator';

const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, config] of Object.entries(schema)) {
      const value = req.body[field];
      const { required, validators = [] } = config;

      if (required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: config.message || `${field} es obligatorio` });
        continue;
      }

      if (value === undefined || value === null || value === '') continue;

      for (const { fn, message } of validators) {
        if (!fn(value)) {
          errors.push({ field, message });
          break;
        }
      }
    }

    if (errors.length > 0) {
      const err = new Error('Validation failed');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      err.details = errors;
      return next(err);
    }

    next();
  };
};

export { validate };
