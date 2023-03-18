var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:usuarios');
var Usuario = require('../models/usuario');

/* GET lista de usuarios. */
router.get('/', async function(req, res) {
  try {
    const resultado = await Usuario.encontrarTodos()
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* GET usuario por ID. */
router.get('/:usuarioID', async function(req, res) {
  try {
    const resultado = await Usuario.encontrarPorId(req.params.usuarioID)
    if (resultado === 404)  {
      res.status(404).send('Usuario no encontrado.')
    } else {
      res.status(200).json(resultado)
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* POST nuevo usuario. */
router.post('/', async function (req, res) {
  try {
    const resultado = await Usuario.crear(req.body)
    res.status(201).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
})

/* PUT editar usuario. */
router.put('/:usuarioID', async function (req, res) {
  try {
    const resultado = await Usuario.actualizar(req.params.usuarioID, req.body)
    if (resultado === 404)  {
      res.status(404).send('Usuario no encontrado.')
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
    if (resultado === 404)  {
      res.status(404).send('Usuario no encontrado.')
    } else {
      res.status(200).send('Usuario eliminado con éxito.')
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
})

/* GET lista de restricciones alimenticias de un usuario (alimentos). */
router.get('/restriccionAlimento/:usuarioID', async function(req, res) {
  try {
    const resultado = await Usuario.verRestriccionesAlimento(req.params.usuarioID)
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* POST agregar restriccion alimenticia (alimento). */
router.post('/restriccionAlimento/:usuarioID', async function (req, res) {
  try {
    const resultado = await Usuario.agregarRestriccionAlimento(req.params.usuarioID, req.body)
    if (resultado === 404)  {
      res.status(404).send('Usuario o alimento no encontrado(s).')
    } else {
      res.status(201).json(resultado)
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
})

/* DELETE quitar restriccion alimenticia (alimento). */
router.delete('/restriccionAlimento/:usuarioID', async function (req, res) {
  try {
    const resultado = await Usuario.quitarRestriccionAlimento(req.params.usuarioID, req.body)
    if (resultado === 404)  {
      res.status(404).send('Restricción, usuario o alimento no encontrado(s).')
    } else {
      res.status(200).send('Restricción quitada con éxito.')
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
})

/* GET lista de restricciones alimenticias de un usuario (ingredientes). */
router.get('/restriccionIngrediente/:usuarioID', async function(req, res) {
  try {
    const resultado = await Usuario.verRestriccionesIngrediente(req.params.usuarioID)
    res.status(200).json(resultado)
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
});

/* POST agregar restriccion alimenticia (ingrediente). */
router.post('/restriccionIngrediente/:usuarioID', async function (req, res) {
  try {
    const resultado = await Usuario.agregarRestriccionIngrediente(req.params.usuarioID, req.body)
    if (resultado === 404)  {
      res.status(404).send('Usuario o ingrediente no encontrado(s).')
    } else {
      res.status(201).json(resultado)
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
})

/* DELETE quitar restriccion alimenticia (ingrediente). */
router.delete('/restriccionIngrediente/:usuarioID', async function (req, res) {
  try {
    const resultado = await Usuario.quitarRestriccionIngrediente(req.params.usuarioID, req.body)
    if (resultado === 404)  {
      res.status(404).send('Restricción, usuario o ingrediente no encontrado(s).')
    } else {
      res.status(200).send('Restricción quitada con éxito.')
    }
  } catch (error) {
    debug(error)
    res.status(500).send('Error en el servidor.')
  }
})

module.exports = router;
