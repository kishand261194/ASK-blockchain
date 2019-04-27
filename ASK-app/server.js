
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// App
const path = require('path');
const app = express();
// Personals libs
const db = require('./models/db');
// Middelware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/public', express.static('public'));
app.use(express.static(path.join(__dirname, '../ASK-blockchain/build/contracts')));
// Configuration settings
app.set('view engine', 'ejs');
// Variables
const port = 3000;
// Routes
const routes = require('./routes')(app);

app.listen(port, err => console.log( err ? `An error has ocurred! ${err}` : `App running on port ${port}` ) );
