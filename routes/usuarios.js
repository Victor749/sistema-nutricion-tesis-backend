var express = require('express');
var router = express.Router();
var Usuario = require('../models/usuario');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('GET de Usuarios');
});

/* POST nuevo usuario. */
router.post('/', async function (req, res) {
  const result = await Usuario.crear(req.body)
  res.json(result)
})

module.exports = router;
