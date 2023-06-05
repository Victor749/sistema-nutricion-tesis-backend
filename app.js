var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var indexRouter = require('./routes/index');
var usuariosRouter = require('./routes/usuarios');
var restriccionesRouter = require('./routes/restricciones');
var ingredientesRouter = require('./routes/ingredientes');
var categoriasRouter = require('./routes/categorias');
var empresasRouter = require('./routes/empresas');
var marcasRouter = require('./routes/marcas');
var nutrientesRouter = require('./routes/nutrientes');
var unidadesRouter = require('./routes/unidades');
var alimentosRouter = require('./routes/alimentos');
var sustitucionesRouter = require('./routes/sustituciones');
var chatbotRouter = require('./routes/chatbot');
var aportesARequerimientosDiariosRouter = require('./routes/aportesARequerimientosDiarios');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/usuarios', usuariosRouter);
app.use('/restricciones', restriccionesRouter);
app.use('/ingredientes', ingredientesRouter);
app.use('/categorias', categoriasRouter);
app.use('/empresas', empresasRouter);
app.use('/marcas', marcasRouter);
app.use('/nutrientes', nutrientesRouter);
app.use('/unidades', unidadesRouter);
app.use('/alimentos', alimentosRouter);
app.use('/sustituciones', sustitucionesRouter);
app.use('/chatbot', chatbotRouter);
app.use('/aportes', aportesARequerimientosDiariosRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
