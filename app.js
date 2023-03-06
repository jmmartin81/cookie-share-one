const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const cors = require('cors');
const app = express();
app.use(cors({
  //app1 and app2
  origin:['https://8697-2803-9800-909f-80fc-dcf9-acb5-6acb-3c25.sa.ngrok.io','https://1349-2803-9800-909f-80fc-dcf9-acb5-6acb-3c25.sa.ngrok.io'],
  credentials: true, // allow share cookies
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

module.exports = app;
