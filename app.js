'use strict'

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const portfolioRouter = require('./routes/portfolio');

let link_data = require('./data/links.json');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/portfolio', portfolioRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;

    // Non verbose debug
    // res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.locals.error = {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', {title: "Error"});
});

// Store initial link_data from stored json file
app.locals.link_data = link_data;

// This is required for the navbar to generate the categories
app.locals.categories = require("./data/categories");

module.exports = app;