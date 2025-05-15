var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var cors = require('cors'); 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
    cors({
        origin: 'http://localhost:8080', 
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true, 
    })
);

app.use(
    session({
        secret: 'jwpe34',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;