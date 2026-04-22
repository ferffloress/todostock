const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');

router.get('/', comprasController.listar);
router.get('/:id', comprasController.obtener);
router.post('/', comprasController.crear);
router.patch('/:id/recibir', comprasController.recibir);
router.patch('/:id/cancelar', comprasController.cancelar);

module.exports = router;
