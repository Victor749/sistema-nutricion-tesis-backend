var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:sustituciones');
var Sustitucion = require('../models/sustitucion');

/* POST solicitar sustitucion. */
router.post('/usuario/:usuarioID/alimento/:alimentoID', async function(req, res) {
    try {
      const resultado = await Sustitucion.solicitarSustitucion(req.params.usuarioID, req.params.alimentoID)
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
