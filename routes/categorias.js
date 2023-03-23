var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:categorias');
var Categoria = require('../models/categoria');

/* GET lista de categorias. */
router.get('/', async function(req, res) {
  try {
    const resultado = await Categoria.encontrarTodos()
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* GET categoria por ID. */
router.get('/:categoriaID', async function(req, res) {
  try {
    const resultado = await Categoria.encontrarPorId(req.params.categoriaID)
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
