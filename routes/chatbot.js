var express = require('express');
var router = express.Router();
var debug = require('debug')('sistema-nutricion-tesis-backend:chatbot');
var Chatbot = require('../models/chatbot');

/* GET hacer pregunta. */
router.get('/', async function(req, res) {
    try {
        const resultado = await Chatbot.hacerPregunta(req.body)
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