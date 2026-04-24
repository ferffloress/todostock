const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');

router.get('/', alertasController.obtener);

module.exports = router;
