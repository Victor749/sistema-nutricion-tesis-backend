var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:marcas');
var Marca = require('../models/marca');

/* GET lista de marcas. */
router.get('/', async function(req, res) {
  try {
    const resultado = await Marca.encontrarTodos()
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* GET marca por ID. */
router.get('/:marcaID', async function(req, res) {
  try {
    const resultado = await Marca.encontrarPorId(req.params.marcaID)
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

/* GET marcas por empresa. */
router.get('/empresa/:empresaID', async function(req, res) {
  try {
    const resultado = await Marca.encontrarPorEmpresa(req.params.empresaID)
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

module.exports = router;
