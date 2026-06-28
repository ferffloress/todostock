const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');

router.get('/', alertasController.obtener);
router.post('/revisiones/:id/resolver', alertasController.resolverRevision);

module.exports = router;
