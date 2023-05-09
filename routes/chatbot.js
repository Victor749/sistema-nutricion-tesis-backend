var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:chatbot');
var Chatbot = require('../models/chatbot');

/* POST hacer pregunta. */
router.post('/usuario/:usuarioID', async function(req, res) {
    try {
        const resultado = await Chatbot.hacerPregunta(req.params.usuarioID, req.body)
        if (resultado.codigo === 400)  {
            res.status(400).send(resultado.error)
        } else {
            res.status(200).json(resultado)
        }
    } catch (error) {
        debug(error)
        res.status(500).send('Mil disculpas, ocurrió algo inesperado. Error en el servidor.')
    }
});

/* GET Historial de preguntas. */
router.get('/historial/usuario/:usuarioID', async function(req, res) {
    try {
        const resultado = await Chatbot.historialPreguntas(req.params.usuarioID, req.query.limite, req.query.pagina)
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

module.exports = router;