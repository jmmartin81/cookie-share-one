var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var sendCookieRouter = require('./routes/sendCookies');
var createCookieRouter = require('./routes/createCookies');

var cors = require('cors');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var allowedOrigins = ['https://aa52-2803-9800-909f-80fc-71aa-e3e7-c5c2-33ed.sa.ngrok.io',//3001
                      'https://fe4e-2803-9800-909f-80fc-71aa-e3e7-c5c2-33ed.sa.ngrok.io'];//3002;
// app.use(cors({
//   exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
//   //credentials: true,
//  // origin: 
//   // function(origin, callback){
//   //   // allow requests with no origin 
//   //   // (like mobile apps or curl requests)
//   //   if(!origin) return callback(null, true);
//   //   if(allowedOrigins.indexOf(origin) === -1){
//   //     var msg = 'The CORS policy for this site does not ' +
//   //               'allow access from the specified Origin.';
//   //     return callback(new Error(msg), false);
//   //   }
//   //   return callback(null, true);
//   // }
// }));



app.use('/', indexRouter);
//app.use('/sendCookies', sendCookieRouter);
//app.use('/createCookies', createCookieRouter);

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

app.use(cors({
  origin:allowedOrigins,
  credentials: true,
 // origin: 
  // function(origin, callback){
  //   // allow requests with no origin 
  //   // (like mobile apps or curl requests)
  //   if(!origin) return callback(null, true);
  //   if(allowedOrigins.indexOf(origin) === -1){
  //     var msg = 'The CORS policy for this site does not ' +
  //               'allow access from the specified Origin.';
  //     return callback(new Error(msg), false);
  //   }
  //   return callback(null, true);
  // }
}));

module.exports = app;
