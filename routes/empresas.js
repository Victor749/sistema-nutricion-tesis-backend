var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:empresas');
var Empresa = require('../models/empresa');

/* GET lista de empresas. */
router.get('/', async function(req, res) {
  try {
    const resultado = await Empresa.encontrarTodos()
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* GET empresa por ID. */
router.get('/:empresaID', async function(req, res) {
  try {
    const resultado = await Empresa.encontrarPorId(req.params.empresaID)
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
