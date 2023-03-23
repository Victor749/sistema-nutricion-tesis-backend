var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:unidades');
var Unidad = require('../models/unidad');

/* GET lista de unidades. */
router.get('/', async function(req, res) {
  try {
    const resultado = await Unidad.encontrarTodos()
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* GET unidad por ID. */
router.get('/:unidadID', async function(req, res) {
  try {
    const resultado = await Unidad.encontrarPorId(req.params.unidadID)
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
