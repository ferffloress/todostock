const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('soporte', { 
        titulo: 'Soporte Inteligente',
        usuarioRol: req.session?.usuarioRol || 'user'
    });
});

module.exports = router;