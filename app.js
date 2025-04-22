const express = require('express');
var path = require('path');
const bodyParser = require('body-parser');
const createError = require('http-errors');
const app = express();
const port = 3000;

// db(MySQL) connect
// const db = require('./lib/db');
// db.connect();

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));

const indexRouter = require('./router');
app.use('/', indexRouter);

const testRouter = require('./router/test');
app.use('/test', testRouter);

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

var server = app.listen(port, function() {
  let host = server.address().address;
  // let port = server.address().port;

  console.log('Server is working : HOST[', host, '] PORT[', port, ']');
});

module.exports = app;

//app.listen(port, () => {
//  console.log(`Server running at http://localhost:${port}`);
//});

