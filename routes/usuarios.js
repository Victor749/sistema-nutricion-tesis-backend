var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:usuarios');
var Usuario = require('../models/usuario');

/* GET lista de usuarios. */
/*router.get('/', async function(req, res) {
  try {
    const resultado = await Usuario.encontrarTodos()
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});*/

/* GET usuario por ID. */
router.get('/:usuarioID', async function(req, res) {
  try {
    const resultado = await Usuario.encontrarPorId(req.params.usuarioID)
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

/* GET usuario por email. */
/*router.get('/email/:email', async function(req, res) {
  try {
    const resultado = await Usuario.encontrarPorEmail(req.params.email)
    if (resultado.codigo === 404)  {
      res.status(404).send(resultado.error)
    } else {
      res.status(200).json(resultado)
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});*/

/* POST nuevo usuario. */
router.post('/', async function (req, res) {
  try {
    const resultado = await Usuario.crear(req.body)
    if (resultado.codigo === 400) {
      res.status(400).send(resultado.error)
    } else {
      res.status(201).json(resultado)
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
})

/* PUT editar usuario. */
router.put('/:usuarioID', async function (req, res) {
  try {
    const resultado = await Usuario.actualizar(req.params.usuarioID, req.body)
    if (resultado.codigo === 400)  {
      res.status(400).send(resultado.error)
    } else if (resultado.codigo === 404) {
      res.status(404).send(resultado.error)
    } else {
      res.status(200).json(resultado)
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
})

/* DELETE eliminar usuario. */
router.delete('/:usuarioID', async function (req, res) {
  try {
    const resultado = await Usuario.eliminar(req.params.usuarioID)
    if (resultado.codigo === 404) {
      res.status(404).send(resultado.error)
    } else {
      res.status(200).send(resultado)
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
})

module.exports = router;
