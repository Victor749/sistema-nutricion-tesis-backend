var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:restricciones');
var RestriccionAlimento = require('../models/restriccionAlimento');
var RestriccionIngrediente = require('../models/restriccionIngrediente');

/* GET lista de restricciones alimenticias de un usuario (alimentos). */
router.get('/restriccionAlimento/:usuarioID', async function(req, res) {
    try {
      const resultado = await RestriccionAlimento.verRestriccionesAlimento(req.params.usuarioID)
      res.status(200).json(resultado)
    } catch (error) {
      debug(error)
      res.status(500).send('Error en el servidor.')
    }
});
  
/* POST agregar restriccion alimenticia (alimento). */
router.post('/restriccionAlimento/:usuarioID', async function (req, res) {
    try {
        const resultado = await RestriccionAlimento.agregarRestriccionAlimento(req.params.usuarioID, req.body)
        if (resultado.codigo === 400)  {
            res.status(400).send(resultado.error)
        } else if (resultado.codigo === 404)  {
            res.status(404).send(resultado.error)
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
        const resultado = await RestriccionAlimento.quitarRestriccionAlimento(req.params.usuarioID, req.body)
        if (resultado.codigo === 400)  {
            res.status(400).send(resultado.error)
        } else if (resultado.codigo === 404)  {
            res.status(404).send(resultado.error)
        } else {
            res.status(200).send(resultado)
        }
    } catch (error) {
        debug(error)
        res.status(500).send('Error en el servidor.')
    }
})

/* GET lista de restricciones alimenticias de un usuario (ingredientes). */
router.get('/restriccionIngrediente/:usuarioID', async function(req, res) {
    try {
        const resultado = await RestriccionIngrediente.verRestriccionesIngrediente(req.params.usuarioID)
        res.status(200).json(resultado)
    } catch (error) {
        debug(error)
        res.status(500).send('Error en el servidor.')
    }
});

/* POST agregar restriccion alimenticia (ingrediente). */
router.post('/restriccionIngrediente/:usuarioID', async function (req, res) {
    try {
        const resultado = await RestriccionIngrediente.agregarRestriccionIngrediente(req.params.usuarioID, req.body)
        if (resultado.codigo === 400)  {
            res.status(400).send(resultado.error)
        } else if (resultado.codigo === 404)  {
            res.status(404).send(resultado.error)
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
        const resultado = await RestriccionIngrediente.quitarRestriccionIngrediente(req.params.usuarioID, req.body)
        if (resultado.codigo === 400)  {
            res.status(400).send(resultado.error)
        } else if (resultado.codigo === 404)  {
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
