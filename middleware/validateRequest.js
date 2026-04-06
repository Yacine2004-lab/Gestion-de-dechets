const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    message: 'Erreur de validation',
    errors: errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
      value: e.value,
    })),
  });
}

module.exports = { validateRequest };
