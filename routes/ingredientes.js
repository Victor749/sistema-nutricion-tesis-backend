var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:ingredientes');
var Ingrediente = require('../models/ingrediente');

/* GET lista de ingredientes. */
router.get('/', async function(req, res) {
  try {
    const resultado = await Ingrediente.encontrarTodos()
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* GET buscar ingredientes por descripcion. */
router.get('/buscar/', async function(req, res) {
  try {
    const resultado = await Ingrediente.buscar(req.query.cadenaBusqueda, req.query.limite, req.query.pagina)
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

/* GET ingrediente por ID. */
router.get('/:ingredienteID', async function(req, res) {
  try {
    const resultado = await Ingrediente.encontrarPorId(req.params.ingredienteID)
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
