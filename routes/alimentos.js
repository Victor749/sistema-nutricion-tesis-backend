var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:alimentos');
var Alimento = require('../models/alimento');

/* GET lista de alimentos. */
router.get('/', async function(req, res) {
  try {
    const resultado = await Alimento.encontrarTodos()
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* GET buscar alimentos por nombre. */
router.get('/buscar/', async function(req, res) {
  try {
    const resultado = await Alimento.buscar(req.query.cadenaBusqueda, req.query.limite, req.query.pagina)
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

/* GET buscar filtrar y ordenar alimentos por distintos atributos. */
router.get('/filtrarYOrdenar/', async function(req, res) {
  try {
    const resultado = await Alimento.filtrarYOrdenar(req.query.filtro, req.query.valorFiltro, req.query.orden, 
                                                    req.query.ordenSentido, req.query.limite, req.query.pagina)
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

/* GET alimento por ID. */
router.get('/:alimentoID', async function(req, res) {
  try {
    const resultado = await Alimento.encontrarPorId(req.query.usuarioID, req.params.alimentoID)
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
