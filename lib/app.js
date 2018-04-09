import 'babel-polyfill'
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import lessMiddleware from "less-middleware";
import logger from "morgan";
import basicAuth from "express-basic-auth";
import indexRouter from "./routes/index";
import dotenv from "dotenv";
import fs from "fs";

const envFile = './docker-compose.env';
if (fs.existsSync(envFile)) {
  dotenv.config({path: envFile})
}

const app = express();

// view engine setup
app.set('../views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

const users = {};
users[process.env.BASIC_AUTH_USER || 'changeit'] =  process.env.BASIC_AUTH_PASSWORD || 'changeit';
app.use(basicAuth({
  users,
  challenge: true,
  realm: "Strapdata CI"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public')));

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
