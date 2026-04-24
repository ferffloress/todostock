const express = require('express');
const router = express.Router();
const cobranzasController = require('../controllers/cobranzasController');

router.get('/', cobranzasController.listar);
router.get('/:id', cobranzasController.obtener);
router.post('/', cobranzasController.crear);

module.exports = router;
