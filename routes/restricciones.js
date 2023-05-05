var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:restricciones');
var RestriccionAlimento = require('../models/restriccionAlimento');
var RestriccionCategoria = require('../models/restriccionCategoria');
var RestriccionEtiqueta = require('../models/restriccionEtiqueta');

/* GET lista de restricciones alimenticias de un usuario (alimentos). */
router.get('/restriccionAlimento/usuario/:usuarioID', async function(req, res) {
    try {
      const resultado = await RestriccionAlimento.verRestriccionesAlimento(req.params.usuarioID)
      res.status(200).json(resultado)
    } catch (error) {
      debug(error)
      res.status(500).send('Error en el servidor.')
    }
});
  
/* POST agregar restriccion alimenticia (alimento). */
router.post('/restriccionAlimento/usuario/:usuarioID/alimento/:alimentoID', async function (req, res) {
    try {
        const resultado = await RestriccionAlimento.agregarRestriccionAlimento(req.params.usuarioID, req.params.alimentoID, req.body)
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
router.delete('/restriccionAlimento/usuario/:usuarioID/alimento/:alimentoID', async function (req, res) {
    try {
        const resultado = await RestriccionAlimento.quitarRestriccionAlimento(req.params.usuarioID, req.params.alimentoID)
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

/* GET lista de restricciones alimenticias de un usuario (categoria). */
router.get('/restriccionCategoria/usuario/:usuarioID', async function(req, res) {
    try {
        const resultado = await RestriccionCategoria.verRestriccionesCategorias(req.params.usuarioID)
        res.status(200).json(resultado)
    } catch (error) {
        debug(error)
        res.status(500).send('Error en el servidor.')
    }
});

/* POST agregar restricciones alimenticia (categorias). */
router.post('/restriccionCategoria/usuario/:usuarioID', async function (req, res) {
    try {
        const resultado = await RestriccionCategoria.agregarRestriccionesCategorias(req.params.usuarioID, req.body)
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

/* DELETE quitar restriccion alimenticia (categoria). */
router.delete('/restriccionCategoria/usuario/:usuarioID/categoria/:categoriaID', async function (req, res) {
    try {
        const resultado = await RestriccionCategoria.quitarRestriccionCategoria(req.params.usuarioID, req.params.categoriaID)
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

/* GET lista de restricciones alimenticias de un usuario (etiquetas). */
router.get('/restriccionEtiqueta/usuario/:usuarioID', async function(req, res) {
    try {
        const resultado = await RestriccionEtiqueta.verRestriccionesEtiquetas(req.params.usuarioID)
        res.status(200).json(resultado)
    } catch (error) {
        debug(error)
        res.status(500).send('Error en el servidor.')
    }
});

/* GET verificar restricciones alimenticias (etiquetas). */
router.get('/restriccionEtiqueta/verificar', async function (req, res) {
    try {
        const resultado = await RestriccionEtiqueta.verificarRestriccionesEtiquetas(req.body)
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

/* POST agregar restricciones alimenticia (etiquetas). */
router.post('/restriccionEtiqueta/usuario/:usuarioID', async function (req, res) {
    try {
        const resultado = await RestriccionEtiqueta.agregarRestriccionesEtiquetas(req.params.usuarioID, req.body)
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

/* DELETE quitar restriccion alimenticia (etiquetas). */
router.delete('/restriccionEtiqueta/usuario/:usuarioID/etiqueta/:etiqueta', async function (req, res) {
    try {
        const resultado = await RestriccionEtiqueta.quitarRestriccionEtiqueta(req.params.usuarioID, req.params.etiqueta)
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
