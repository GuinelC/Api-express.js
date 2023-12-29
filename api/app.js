var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerUi = require('swagger-ui-express');
var swaggerFile = require('./swagger_output.json');

var app = express();

// Routing
var indexRouter = require('./routes');
var terrainRouter = require('./routes/terrain');
var reservationRouter = require('./routes/reservation');
var userRouter = require('./routes/user');
var loginRouter = require('./routes/login');
var adminTerrainRouter = require('./routes/adminTerrain');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Enregistrement des routes
 */
app.use('/', indexRouter);
app.use('/terrain', terrainRouter);
app.use('/user', userRouter);
app.use('/reservation', reservationRouter);
app.use('/login', loginRouter);
app.use('/adminTerrain', adminTerrainRouter);

/**
 * Configuration Swagger, exposition de la doc sur la route /doc
 */
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('Error');
});

module.exports = app;
