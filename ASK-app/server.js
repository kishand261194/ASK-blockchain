const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const express = require('express');
// App
const path = require('path');
const app = express();
// Personals libs
const db = require('./models/db');
// Middelware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/public', express.static('public'));
// Configuration settings
app.set('view engine', 'ejs');
// Variables
const port = 3000;
// Routes
app.use(express.static(path.join(__dirname, '../ASK-blockchain/build/contracts')));
app.use('/users', express.static(path.join(__dirname, '../ASK-blockchain/build/contracts')));

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

const routes = require('./routes')(app);

app.listen(port, err => console.log( err ? `An error has ocurred! ${err}` : `App running on port ${port}` ) );
