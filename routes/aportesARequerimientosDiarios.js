var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:aportesARequerimientosDiarios');
var AporteARequerimientoDiario = require('../models/aporteARequerimientoDiario');

/* GET calcular aporte de un alimento al requerimiento diario de un usuario. */
router.get('/usuario/:usuarioID/alimento/:alimentoID', async function(req, res) {
    try {
        const resultado = await AporteARequerimientoDiario.calcularAporteARequerimientoDiario(req.params.usuarioID, req.params.alimentoID)
        if (resultado.codigo === 404)  {
            res.status(404).send(resultado.error)
        } else {
            res.status(200).json(resultado)
        }
    } catch (error) {
        debug(error)
        res.status(500).send('Error en el servidor.')
    }
});

module.exports = router;
