const express = require('express');
const router = express.Router();
const alertasService = require('../services/alertasService');

// GET /alertas
router.get('/', (req, res, next) => {
  try {
    const alertas = alertasService.getAlertas();
    res.json(alertas);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
