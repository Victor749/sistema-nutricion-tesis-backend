var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:sustituciones');
var Sustitucion = require('../models/sustitucion');

/* POST solicitar sustitucion. */
router.post('/usuario/:usuarioID/alimento/:alimentoID', async function(req, res) {
    try {
      const resultado = await Sustitucion.solicitarSustitucion(req.params.usuarioID, req.params.alimentoID, req.query.flexible)
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

/* POST juzgar sugerencia. */
router.post('/sugerencia/usuario/:usuarioID/sustitucion/:sustitucionID/alimento/:alimentoID', async function(req, res) {
  try {
    const resultado = await Sustitucion.juzgarSugerencia(req.params.usuarioID, req.params.sustitucionID, req.params.alimentoID, req.body)
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

/* GET historial de de sustituciones. */
router.get('/historial/usuario/:usuarioID', async function(req, res) {
  try {
    const resultado = await Sustitucion.historialSustituciones(req.params.usuarioID, req.query.fecha, req.query.limite, req.query.pagina)
    if (resultado.codigo === 400)  {
      res.status(400).send(resultado.error)
    } else {
      res.status(200).json(resultado)
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

module.exports = router;
