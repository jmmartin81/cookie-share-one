var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var cors = require('cors');
var app = express();
app.use(cors({
  origin:[' https://19f2-2803-9800-909f-80fc-69f8-103c-d1d-9dd1.sa.ngrok.io','https://465f-2803-9800-909f-80fc-69f8-103c-d1d-9dd1.sa.ngrok.io']  ,// callback expects two parameters: error and options,
  credentials: true, // Permitir el intercambio de cookies
  // exposedHeaders: ['Content-Length', 'Authorization', 'X-Powered-By'], // Cabeceras expuestas en la respuesta
  // methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos en la solicitud
  // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // Cabeceras permitidas en la solicitud
}));

// Configuración de cabeceras "Forwarded" y "X-Forwarded-For"
//app.set('trust proxy', true);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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

// var allowedOrigins = ['https://aa52-2803-9800-909f-80fc-71aa-e3e7-c5c2-33ed.sa.ngrok.io',//3001
//                       'https://fe4e-2803-9800-909f-80fc-71aa-e3e7-c5c2-33ed.sa.ngrok.io'];//3002;
// app.use(cors({
//   origin:['http://localhost:3001/','http://localhost:3002/'] ,// callback expects two parameters: error and options,
//   credentials: true,
//  // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
 
// }));



module.exports = app;
