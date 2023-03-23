var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:nutrientes');
var Nutriente = require('../models/nutriente');

/* GET lista de nutrientes. */
router.get('/', async function(req, res) {
  try {
    const resultado = await Nutriente.encontrarTodos()
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* GET nutriente por ID. */
router.get('/:nutrienteID', async function(req, res) {
  try {
    const resultado = await Nutriente.encontrarPorId(req.params.nutrienteID)
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
